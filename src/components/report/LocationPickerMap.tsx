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
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [manualLatInput, setManualLatInput] = useState(latitude !== undefined ? String(latitude) : '');
  const [manualLngInput, setManualLngInput] = useState(longitude !== undefined ? String(longitude) : '');
  const [manualCoordError, setManualCoordError] = useState<string | null>(null);

  const hasCoordinates = typeof latitude === 'number' && !isNaN(latitude) && typeof longitude === 'number' && !isNaN(longitude);

  // Sync manual coordinate inputs when coordinates change externally (map click / GPS)
  useEffect(() => {
    if (typeof latitude === 'number' && !isNaN(latitude)) {
      setManualLatInput(latitude.toFixed(6));
    } else {
      setManualLatInput('');
    }
    if (typeof longitude === 'number' && !isNaN(longitude)) {
      setManualLngInput(longitude.toFixed(6));
    } else {
      setManualLngInput('');
    }
  }, [latitude, longitude]);

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

  const ensureMarkerAt = useCallback((map: L.Map, lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      return markerRef.current;
    }
    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: createPinIcon()
    }).addTo(map);

    marker.bindTooltip('Drag or click map to adjust exact hazard location', {
      permanent: false,
      direction: 'top'
    });

    marker.on('dragend', (e) => {
      const markerInstance = e.target as L.Marker;
      const pos = markerInstance.getLatLng();
      const nextLat = parseFloat(pos.lat.toFixed(6));
      const nextLng = parseFloat(pos.lng.toFixed(6));
      onChangeRef.current({
        latitude: nextLat,
        longitude: nextLng,
        locationVerified: false
      });
      setManualCoordError(null);
      setGeoNotice({
        type: 'info',
        message: `Incident pin moved to [${nextLat.toFixed(5)}, ${nextLng.toFixed(5)}]. Click "Confirm This Location" when ready.`
      });
    });

    markerRef.current = marker;
    return marker;
  }, [createPinIcon]);

  // 1. Initialize Map (runs once; never tears down on form input changes)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const initialDistrict = KARNATAKA_DISTRICTS.find(
        d => d.name.toLowerCase() === district.toLowerCase()
      );
      const initialCenter: [number, number] = hasCoordinates
        ? [latitude!, longitude!]
        : initialDistrict
          ? initialDistrict.center
          : KARNATAKA_STATE_CENTER;
      const initialZoom = hasCoordinates ? 14 : initialDistrict ? 11 : 7;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 6,
        maxZoom: 18,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      if (hasCoordinates) {
        ensureMarkerAt(map, latitude!, longitude!);
      }

      // Handle map click
      map.on('click', (e: L.LeafletMouseEvent) => {
        const nextLat = parseFloat(e.latlng.lat.toFixed(6));
        const nextLng = parseFloat(e.latlng.lng.toFixed(6));
        ensureMarkerAt(map, nextLat, nextLng);
        onChangeRef.current({
          latitude: nextLat,
          longitude: nextLng,
          locationVerified: false
        });
        setManualCoordError(null);
        setGeoNotice({
          type: 'info',
          message: `Pin placed at [${nextLat.toFixed(5)}, ${nextLng.toFixed(5)}]. Click "Confirm This Location" to verify.`
        });
      });

      mapInstanceRef.current = map;

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
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensureMarkerAt]);

  // 2. React to external coordinate updates (including clearing on reset)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hasCoordinates) {
      ensureMarkerAt(map, latitude!, longitude!);
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [hasCoordinates, latitude, longitude, ensureMarkerAt]);

  // 3. District selector change (centers map without inventing hazard coordinates)
  const handleDistrictChange = (selectedDistName: string) => {
    const distData = KARNATAKA_DISTRICTS.find(d => d.name.toLowerCase() === selectedDistName.toLowerCase());
    if (distData) {
      onChange({
        district: distData.name
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(distData.center, 12, { animate: true });
      }
      setGeoNotice({
        type: 'info',
        message: `Centered map on ${distData.name}. Tap the map, use GPS, enter coordinates manually, or click "Pin District Center" to set the location.`
      });
    } else {
      onChange({ district: selectedDistName });
    }
  };

  // 4. Explicit district headquarters pin action (never silent)
  const handlePinDistrictCenter = () => {
    const distData = KARNATAKA_DISTRICTS.find(d => d.name.toLowerCase() === district.toLowerCase());
    if (!distData) {
      setGeoNotice({
        type: 'warning',
        message: 'Please select a Karnataka district first before pinning its center.'
      });
      return;
    }
    const [lat, lng] = distData.center;
    onChange({
      latitude: lat,
      longitude: lng,
      locationVerified: false
    });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 13, { animate: true });
      ensureMarkerAt(mapInstanceRef.current, lat, lng);
    }
    setManualCoordError(null);
    setGeoNotice({
      type: 'info',
      message: `Pinned ${distData.name} headquarters [${lat.toFixed(5)}, ${lng.toFixed(5)}]. Drag the pin to your exact street and click "Confirm This Location".`
    });
  };

  // 5. Manual Latitude / Longitude entry handler
  const handleApplyManualCoordinates = () => {
    setManualCoordError(null);
    const parsedLat = parseFloat(manualLatInput.trim());
    const parsedLng = parseFloat(manualLngInput.trim());

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setManualCoordError('Please enter valid numeric Latitude and Longitude values.');
      return;
    }
    if (parsedLat < 11.0 || parsedLat > 19.0 || parsedLng < 73.5 || parsedLng > 79.5) {
      setManualCoordError('Coordinates must fall within Karnataka bounds (Latitude 11.0–19.0° N, Longitude 73.5–79.5° E).');
      return;
    }

    const cleanLat = parseFloat(parsedLat.toFixed(6));
    const cleanLng = parseFloat(parsedLng.toFixed(6));

    onChange({
      latitude: cleanLat,
      longitude: cleanLng,
      locationVerified: true
    });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([cleanLat, cleanLng], 15, { animate: true });
      ensureMarkerAt(mapInstanceRef.current, cleanLat, cleanLng);
    }
    setGeoNotice({
      type: 'success',
      message: `Manual coordinates [${cleanLat.toFixed(5)}, ${cleanLng.toFixed(5)}] applied and displayed on map.`
    });
  };

  // 6. "Use My Location" Geolocation action
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setShowManualCoords(true);
      setGeoNotice({
        type: 'warning',
        message: 'Browser Geolocation is not supported by your browser. Please click on the map or enter coordinates manually.'
      });
      return;
    }

    setGeoLoading(true);
    setGeoNotice(null);
    setManualCoordError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const userLat = parseFloat(position.coords.latitude.toFixed(6));
        const userLng = parseFloat(position.coords.longitude.toFixed(6));

        // Check if inside or near Karnataka bounds roughly [11.0 to 19.0 Lat, 73.5 to 79.5 Lng]
        const isNearKarnataka = userLat >= 11.0 && userLat <= 19.0 && userLng >= 73.5 && userLng <= 79.5;

        onChange({
          latitude: userLat,
          longitude: userLng,
          locationVerified: isNearKarnataka
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([userLat, userLng], 15, { animate: true });
          ensureMarkerAt(mapInstanceRef.current, userLat, userLng);
        }

        if (isNearKarnataka) {
          setGeoNotice({
            type: 'success',
            message: `Device GPS coordinates detected [${userLat.toFixed(5)}, ${userLng.toFixed(5)}] with ±${Math.round(position.coords.accuracy)}m precision.`
          });
        } else {
          setGeoNotice({
            type: 'warning',
            message: `Detected device coordinates [${userLat.toFixed(5)}, ${userLng.toFixed(5)}] appear outside Karnataka. Please click on the map or enter your Karnataka incident coordinates manually.`
          });
        }
      },
      (error) => {
        setGeoLoading(false);
        setShowManualCoords(true);
        let msg = 'Unable to retrieve your current location. Please pick your position on the map or enter coordinates manually.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can click anywhere on the map, enter coordinates manually, or pin your district center.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location signal is currently unavailable. Please use the interactive map picker or manual location entry below.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please click on the map or enter coordinates manually.';
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
              onClick={() => setShowManualCoords(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.45rem 0.65rem',
                backgroundColor: showManualCoords ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                border: `1px solid ${showManualCoords ? '#0d9488' : 'var(--border-color, #cbd5e1)'}`,
                borderRadius: 'var(--radius-md, 6px)',
                color: showManualCoords ? '#0f766e' : 'var(--text-main, #1e293b)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <MapPin size={14} />
              Manual Coordinates
            </button>

            {district && (
              <button
                type="button"
                onClick={handlePinDistrictCenter}
                title={`Pin ${district} headquarters on map`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.45rem 0.65rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: 'var(--radius-md, 6px)',
                  color: 'var(--text-main, #1e293b)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                <Compass size={14} />
                Pin District Center
              </button>
            )}

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

        {/* Manual Coordinates Entry Panel (for when GPS is unavailable or denied) */}
        {showManualCoords && (
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid var(--border-color, #cbd5e1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem'
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
              Enter Coordinates Manually (Karnataka: 11.0–19.0° N, 73.5–79.5° E)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 160px' }}>
                <label htmlFor="manual-lat-input" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #475569)', marginBottom: '0.25rem' }}>
                  Latitude (° N)
                </label>
                <input
                  id="manual-lat-input"
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 12.9716"
                  value={manualLatInput}
                  onChange={(e) => {
                    setManualLatInput(e.target.value);
                    setManualCoordError(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    borderRadius: 'var(--radius-md, 6px)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>

              <div style={{ flex: '1 1 160px' }}>
                <label htmlFor="manual-lng-input" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #475569)', marginBottom: '0.25rem' }}>
                  Longitude (° E)
                </label>
                <input
                  id="manual-lng-input"
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 77.5946"
                  value={manualLngInput}
                  onChange={(e) => {
                    setManualLngInput(e.target.value);
                    setManualCoordError(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    borderRadius: 'var(--radius-md, 6px)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleApplyManualCoordinates}
                style={{
                  padding: '0.5rem 0.9rem',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Apply Coordinates
              </button>
            </div>
            {manualCoordError && (
              <p role="alert" style={{ margin: 0, color: '#dc2626', fontSize: '0.75rem', fontWeight: 500 }}>
                {manualCoordError}
              </p>
            )}
          </div>
        )}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <MapPin size={16} style={{ color: '#0d9488' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>Selected Coordinates:</span>
            {hasCoordinates ? (
              <span style={{ fontFamily: 'monospace', color: 'var(--text-main, #0f172a)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                {latitude!.toFixed(5)}° N, {longitude!.toFixed(5)}° E
              </span>
            ) : (
              <span style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                Not selected yet — use GPS, click the map, or enter coordinates
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {locationVerified && hasCoordinates ? (
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
                disabled={!hasCoordinates}
                onClick={() => {
                  if (!hasCoordinates) return;
                  onChange({
                    locationVerified: true,
                    latitude,
                    longitude
                  });
                  setGeoNotice({
                    type: 'success',
                    message: `Hazard coordinates [${latitude!.toFixed(5)}, ${longitude!.toFixed(5)}] confirmed by user.`
                  });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: hasCoordinates ? '#0d9488' : '#cbd5e1',
                  color: hasCoordinates ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: hasCoordinates ? 'pointer' : 'not-allowed'
                }}
              >
                <CheckCircle2 size={14} />
                Confirm This Location
              </button>
            )}
          </div>
        </div>

        {/* Location Error Message */}
        {errors.location && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderTop: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.8125rem',
              fontWeight: 500
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errors.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
