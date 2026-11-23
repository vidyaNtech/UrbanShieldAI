import React, { useState } from 'react';
import { Radio, Navigation } from 'lucide-react';

interface UrbanNode {
  id: string;
  name: string;
  kannada: string;
  coords: string;
  x: number; // percentage
  y: number; // percentage
  status: 'normal' | 'monitoring' | 'active_response';
  telemetryType: string;
}

const KARNATAKA_NODES: UrbanNode[] = [
  {
    id: 'blr',
    name: 'Bengaluru Metropolitan',
    kannada: 'ಬೆಂಗಳೂರು',
    coords: '12.9716° N, 77.5946° E',
    x: 74,
    y: 78,
    status: 'normal',
    telemetryType: 'Traffic & Stormwater Sensors'
  },
  {
    id: 'mys',
    name: 'Mysuru Urban Region',
    kannada: 'ಮೈಸೂರು',
    coords: '12.2958° N, 76.6394° E',
    x: 62,
    y: 86,
    status: 'normal',
    telemetryType: 'Civic Infrastructure Grid'
  },
  {
    id: 'mng',
    name: 'Mangaluru Coastal Corridor',
    kannada: 'ಮಂಗಳೂರು',
    coords: '12.9141° N, 74.8560° E',
    x: 35,
    y: 74,
    status: 'monitoring',
    telemetryType: 'Monsoon Flood & Sea Swell Telemetry'
  },
  {
    id: 'hbd',
    name: 'Hubballi-Dharwad Node',
    kannada: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ',
    coords: '15.3647° N, 75.1240° E',
    x: 42,
    y: 44,
    status: 'normal',
    telemetryType: 'Transport & Drainage Telemetry'
  },
  {
    id: 'bgm',
    name: 'Belagavi Border Division',
    kannada: 'ಬೆಳಗಾವಿ',
    coords: '15.8497° N, 74.4977° E',
    x: 30,
    y: 28,
    status: 'normal',
    telemetryType: 'River Basin Telemetry'
  },
  {
    id: 'klb',
    name: 'Kalaburagi North Grid',
    kannada: 'ಕಲಬುರಗಿ',
    coords: '17.3297° N, 76.8343° E',
    x: 70,
    y: 20,
    status: 'monitoring',
    telemetryType: 'Heat Index & Drought Resilience'
  }
];

export const KarnatakaGeoVisual: React.FC = () => {
  const [activeNode, setActiveNode] = useState<UrbanNode>(KARNATAKA_NODES[0]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Visual Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          fontSize: '0.75rem',
          color: '#94A3B8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Radio size={14} style={{ color: '#10B981', animation: 'spin 4s linear infinite' }} />
          <span style={{ fontWeight: 600, color: '#E2E8F0', letterSpacing: '0.04em' }}>
            KARNATAKA GEOSPATIAL INTELLIGENCE GRID
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34D399',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
        >
          LIVE TELEMETRY
        </span>
      </div>

      {/* SVG Canvas Map Contour & Nodes */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          background: 'radial-gradient(ellipse at 50% 50%, #112338 0%, #0A1324 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Subtle GIS Coordinate Grid Lines */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          viewBox="0 0 400 240"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            <linearGradient id="contourGrad" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
            </linearGradient>
            <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="400" height="240" fill="url(#gridPattern)" />

          {/* Stylized Karnataka Outline Silhouette */}
          <path
            d="M 120 40 
               L 180 30 
               L 280 25 
               L 310 60 
               L 285 95 
               L 320 145 
               L 305 190 
               L 250 215 
               L 190 205 
               L 140 175 
               L 115 130 
               L 130 90 
               Z"
            fill="url(#contourGrad)"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* District Link Corridors (Telemetry Network) */}
          <path
            d="M 120 70 L 170 110 L 295 190 M 170 110 L 280 50 M 170 110 L 140 180"
            stroke="rgba(52, 211, 153, 0.25)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Sweeping Radar Scanner Line */}
          <line
            x1="0"
            y1="0"
            x2="400"
            y2="240"
            stroke="rgba(16, 185, 129, 0.15)"
            strokeWidth="2"
            style={{
              animation: 'radarSweep 6s linear infinite',
              transformOrigin: 'center'
            }}
          />
        </svg>

        {/* Interactive Urban Nodes */}
        {KARNATAKA_NODES.map((node) => {
          const isSelected = activeNode.id === node.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveNode(node)}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                zIndex: isSelected ? 10 : 5
              }}
              title={`${node.name} (${node.kannada}) - ${node.telemetryType}`}
              aria-label={`Select node ${node.name}`}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Ping ring */}
                <span
                  style={{
                    position: 'absolute',
                    width: isSelected ? '26px' : '18px',
                    height: isSelected ? '26px' : '18px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(52, 211, 153, 0.2)',
                    animation: isSelected ? 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'
                  }}
                />
                {/* Core dot */}
                <span
                  style={{
                    width: isSelected ? '10px' : '7px',
                    height: isSelected ? '10px' : '7px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#10B981' : '#34D399',
                    boxShadow: isSelected ? '0 0 10px #10B981' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </button>
          );
        })}

        {/* Floating Active Node Telemetry Card */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#E2E8F0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={14} style={{ color: '#10B981' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#FFFFFF' }}>
                {activeNode.name} <span style={{ color: '#94A3B8', fontWeight: 400 }}>({activeNode.kannada})</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                {activeNode.coords} • {activeNode.telemetryType}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981'
              }}
            />
            <span style={{ fontSize: '0.6875rem', color: '#34D399', fontWeight: 500 }}>
              Online
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
