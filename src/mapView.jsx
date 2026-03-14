// src/MapView.jsx
import { useCallback, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '16px',
  overflow: 'hidden',
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // fallback (San Francisco)

function MapView() {
  const [center, setCenter] = useState(defaultCenter);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  }, []);

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
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}

export default MapView;