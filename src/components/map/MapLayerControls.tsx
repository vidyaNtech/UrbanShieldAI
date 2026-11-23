import React, { useState } from 'react';
import type { MapLayerType } from '../../types/incident';
import { 
  Layers, 
  Map as MapIcon, 
  Globe, 
  Flame, 
  Droplet, 
  Activity, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Wind
} from 'lucide-react';

interface MapLayerControlsProps {
  activeLayer: MapLayerType;
  onSelectLayer: (layer: MapLayerType) => void;
}

export const MapLayerControls: React.FC<MapLayerControlsProps> = ({
  activeLayer,
  onSelectLayer
}) => {
  const [showLegend, setShowLegend] = useState(true);

  const layers: Array<{ id: MapLayerType; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'standard', label: 'Standard Map', icon: <MapIcon size={14} />, desc: 'OpenStreetMap vector geometry' },
    { id: 'satellite', label: 'Satellite', icon: <Globe size={14} />, desc: 'Esri World Imagery satellite tiles' },
    { id: 'flood', label: 'Flood Risk', icon: <Droplet size={14} />, desc: 'Live rainfall, drainage & river surge' },
    { id: 'heat', label: 'Heat Risk', icon: <Flame size={14} />, desc: 'Thermal radiation & apparent heat index' },
    { id: 'environmental', label: 'Environmental Multi-Hazard', icon: <Wind size={14} />, desc: 'Statewide rainfall, thermal & groundwater composite' },
    { id: 'severity', label: 'Risk Severity', icon: <Activity size={14} />, desc: 'Hotspot radiation buffers' },
    { id: 'density', label: 'Incident Density', icon: <Eye size={14} />, desc: 'Spatial report clusters' }
  ];

  return (
    <div className="map-layer-controls-card">
      {/* Layer Selection Pill Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          <Layers size={15} style={{ color: 'var(--brand-primary)' }} />
          <span>Thematic Layers:</span>
        </div>

        <button
          type="button"
          onClick={() => setShowLegend(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'none',
            border: 'none',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 0
          }}
          aria-expanded={showLegend}
        >
          <span>Map Legend</span>
          {showLegend ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {layers.map(layer => {
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelectLayer(layer.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--brand-primary-light)' : 'var(--bg-surface-subtle)',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--brand-primary-border)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title={layer.desc}
              aria-pressed={isActive}
            >
              {layer.icon}
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Map Legend */}
      {showLegend && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.72rem'
          }}
        >
          {/* Base Severity Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Severity Indicator:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                <span>Critical</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C' }} />
                <span>High</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                <span>Moderate</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
                <span>Low</span>
              </span>
            </div>
          </div>

          {/* Layer Specific Legend */}
          {activeLayer === 'flood' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
              <Droplet size={13} style={{ flexShrink: 0 }} />
              <span>Blue halos indicate live rainfall &gt;15 mm/h combined with citizen-reported drainage blockages.</span>
            </div>
          )}

          {activeLayer === 'heat' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#B91C1C', backgroundColor: '#FEF2F2', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
              <Flame size={13} style={{ flexShrink: 0 }} />
              <span>Thermal radiation rings indicate urban heat islands with apparent temperatures &gt;38°C.</span>
            </div>
          )}

          {activeLayer === 'environmental' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857', backgroundColor: '#ECFDF5', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
              <Wind size={13} style={{ flexShrink: 0 }} />
              <span>Multi-hazard telemetry halos displaying composite scores, rainfall rates & CGWB water stress.</span>
            </div>
          )}

          {activeLayer === 'satellite' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <Globe size={13} style={{ flexShrink: 0 }} />
              <span>Satellite raster layer courtesy of Esri World Imagery.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
