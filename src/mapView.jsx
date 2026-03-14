// src/MapView.jsx
import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '420px',
  borderRadius: '16px',
  overflow: 'hidden',
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // fallback (San Francisco)

function MapView({ destination }) {
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);

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
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  }, []);

  // If a destination is chosen but we don't yet have the user's location,
  // automatically request it so "Show Route" works even if clicked first.
  useEffect(() => {
    if (!destination || userLocation) return;
    requestUserLocation();
  }, [destination, userLocation, requestUserLocation]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button
        type="button"
        onClick={requestUserLocation}
        className="fdf-btn fdf-btn-secondary"
        style={{ alignSelf: 'flex-start' }}
      >
        Use My Location
      </button>
      <GoogleMap
        mapContainerStyle={containerStyle}
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