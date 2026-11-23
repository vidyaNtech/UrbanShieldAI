import React, { useState, useEffect } from 'react';
import { KARNATAKA_DISTRICTS } from '../../data/karnatakaDistricts';
import { incidentService } from '../../services/incidentService';
import { getCategoryMeta } from '../../config/incidentCategories';
import { environmentalService } from '../../services/environmentalService';
import type { DistrictEnvironmentalProfile } from '../../types/environmental';
import { NavIcon } from '../common/NavIcon';
import { 
  Building2, 
  RotateCcw, 
  Info,
  CloudRain,
  Sun,
  Droplet,
  ExternalLink
} from 'lucide-react';

interface DistrictRiskPanelProps {
  selectedDistrict: string;
  onSelectDistrict: (districtName: string) => void;
  onResetToStatewide: () => void;
  onNavigate?: (path: string) => void;
}

export const DistrictRiskPanel: React.FC<DistrictRiskPanelProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onResetToStatewide,
  onNavigate
}) => {
  const isStatewide = !selectedDistrict || selectedDistrict === 'all';
  const districtStats = !isStatewide ? incidentService.getDistrictRiskStats(selectedDistrict) : undefined;
  const topCatMeta = districtStats ? getCategoryMeta(districtStats.topCategory) : undefined;

  const [rawEnvProfile, setRawEnvProfile] = useState<DistrictEnvironmentalProfile | null>(null);
  const envProfile = isStatewide ? null : rawEnvProfile;

  useEffect(() => {
    if (isStatewide) return;

    let isMounted = true;
    environmentalService.getDistrictProfile(selectedDistrict).then(p => {
      if (isMounted) setRawEnvProfile(p);
    });

    return () => { isMounted = false; };
  }, [selectedDistrict, isStatewide]);

  return (
    <div className="district-risk-panel-card">
      {/* Header & Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Building2 size={16} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            District Risk Intelligence
          </span>
        </div>

        {!isStatewide && (
          <button
            type="button"
            onClick={onResetToStatewide}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'none',
              border: 'none',
              fontSize: '0.72rem',
              color: 'var(--brand-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            <RotateCcw size={12} />
            <span>Reset to State</span>
          </button>
        )}
      </div>

      {/* District Dropdown Selector */}
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedDistrict}
          onChange={e => onSelectDistrict(e.target.value)}
          className="form-input no-icon"
          style={{ width: '100%', fontSize: '0.8125rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
          aria-label="Select Karnataka District"
        >
          <option value="all">Entire State of Karnataka (All 31 Districts)</option>
          {KARNATAKA_DISTRICTS.map(d => (
            <option key={d.id} value={d.name}>
              {d.name} ({d.kannadaName}) — {d.division} Division
            </option>
          ))}
        </select>
      </div>

      {/* Selected District Intelligence Card */}
      {districtStats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Title & Vulnerability Index */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {districtStats.districtName}
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {districtStats.lastUpdated}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Vulnerability Index
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: districtStats.vulnerabilityIndex > 70 ? '#DC2626' : '#059669' }}>
                {districtStats.vulnerabilityIndex}<span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/100</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            <div className="district-stat-box">
              <span className="box-label">Total Citizen Incidents</span>
              <span className="box-val text-mono">{districtStats.totalIncidents}</span>
            </div>

            <div className="district-stat-box">
              <span className="box-label">Critical / High Severity</span>
              <span className="box-val text-mono text-danger">
                {districtStats.criticalCount + districtStats.highCount}
              </span>
            </div>

            <div className="district-stat-box">
              <span className="box-label">Unresolved Active</span>
              <span className="box-val text-mono text-warning">{districtStats.unresolvedCount}</span>
            </div>

            <div className="district-stat-box">
              <span className="box-label">Recently Resolved</span>
              <span className="box-val text-mono text-success">{districtStats.resolvedCount}</span>
            </div>
          </div>

          {/* Environmental Telemetry Block (Task 06 Extension) */}
          {envProfile && (
            <div style={{ backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Live Environmental Telemetry
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: envProfile.dataSource === 'LIVE' ? '#059669' : '#D97706' }}>
                  {envProfile.dataSource} ({envProfile.providerName.split(' ')[0]})
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <CloudRain size={13} style={{ color: '#2563EB' }} />
                  <span>Rain: <b>{envProfile.observation.precipitationRate} mm/h</b></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <Sun size={13} style={{ color: '#EA580C' }} />
                  <span>Temp: <b>{envProfile.observation.temperature}°C</b></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>Flood:</span>
                  <b>{envProfile.risk.flood.score}/100</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <Droplet size={13} style={{ color: '#0891B2' }} />
                  <span>Aquifer: <b>{envProfile.risk.waterStress.groundwaterZoneStatus}</b></span>
                </div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('#/risk-analytics')}
                  style={{
                    width: '100%',
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--brand-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span>Open Full Environmental Dashboard</span>
                  <ExternalLink size={11} />
                </button>
              )}
            </div>
          )}

          {/* Top Reported Category */}
          {topCatMeta && (
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: topCatMeta.bgColor, border: `1px solid ${topCatMeta.borderColor}`, borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Primary Reported Hazard
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <NavIcon name={topCatMeta.iconName} size={15} style={{ color: topCatMeta.color }} />
                <strong style={{ fontSize: '0.8125rem', color: topCatMeta.color }}>
                  {topCatMeta.label}
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ({districtStats.topCategoryCount} recorded reports)
                </span>
              </div>
            </div>
          )}

          {/* Environmental Observations */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45, padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <strong>Environmental Observation: </strong>
            <span>{districtStats.environmentalSummary}</span>
          </div>

          {/* Historical Comparison Disclaimer */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Multi-year historical rainfall decadal baselines for this district are integrated via the Environmental Intelligence service.</span>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: onNavigate ? '0.75rem' : '0' }}>
            Statewide Karnataka view active. Select any of the 31 districts from the dropdown or click a marker or environmental halo to drill down into localized risk telemetry.
          </p>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('#/risk-analytics')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'var(--brand-primary-light)',
                color: 'var(--brand-primary)',
                border: '1px solid var(--brand-primary-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <span>Explore Environmental Intelligence</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
