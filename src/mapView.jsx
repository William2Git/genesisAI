// src/MapView.jsx
import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '16px',
  overflow: 'hidden',
};

const fullScreenContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: 0,
  overflow: 'hidden',
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // fallback (San Francisco)

function MapView({ destination, onNearbyPlaces, onUserLocationChange, fullScreen }) {
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);
  const [placesLoading, setPlacesLoading] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'marker'],
  });

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(loc);
        setCenter(loc);
        onUserLocationChange?.(loc);
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  }, [onUserLocationChange]);

  // If a destination is chosen but we don't yet have the user's location,
  // automatically request it so "Show Route" works even if clicked first.
  useEffect(() => {
    if (!destination || userLocation) return;
    requestUserLocation();
  }, [destination, userLocation, requestUserLocation]);

  // Fetch real nearby restaurants, then enrich with opening_hours and photo (Place Details).
  useEffect(() => {
    if (!isLoaded || !map || !userLocation || typeof onNearbyPlaces !== 'function') return;

    setPlacesLoading(true);
    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location: userLocation,
        radius: 1500,
        type: 'restaurant',
      },
      (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results || !results.length) {
          setPlacesLoading(false);
          onNearbyPlaces([]);
          return;
        }

        const filteredResults = results.filter((place) => {
          const types = place.types || [];
          const name = (place.name || '').toLowerCase();
          const hasHotelType = types.some((t) => ['lodging', 'hotel', 'hostel', 'resort'].includes(t));
          const hasHotelName = name.includes('hotel') || name.includes('hostel') || name.includes('resort');
          return !hasHotelType && !hasHotelName;
        });

        const top = filteredResults.slice(0, 10);
        const enriched = new Array(top.length);
        let pending = top.length;

        function done() {
          setPlacesLoading(false);
          onNearbyPlaces(enriched.filter(Boolean));
        }

        top.forEach((place, index) => {
          service.getDetails(
            { placeId: place.place_id, fields: ['opening_hours', 'photos'] },
            (detail, detailStatus) => {
              const next = { ...place };
              if (detailStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
                if (detail.opening_hours) next.opening_hours = detail.opening_hours;
                if (detail.photos && detail.photos[0])
                  next.photoUrl = detail.photos[0].getUrl({ maxWidth: 400 });
              }
              enriched[index] = next;
              pending -= 1;
              if (pending === 0) done();
            }
          );
        });
      }
    );
  }, [isLoaded, map, userLocation, onNearbyPlaces]);

  // Once we have both user location and destination, fetch and render directions.
  useEffect(() => {
    if (!isLoaded || !userLocation || !destination) {
      setDirections(null);
      return;
    }

    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin: userLocation,
        destination,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        } else {
          console.error('Directions request failed due to', status);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, userLocation, destination]);

  // Create / update an Advanced Marker tied to the current center
  useEffect(() => {
    if (!map || !window.google || !window.google.maps || !window.google.maps.marker) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    const marker = new AdvancedMarkerElement({
      map,
      position: center,
    });

    return () => {
      marker.map = null;
    };
  }, [map, center]);

  if (loadError) return <div>Failed to load map.</div>;
  if (!isLoaded) return <div>Loading map…</div>;

  const style = fullScreen ? fullScreenContainerStyle : containerStyle;

  return (
    <div className={fullScreen ? 'fdf-map-view-fullscreen' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {!fullScreen && (
        <button
          type="button"
          onClick={requestUserLocation}
          className="fdf-btn fdf-btn-secondary"
          style={{ alignSelf: 'flex-start' }}
        >
          Use My Location
        </button>
      )}
      <GoogleMap
        mapContainerStyle={style}
        center={center}
        zoom={14}
        options={{
          disableDefaultUI: false,
          clickableIcons: true,
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
        }}
        onLoad={setMap}
        onUnmount={() => setMap(null)}
      >
        {userLocation && <Marker position={userLocation} label="You" />}
        {destination && <Marker position={destination} label="Food" />}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}

export default MapView;