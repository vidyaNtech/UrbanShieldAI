import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UrbanIncident, MapLayerType } from '../../types/incident';
import { KARNATAKA_STATE_CENTER, KARNATAKA_STATE_ZOOM, KARNATAKA_DISTRICTS } from '../../data/karnatakaDistricts';
import { getCategoryMeta } from '../../config/incidentCategories';
import { environmentalService } from '../../services/environmentalService';
import type { DistrictEnvironmentalProfile } from '../../types/environmental';
import { 
  AlertTriangle, 
  Navigation,
  Compass,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface RiskMapLeafletProps {
  incidents: UrbanIncident[];
  selectedIncident?: UrbanIncident;
  onSelectIncident: (incident: UrbanIncident) => void;
  activeLayer: MapLayerType;
  selectedDistrict?: string;
  focusCoordinates?: [number, number];
  focusZoom?: number;
  height?: string;
  onSelectDistrict?: (districtName: string) => void;
}

export const RiskMapLeaflet: React.FC<RiskMapLeafletProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  activeLayer,
  selectedDistrict,
  focusCoordinates,
  focusZoom,
  height = '580px',
  onSelectDistrict
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const overlayLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [envProfiles, setEnvProfiles] = useState<DistrictEnvironmentalProfile[]>(() => 
    environmentalService.getAllProfiles()
  );

  // Subscribe to environmental service updates
  useEffect(() => {
    return environmentalService.subscribe(() => {
      setEnvProfiles(environmentalService.getAllProfiles());
    });
  }, []);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: KARNATAKA_STATE_CENTER,
        zoom: KARNATAKA_STATE_ZOOM,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: false, // We provide accessible custom zoom controls
        attributionControl: false
      });

      // Add attribution control in bottom right
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Create layer groups for markers and overlays
      const overlayLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      markersLayerRef.current = markersLayer;
      overlayLayerRef.current = overlayLayer;
      mapInstanceRef.current = map;

      setMapReady(true);
    } catch (err) {
      console.error('Error initializing Leaflet map:', err);
      setTileError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Handle Base Tile Layer switching based on activeLayer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    try {
      let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
      let maxZoom = 19;

      if (activeLayer === 'satellite') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        maxZoom = 18;
      }

      const newTileLayer = L.tileLayer(tileUrl, {
        attribution,
        maxZoom,
        subdomains: activeLayer === 'satellite' ? [] : ['a', 'b', 'c']
      });

      newTileLayer.on('tileerror', () => {
        setTileError(true);
      });

      newTileLayer.on('load', () => {
        setTileError(false);
      });

      newTileLayer.addTo(map);
      tileLayerRef.current = newTileLayer;
    } catch (err) {
      setTileError(true);
    }
  }, [activeLayer, mapReady]);

  // 3. Render Thematic Layer Overlays (Flood Risk, Heat Risk, Environmental Multi-Hazard, Severity, Density)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const overlayGroup = overlayLayerRef.current;
    if (!map || !overlayGroup) return;

    overlayGroup.clearLayers();

    // Thematic visualization layers
    if (activeLayer === 'flood') {
      // Dynamic district-level flood risk halos based on live/measured rainfall + drainage blockages
      envProfiles.forEach(p => {
        const score = p.risk.flood.score;
        const color = score >= 75 ? '#1E40AF' : score >= 50 ? '#2563EB' : score >= 25 ? '#3B82F6' : '#93C5FD';
        const radius = Math.max(6000, score * 300);

        const circle = L.circle(p.coordinates, {
          radius,
          color,
          fillColor: color,
          fillOpacity: score >= 50 ? 0.28 : 0.15,
          weight: score >= 50 ? 2.5 : 1.5,
          dashArray: score >= 50 ? '5 5' : undefined
        });

        const tooltipContent = `
          <div style="font-size: 0.75rem; line-height: 1.4; color: #FFFFFF;">
            <div style="font-weight: 800; font-size: 0.8125rem; color: #93C5FD; margin-bottom: 2px;">
              ${p.districtName} — Flood Risk Telemetry
            </div>
            <div>Risk Score: <b style="color: ${color}">${score}/100</b> (${p.risk.flood.level.toUpperCase()})</div>
            <div>Measured Rainfall: <b>${p.observation.precipitationRate} mm/h</b> (24h sum: ${p.observation.precipitation24h} mm)</div>
            <div>Correlated Drainage Reports: <b>${p.risk.flood.activeDrainageIncidentsCount} citizen reports</b></div>
            <div style="font-size: 0.6875rem; color: #CBD5E1; margin-top: 3px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 2px;">
              Data Source: ${p.dataSource} (${p.providerName.split(' ')[0]}) • <i>Click to inspect</i>
            </div>
          </div>
        `;

        circle.bindTooltip(tooltipContent, {
          sticky: true,
          className: 'civic-leaflet-tooltip'
        });

        if (onSelectDistrict) {
          circle.on('click', () => onSelectDistrict(p.districtName));
        }

        overlayGroup.addLayer(circle);
      });
    } else if (activeLayer === 'heat') {
      // Dynamic district-level thermal stress halos
      envProfiles.forEach(p => {
        const score = p.risk.heat.score;
        const temp = p.observation.temperature;
        const color = score >= 75 || temp >= 40 ? '#DC2626' : score >= 45 || temp >= 36 ? '#EA580C' : '#D97706';
        const radius = Math.max(7000, (temp / 45) * 22000);

        const circle = L.circle(p.coordinates, {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.22,
          weight: 2
        });

        const tooltipContent = `
          <div style="font-size: 0.75rem; line-height: 1.4; color: #FFFFFF;">
            <div style="font-weight: 800; font-size: 0.8125rem; color: #FCA5A5; margin-bottom: 2px;">
              ${p.districtName} — Urban Heat & Thermal Stress
            </div>
            <div>Surface Temp: <b>${p.observation.temperature}°C</b> (Apparent: ${p.risk.heat.heatIndex}°C)</div>
            <div>Relative Humidity: <b>${p.observation.relativeHumidity}%</b></div>
            <div>Heat Risk Level: <b style="color: ${color}">${p.risk.heat.level.toUpperCase()}</b> (Score: ${score}/100)</div>
            <div style="font-size: 0.6875rem; color: #CBD5E1; margin-top: 3px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 2px;">
              Source: ${p.dataSource} • <i>Click to inspect</i>
            </div>
          </div>
        `;

        circle.bindTooltip(tooltipContent, {
          sticky: true,
          className: 'civic-leaflet-tooltip'
        });

        if (onSelectDistrict) {
          circle.on('click', () => onSelectDistrict(p.districtName));
        }

        overlayGroup.addLayer(circle);
      });
    } else if (activeLayer === 'environmental') {
      // Dynamic Multi-hazard composite overlay
      envProfiles.forEach(p => {
        const score = p.risk.compositeScore;
        const color = score >= 70 ? '#DC2626' : score >= 48 ? '#EA580C' : score >= 25 ? '#D97706' : '#059669';
        const radius = Math.max(8000, score * 260);

        const circle = L.circle(p.coordinates, {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.24,
          weight: 2,
          dashArray: '3 3'
        });

        const tooltipContent = `
          <div style="font-size: 0.75rem; line-height: 1.4; color: #FFFFFF;">
            <div style="font-weight: 800; font-size: 0.8125rem; color: #A7F3D0; margin-bottom: 2px;">
              ${p.districtName} — Environmental Multi-Hazard
            </div>
            <div>Composite Score: <b style="color: ${color}">${score}/100</b> (${p.risk.compositeLevel.toUpperCase()})</div>
            <div>Primary Driving Threat: <b>${p.risk.primaryThreat.toUpperCase()}</b></div>
            <div>Weather: ${p.observation.weatherDescription} (${p.observation.temperature}°C)</div>
            <div>Rainfall: ${p.observation.precipitationRate} mm/h | Water Stress: ${p.risk.waterStress.groundwaterZoneStatus}</div>
            <div style="font-size: 0.6875rem; color: #CBD5E1; margin-top: 3px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 2px;">
              Data Source: ${p.dataSource} (${p.providerName.split(' ')[0]}) • <i>Click to inspect</i>
            </div>
          </div>
        `;

        circle.bindTooltip(tooltipContent, {
          sticky: true,
          className: 'civic-leaflet-tooltip'
        });

        if (onSelectDistrict) {
          circle.on('click', () => onSelectDistrict(p.districtName));
        }

        overlayGroup.addLayer(circle);
      });
    } else if (activeLayer === 'severity' || activeLayer === 'density') {
      // Draw density/severity radiation rings around critical clusters
      incidents.forEach(inc => {
        if (inc.severity === 'critical') {
          const circle = L.circle([inc.latitude, inc.longitude], {
            radius: 1200,
            color: '#DC2626',
            fillColor: '#EF4444',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '2 3'
          });
          overlayGroup.addLayer(circle);
        }
      });
    }
  }, [activeLayer, incidents, envProfiles, onSelectDistrict, mapReady]);

  // 4. Render Incident Markers (Distinguishable citizen reports, never overwritten)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    incidents.forEach(inc => {
      const isSelected = selectedIncident?.id === inc.id;
      const catMeta = getCategoryMeta(inc.category);

      // Severity color mapping
      const severityColor = 
        inc.severity === 'critical' ? '#DC2626' :
        inc.severity === 'high' ? '#EA580C' :
        inc.severity === 'moderate' ? '#D97706' : '#059669';

      const isCritical = inc.severity === 'critical';

      // Custom HTML Marker using Leaflet DivIcon
      const markerHtml = `
        <div class="custom-risk-marker ${isSelected ? 'selected' : ''} ${isCritical ? 'pulse-critical' : ''}" 
             style="background-color: ${severityColor}; border-color: ${isSelected ? '#FFFFFF' : severityColor};">
          <div class="marker-inner">
            <span class="marker-dot"></span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'risk-marker-container',
        html: markerHtml,
        iconSize: isSelected ? [32, 32] : [24, 24],
        iconAnchor: isSelected ? [16, 16] : [12, 12]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      // Clean tooltip on hover
      const tooltipContent = `
        <div class="marker-tooltip-content">
          <div class="tooltip-header">
            <span class="tooltip-badge severity-${inc.severity}">${inc.severity.toUpperCase()}</span>
            <span class="tooltip-cat">${catMeta.label}</span>
          </div>
          <div class="tooltip-title">${inc.title}</div>
          <div class="tooltip-loc">${inc.area}, ${inc.district}</div>
          <div class="tooltip-footer">Citizen Report • Status: <b>${inc.status.replace(/_/g, ' ')}</b> • ${inc.reportCount} reports</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -14],
        className: 'civic-leaflet-tooltip'
      });

      // Handle marker click
      marker.on('click', () => {
        onSelectIncident(inc);
      });

      markersGroup.addLayer(marker);
    });
  }, [incidents, selectedIncident, onSelectIncident, mapReady]);

  // 5. Handle external focus coordination (e.g. from search, insight, or district selector)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (focusCoordinates) {
      map.flyTo(focusCoordinates, focusZoom || 14, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [focusCoordinates, focusZoom]);

  // 6. Handle district selection focus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDistrict || selectedDistrict === 'all') return;

    const district = KARNATAKA_DISTRICTS.find(
      d => d.name.toLowerCase() === selectedDistrict.toLowerCase() ||
           d.id.toLowerCase() === selectedDistrict.toLowerCase()
    );

    if (district) {
      map.flyTo(district.center, district.zoomLevel, {
        duration: 1.1,
        easeLinearity: 0.3
      });
    }
  }, [selectedDistrict]);

  // 7. Helper actions: Reset to Karnataka Statewide view
  const handleResetKarnataka = useCallback(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(KARNATAKA_STATE_CENTER, KARNATAKA_STATE_ZOOM, {
        duration: 1.0,
        easeLinearity: 0.3
      });
    }
  }, []);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="risk-map-wrapper" style={{ position: 'relative', width: '100%', height }}>
      {/* Real Interactive Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
        id="karnataka-risk-leaflet-map"
        tabIndex={0}
        aria-label="Karnataka Interactive Live Risk Map"
      />

      {/* Floating Map Navigation Controls */}
      <div className="map-floating-controls" aria-label="Map Navigation Tools">
        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="map-control-btn"
          title="Zoom In"
          aria-label="Zoom in on map"
        >
          <ZoomIn size={16} />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="map-control-btn"
          title="Zoom Out"
          aria-label="Zoom out on map"
        >
          <ZoomOut size={16} />
        </button>

        <div className="map-control-divider" />

        {/* Reset to Karnataka Statewide View */}
        <button
          type="button"
          onClick={handleResetKarnataka}
          className="map-control-btn primary"
          title="Reset to Karnataka Statewide View"
          aria-label="Reset to Karnataka Statewide View"
        >
          <Compass size={16} />
        </button>
      </div>

      {/* Floating State Overview Badge */}
      <div className="map-state-badge">
        <Navigation size={13} style={{ color: '#059669' }} />
        <span>Karnataka Grid (31 Districts)</span>
        <span className="badge-inc-count">{incidents.length} Citizen Reports</span>
      </div>

      {/* Tile Load Error Fallback Banner */}
      {tileError && (
        <div className="map-tile-error-banner" role="alert">
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>External map tile server unreachable. Vector coordinates and incident markers remain fully interactive.</span>
        </div>
      )}

      {/* Embedded CSS for custom Leaflet marker animations and tooltips */}
      <style>{`
        .risk-marker-container {
          background: transparent;
          border: none;
        }

        .custom-risk-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2.5px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .custom-risk-marker:hover {
          transform: scale(1.25);
          z-index: 1000 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
        }

        .custom-risk-marker.selected {
          width: 30px;
          height: 30px;
          transform: scale(1.2);
          border: 3px solid #FFFFFF;
          box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.4), 0 4px 12px rgba(0, 0, 0, 0.4);
          z-index: 9999 !important;
        }

        .marker-inner {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #FFFFFF;
        }

        .pulse-critical {
          animation: markerPulse 1.8s infinite;
        }

        @keyframes markerPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }

        /* Tooltip styling */
        .civic-leaflet-tooltip {
          background: #0F172A !important;
          color: #FFFFFF !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4) !important;
          font-family: var(--font-sans) !important;
        }

        .civic-leaflet-tooltip::before {
          border-top-color: #0F172A !important;
        }

        .marker-tooltip-content {
          font-size: 0.75rem;
          line-height: 1.4;
          max-width: 240px;
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.25rem;
        }

        .tooltip-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .tooltip-badge.severity-critical { background: #DC2626; color: #FFF; }
        .tooltip-badge.severity-high { background: #EA580C; color: #FFF; }
        .tooltip-badge.severity-moderate { background: #D97706; color: #FFF; }
        .tooltip-badge.severity-low { background: #059669; color: #FFF; }

        .tooltip-cat {
          font-size: 0.6875rem;
          color: #94A3B8;
        }

        .tooltip-title {
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.2rem;
        }

        .tooltip-loc {
          font-size: 0.6875rem;
          color: #CBD5E1;
          margin-bottom: 0.25rem;
        }

        .tooltip-footer {
          font-size: 0.6875rem;
          color: #34D399;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 0.25rem;
          margin-top: 0.25rem;
        }

        /* Floating Controls */
        .map-floating-controls {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 500;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }

        .map-control-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .map-control-btn:hover {
          background-color: var(--bg-surface-subtle);
          color: var(--text-primary);
        }

        .map-control-btn.primary {
          color: var(--brand-primary);
          background-color: var(--brand-primary-light);
        }

        .map-control-btn.primary:hover {
          background-color: #D1FAE5;
        }

        .map-control-divider {
          height: 1px;
          background-color: var(--border-subtle);
        }

        .map-state-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.85rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(6px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-pill);
          box-shadow: var(--shadow-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .badge-inc-count {
          font-size: 0.6875rem;
          font-weight: 700;
          background: var(--brand-primary-light);
          color: var(--brand-primary);
          padding: 2px 7px;
          border-radius: 9999px;
          border: 1px solid var(--brand-primary-border);
        }

        .map-tile-error-banner {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          z-index: 500;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: var(--radius-md);
          padding: 0.5rem 0.85rem;
          font-size: 0.75rem;
          color: #92400E;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </div>
  );
};
