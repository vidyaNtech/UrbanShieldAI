import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KARNATAKA_DISTRICTS, KARNATAKA_STATE_CENTER } from '../../data/karnatakaDistricts';
import { MapPin, Navigation, Compass, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

interface LocationPickerProps {
  district: string;
  cityOrTown: string;
  area: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
  locationVerified: boolean;
  onChange: (fields: {
    district?: string;
    cityOrTown?: string;
    area?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    locationVerified?: boolean;
  }) => void;
  errors?: Record<string, string>;
}

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  district,
  cityOrTown,
  area,
  landmark,
  latitude,
  longitude,
  locationVerified,
  onChange,
  errors = {}
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  // Default coordinate if none selected: Bengaluru or district center
  const currentLat = latitude ?? 12.9716;
  const currentLng = longitude ?? 77.5946;

  // Custom icon for the incident pin
  const createPinIcon = useCallback(() => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          width: 38px;
          height: 38px;
          background: #0d9488;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
        ">
          <div style="
            width: 14px;
            height: 14px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -36]
    });
  }, []);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const initialCenter: [number, number] = [currentLat, currentLng];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: latitude && longitude ? 14 : 11,
        minZoom: 6,
        maxZoom: 18,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Add draggable marker
      const marker = L.marker(initialCenter, {
        draggable: true,
        icon: createPinIcon()
      }).addTo(map);

      marker.bindTooltip('Drag or click map to adjust exact hazard location', {
        permanent: false,
        direction: 'top'
      });

      // Handle marker drag
      marker.on('dragend', (e) => {
        const markerInstance = e.target as L.Marker;
        const pos = markerInstance.getLatLng();
        onChange({
          latitude: parseFloat(pos.lat.toFixed(6)),
          longitude: parseFloat(pos.lng.toFixed(6)),
          locationVerified: false // Manually placed
        });
        setGeoNotice({
          type: 'info',
          message: `Incident pin moved manually to [${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}].`
        });
      });

      // Handle map click
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChange({
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
          locationVerified: false
        });
        setGeoNotice({
          type: 'info',
          message: `Location set to [${lat.toFixed(5)}, ${lng.toFixed(5)}]. Drag pin if fine-tuning is needed.`
        });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } catch (err) {
      console.error('Failed to initialize location picker map', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [createPinIcon, onChange]);

  // 2. React to external coordinate updates
  useEffect(() => {
    if (markerRef.current && latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // 3. District selector change
  const handleDistrictChange = (selectedDistName: string) => {
    const distData = KARNATAKA_DISTRICTS.find(d => d.name.toLowerCase() === selectedDistName.toLowerCase());
    if (distData) {
      onChange({
        district: distData.name,
        latitude: distData.center[0],
        longitude: distData.center[1],
        locationVerified: false
      });

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView(distData.center, 12, { animate: true });
        markerRef.current.setLatLng(distData.center);
      }
      setGeoNotice({
        type: 'info',
        message: `Centered map on ${distData.name} headquarters. Tap or drag the pin to your specific street.`
      });
    } else {
      onChange({ district: selectedDistName });
    }
  };

  // 4. "Use My Location" Geolocation action
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice({
        type: 'warning',
        message: 'Browser Geolocation is not supported by your current browser. Please pick your location directly on the map.'
      });
      return;
    }

    setGeoLoading(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const userLat = parseFloat(position.coords.latitude.toFixed(6));
        const userLng = parseFloat(position.coords.longitude.toFixed(6));

        // Check if inside or near Karnataka bounds roughly [11.5 to 18.5 Lat, 74.0 to 78.6 Lng]
        const isNearKarnataka = userLat >= 11.0 && userLat <= 19.0 && userLng >= 73.5 && userLng <= 79.0;

        onChange({
          latitude: userLat,
          longitude: userLng,
          locationVerified: true
        });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([userLat, userLng], 15, { animate: true });
          markerRef.current.setLatLng([userLat, userLng]);
        }

        if (isNearKarnataka) {
          setGeoNotice({
            type: 'success',
            message: `Accurate device GPS coordinates detected [${userLat}, ${userLng}] with ±${Math.round(position.coords.accuracy)}m precision.`
          });
        } else {
          setGeoNotice({
            type: 'info',
            message: `Detected device coordinates [${userLat}, ${userLng}]. If this is outside Karnataka, please select your incident district.`
          });
        }
      },
      (error) => {
        setGeoLoading(false);
        let msg = 'Unable to retrieve your current location. Please pick your position on the map.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can manually drag the pin or click anywhere on the map to mark the problem location.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location signal unavailable. Please use the interactive map picker or enter street details manually.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please click on the map to pinpoint your location.';
        }
        setGeoNotice({
          type: 'warning',
          message: msg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  return (
    <div className="location-picker-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Geolocation Notice Banner */}
      {geoNotice && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: geoNotice.type === 'success' 
              ? 'rgba(16, 185, 129, 0.1)' 
              : geoNotice.type === 'warning' 
                ? 'rgba(245, 158, 11, 0.1)' 
                : 'rgba(13, 148, 136, 0.08)',
            border: `1px solid ${
              geoNotice.type === 'success' 
                ? '#10b981' 
                : geoNotice.type === 'warning' 
                  ? '#f59e0b' 
                  : '#0d9488'
            }`,
            color: 'var(--text-main, #1e293b)',
            fontSize: '0.875rem',
            lineHeight: 1.45
          }}
        >
          {geoNotice.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertCircle size={18} style={{ color: geoNotice.type === 'warning' ? '#f59e0b' : '#0d9488', flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>{geoNotice.message}</div>
          <button
            type="button"
            onClick={() => setGeoNotice(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #64748b)',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Form Fields Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* State (Fixed) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.375rem' }}>
            State <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value="Karnataka"
            disabled
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--bg-muted, #f1f5f9)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: 'var(--radius-md, 6px)',
              color: 'var(--text-muted, #64748b)',
              fontWeight: 500
            }}
          />
        </div>

        {/* District Selector */}
        <div>
          <label 
            htmlFor="district-select"
            style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.375rem' }}
          >
            Karnataka District <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id="district-select"
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: errors.district ? '1.5px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
              borderRadius: 'var(--radius-md, 6px)',
              color: 'var(--text-main, #1e293b)',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            <option value="">Select Karnataka District...</option>
            {KARNATAKA_DISTRICTS.map(d => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.kannadaName})
              </option>
            ))}
          </select>
          {errors.district && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.district}</p>
          )}
        </div>

        {/* City / Town */}
        <div>
          <label 
            htmlFor="city-input"
            style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.375rem' }}
          >
            City / Town / Taluk <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="city-input"
            type="text"
            placeholder="e.g. Bengaluru, Hubballi, Mysuru..."
            value={cityOrTown}
            onChange={(e) => onChange({ cityOrTown: e.target.value })}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: errors.cityOrTown ? '1.5px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
              borderRadius: 'var(--radius-md, 6px)',
              color: 'var(--text-main, #1e293b)',
              fontSize: '0.875rem'
            }}
          />
          {errors.cityOrTown && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.cityOrTown}</p>
          )}
        </div>

        {/* Area / Street / Locality */}
        <div>
          <label 
            htmlFor="area-input"
            style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.375rem' }}
          >
            Area / Street / Locality <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="area-input"
            type="text"
            placeholder="e.g. Outer Ring Road, 100ft Road, Ward 150"
            value={area}
            onChange={(e) => onChange({ area: e.target.value })}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: errors.area ? '1.5px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
              borderRadius: 'var(--radius-md, 6px)',
              color: 'var(--text-main, #1e293b)',
              fontSize: '0.875rem'
            }}
          />
          {errors.area && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.area}</p>
          )}
        </div>

        {/* Landmark (Optional) */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label 
            htmlFor="landmark-input"
            style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.375rem' }}
          >
            Nearest Landmark or Reference (Optional)
          </label>
          <input
            id="landmark-input"
            type="text"
            placeholder="e.g. Opposite Metro Pillar 142, near Silk Board junction bus shelter"
            value={landmark}
            onChange={(e) => onChange({ landmark: e.target.value })}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: 'var(--radius-md, 6px)',
              color: 'var(--text-main, #1e293b)',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Interactive Map Section */}
      <div 
        style={{
          border: '1px solid var(--border-color, #cbd5e1)',
          borderRadius: 'var(--radius-md, 8px)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card, #ffffff)',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))'
        }}
      >
        {/* Map Header Action Bar */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-muted, #f8fafc)',
            borderBottom: '1px solid var(--border-color, #cbd5e1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} style={{ color: '#0d9488' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
              Interactive Location Pinpoint
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
              (Click map or drag the pin to set the exact spot)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.75rem',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md, 6px)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: geoLoading ? 'not-allowed' : 'pointer',
                opacity: geoLoading ? 0.7 : 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <Navigation size={14} className={geoLoading ? 'animate-spin' : ''} />
              {geoLoading ? 'Detecting GPS...' : 'Use My Location'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView(KARNATAKA_STATE_CENTER, 7);
                }
              }}
              title="Reset view to entire Karnataka"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.45rem 0.65rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: 'var(--radius-md, 6px)',
                color: 'var(--text-muted, #64748b)',
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              State View
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          style={{ 
            height: '320px', 
            width: '100%',
            backgroundColor: '#e2e8f0',
            position: 'relative',
            zIndex: 1
          }} 
        />

        {/* Location Confirmation Footer */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-color, #cbd5e1)',
            fontSize: '0.8125rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} style={{ color: '#0d9488' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>Selected Coordinates:</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-muted, #475569)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
              {latitude !== undefined && longitude !== undefined
                ? `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`
                : '12.97160° N, 77.59460° E (Default)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {locationVerified ? (
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#065f46',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              >
                <CheckCircle2 size={13} /> Location Confirmed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onChange({
                    locationVerified: true,
                    latitude: currentLat,
                    longitude: currentLng
                  });
                  setGeoNotice({
                    type: 'success',
                    message: `Hazard coordinates [${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}] confirmed by user.`
                  });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={14} />
                Confirm This Location
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
