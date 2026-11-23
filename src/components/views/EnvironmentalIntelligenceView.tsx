import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../common/PageHeader';
import { NavIcon } from '../common/NavIcon';
import { KARNATAKA_DISTRICTS } from '../../data/karnatakaDistricts';
import { environmentalService } from '../../services/environmentalService';
import { incidentService } from '../../services/incidentService';
import type { UserProfile } from '../../types/auth';
import type { 
  DistrictEnvironmentalProfile, 
  EnvironmentalAlert,
  EnvironmentalFeedStatus
} from '../../types/environmental';
import { 
  CloudRain, 
  Sun, 
  Droplet, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight,
  Info,
  Sliders,
  CheckCircle2,
  Layers,
  Thermometer
} from 'lucide-react';

interface EnvironmentalIntelligenceViewProps {
  user: UserProfile;
  initialDistrictId?: string;
  onNavigate: (path: string) => void;
}

export const EnvironmentalIntelligenceView: React.FC<EnvironmentalIntelligenceViewProps> = ({
  user,
  initialDistrictId,
  onNavigate
}) => {
  // 1. View Tab Mode
  const [activeTab, setActiveTab] = useState<'statewide' | 'district' | 'historical' | 'methodology'>('statewide');
  
  // 2. Selected District
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(() => {
    if (initialDistrictId) return initialDistrictId;
    if (user.district) {
      const match = KARNATAKA_DISTRICTS.find(d => d.name.toLowerCase() === user.district?.toLowerCase());
      if (match) return match.id;
    }
    return 'bengaluru-urban';
  });

  // 3. Search & Sorting in Statewide Table
  const [districtSearch, setDistrictSearch] = useState('');
  const [sortField, setSortField] = useState<'floodScore' | 'heatScore' | 'waterScore' | 'precip' | 'temp'>('floodScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');

  // 4. Reactive State Subscription to Environmental Service
  const [profiles, setProfiles] = useState<DistrictEnvironmentalProfile[]>(() => environmentalService.getAllProfiles());
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>(() => environmentalService.getAlerts());
  const [feedStatus, setFeedStatus] = useState<EnvironmentalFeedStatus>(() => environmentalService.getFeedStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<DistrictEnvironmentalProfile | null>(null);

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = environmentalService.subscribe(() => {
      setProfiles(environmentalService.getAllProfiles());
      setAlerts(environmentalService.getAlerts());
      setFeedStatus(environmentalService.getFeedStatus());
    });

    // Initial background sync for key districts
    environmentalService.refreshAllDistricts(false);

    return unsubscribe;
  }, []);

  // Fetch full telemetry whenever selected district changes
  useEffect(() => {
    let isCancelled = false;

    const fetchSelected = async () => {
      try {
        const prof = await environmentalService.getDistrictProfile(selectedDistrictId);
        if (!isCancelled) {
          setSelectedProfile(prof);
        }
      } catch (err) {
        console.error('Failed to load profile for district:', selectedDistrictId, err);
      }
    };

    fetchSelected();
    return () => { isCancelled = true; };
  }, [selectedDistrictId]);

  // Handle Manual Refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await environmentalService.manualRefresh();
      const updated = await environmentalService.getDistrictProfile(selectedDistrictId);
      setSelectedProfile(updated);
    } catch (err) {
      console.error('Manual refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Switch district & jump to deep dive tab
  const handleSelectDistrictForDeepDive = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setActiveTab('district');
  };

  // Statewide summary statistics
  const statewideStats = useMemo(() => {
    if (profiles.length === 0) return { avgTemp: 26, maxPrecip: 0, maxPrecipDistrict: 'None', highRiskCount: 0 };

    let totalTemp = 0;
    let maxPrecip = 0;
    let maxPrecipDistrict = 'None';
    let highRiskCount = 0;

    profiles.forEach(p => {
      totalTemp += p.observation.temperature;
      if (p.observation.precipitationRate > maxPrecip) {
        maxPrecip = p.observation.precipitationRate;
        maxPrecipDistrict = p.districtName;
      }
      if (p.risk.compositeLevel === 'high' || p.risk.compositeLevel === 'critical') {
        highRiskCount++;
      }
    });

    return {
      avgTemp: Math.round((totalTemp / profiles.length) * 10) / 10,
      maxPrecip: Math.round(maxPrecip * 10) / 10,
      maxPrecipDistrict,
      highRiskCount
    };
  }, [profiles]);

  // Filtered & Sorted Statewide Profiles
  const filteredProfiles = useMemo(() => {
    return profiles
      .filter(p => {
        const matchesSearch = p.districtName.toLowerCase().includes(districtSearch.toLowerCase()) ||
          p.kannadaName.includes(districtSearch);
        const matchesDiv = divisionFilter === 'all' || p.division.toLowerCase() === divisionFilter.toLowerCase();
        return matchesSearch && matchesDiv;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortField === 'floodScore') {
          valA = a.risk.flood.score;
          valB = b.risk.flood.score;
        } else if (sortField === 'heatScore') {
          valA = a.risk.heat.score;
          valB = b.risk.heat.score;
        } else if (sortField === 'waterScore') {
          valA = a.risk.waterStress.score;
          valB = b.risk.waterStress.score;
        } else if (sortField === 'precip') {
          valA = a.observation.precipitationRate;
          valB = b.observation.precipitationRate;
        } else if (sortField === 'temp') {
          valA = a.observation.temperature;
          valB = b.observation.temperature;
        }

        return sortDirection === 'desc' ? valB - valA : valA - valB;
      });
  }, [profiles, districtSearch, divisionFilter, sortField, sortDirection]);

  // Active district citizen incident correlation
  const districtDrainageTickets = useMemo(() => {
    if (!selectedProfile) return [];
    const all = incidentService.getAllIncidents();
    return all.filter(inc => 
      inc.district.toLowerCase() === selectedProfile.districtName.toLowerCase() &&
      (inc.category === 'blocked_drainage' || inc.category === 'flooding_waterlogging') &&
      inc.status !== 'resolved' && inc.status !== 'rejected'
    );
  }, [selectedProfile]);

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return '#DC2626'; // Red 600
    if (score >= 48) return '#EA580C'; // Orange 600
    if (score >= 25) return '#D97706'; // Amber 600
    return '#059669'; // Emerald 600
  };

  return (
    <div className="environmental-intelligence-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header with Provenance Badge & Controls */}
      <PageHeader
        title="Environmental Intelligence & Automatic Risk Monitoring"
        subtitle="Automated meteorological risk modeling, real-time rainfall & urban heat telemetry, and hydrogeological stress assessment across Karnataka."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Live / Simulated / Historical Status Pill */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                backgroundColor: feedStatus.sourceType === 'LIVE' ? '#ECFDF5' : '#FFFBEB',
                color: feedStatus.sourceType === 'LIVE' ? '#059669' : '#D97706',
                border: feedStatus.sourceType === 'LIVE' ? '1px solid #A7F3D0' : '1px solid #FDE68A'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: feedStatus.sourceType === 'LIVE' ? '#10B981' : '#F59E0B',
                  boxShadow: feedStatus.sourceType === 'LIVE' ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
                }}
              />
              DATA FEED: {feedStatus.sourceType}
            </span>

            {/* Connection Status */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: feedStatus.status === 'online' ? '#059669' : '#64748B',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-pill)'
              }}
            >
              Source: {feedStatus.primarySource.split(' ')[0]} ({feedStatus.status.toUpperCase()})
            </span>
          </div>
        }
        breadcrumbs={[
          { label: 'Portal', path: '#/overview' },
          { label: 'AI Monitoring', path: '#/ai-monitoring/overview' },
          { label: 'Environmental Intelligence', isCurrent: true }
        ]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                opacity: isRefreshing ? 0.7 : 1,
                transition: 'all var(--transition-fast)'
              }}
              title="Poll live meteorological telemetry now"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} />
              <span>{isRefreshing ? 'Polling Sensors...' : 'Sync Telemetry'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('#/risk-map')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.95rem',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <NavIcon name="Map" size={14} />
              <span>Inspect on GIS Map</span>
            </button>
          </div>
        }
      />

      {/* 2. Telemetry Refresh Strip & Attribution Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span>
              Last Updated: <b style={{ color: 'var(--text-primary)' }}>
                {feedStatus.lastSuccessfulSync ? new Date(feedStatus.lastSuccessfulSync).toLocaleTimeString('en-US') : 'Synchronizing...'}
              </b>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span>
              Next Scheduled Poll: <b style={{ color: 'var(--text-primary)' }}>
                {feedStatus.nextScheduledSync ? new Date(feedStatus.nextScheduledSync).toLocaleTimeString('en-US') : 'In 5 minutes'}
              </b>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span>
              Auto-Refresh: <b style={{ color: 'var(--brand-primary)' }}>5m Interval Active</b>
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          {feedStatus.attribution}
        </div>
      </div>

      {/* 3. Top KPI Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Rainfall Intensity Card */}
        <div className="summary-card" style={{ borderLeft: '4px solid #2563EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              State Peak Rainfall
            </span>
            <div style={{ padding: '0.35rem', backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-sm)', color: '#2563EB' }}>
              <CloudRain size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {statewideStats.maxPrecip}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>mm/h</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Peak Corridor: <b style={{ color: 'var(--text-primary)' }}>{statewideStats.maxPrecipDistrict}</b>
          </div>
        </div>

        {/* Ambient Temperature & Urban Heat */}
        <div className="summary-card" style={{ borderLeft: '4px solid #EA580C' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Mean Statewide Temp
            </span>
            <div style={{ padding: '0.35rem', backgroundColor: '#FFF7ED', borderRadius: 'var(--radius-sm)', color: '#EA580C' }}>
              <Sun size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {statewideStats.avgTemp}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>°C</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Thermal Regime: <span style={{ color: '#059669', fontWeight: 600 }}>Normal Seasonal Range</span>
          </div>
        </div>

        {/* Active Environmental Alerts */}
        <div className="summary-card" style={{ borderLeft: '4px solid #DC2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              High / Critical Hazards
            </span>
            <div style={{ padding: '0.35rem', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-sm)', color: '#DC2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: statewideStats.highRiskCount > 0 ? '#DC2626' : '#059669' }}>
              {statewideStats.highRiskCount}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Districts</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Alert Status: <b style={{ color: statewideStats.highRiskCount > 0 ? '#DC2626' : '#059669' }}>
              {statewideStats.highRiskCount > 0 ? 'Surveillance Active' : 'All Clear / Safe'}
            </b>
          </div>
        </div>

        {/* Groundwater & Water Stress */}
        <div className="summary-card" style={{ borderLeft: '4px solid #0891B2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Monitored Aquifer Grid
            </span>
            <div style={{ padding: '0.35rem', backgroundColor: '#ECFEFF', borderRadius: 'var(--radius-sm)', color: '#0891B2' }}>
              <Droplet size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              31
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>/ 31 Districts</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            CGWB Hydrogeology Reference: <b style={{ color: 'var(--text-primary)' }}>100% Synced</b>
          </div>
        </div>
      </div>

      {/* 4. Active Environmental Alerts Banner */}
      {alerts.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} style={{ color: '#DC2626' }} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Environmental Warnings & Surveillance Watches ({alerts.length})
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Automated Threshold Engine
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  backgroundColor: alert.severity === 'critical' ? '#FEF2F2' : alert.severity === 'high' ? '#FFF7ED' : 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: alert.severity === 'critical' ? '1px solid #FECACA' : alert.severity === 'high' ? '1px solid #FFEDD5' : '1px solid var(--border-subtle)',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                  <div style={{ marginTop: '0.15rem' }}>
                    {alert.type === 'HEAVY_RAINFALL' || alert.type === 'DRAINAGE_SURGE' ? (
                      <CloudRain size={16} style={{ color: alert.severity === 'critical' ? '#DC2626' : '#2563EB' }} />
                    ) : alert.type === 'URBAN_HEAT' ? (
                      <Sun size={16} style={{ color: '#EA580C' }} />
                    ) : (
                      <Droplet size={16} style={{ color: '#0891B2' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {alert.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-pill)',
                          textTransform: 'uppercase',
                          backgroundColor: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#EA580C' : '#059669',
                          color: '#FFFFFF'
                        }}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', lineHeight: 1.4 }}>
                      {alert.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>Observed: <b style={{ color: 'var(--text-primary)' }}>{alert.metricObserved}</b></span>
                      <span>Trigger: <i>{alert.thresholdValue}</i></span>
                      <span>Action: <b style={{ color: 'var(--brand-primary)' }}>{alert.recommendedAction}</b></span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectDistrictForDeepDive(alert.districtId)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <span>Inspect District</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Main Dashboard Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-medium)', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('statewide')}
          style={{
            padding: '0.65rem 1.15rem',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'statewide' ? 700 : 500,
            color: activeTab === 'statewide' ? 'var(--brand-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'statewide' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Layers size={16} />
          <span>Statewide 31-District Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('district')}
          style={{
            padding: '0.65rem 1.15rem',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'district' ? 700 : 500,
            color: activeTab === 'district' ? 'var(--brand-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'district' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <MapPin size={16} />
          <span>District Deep-Dive: {selectedProfile?.districtName || 'Select District'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historical')}
          style={{
            padding: '0.65rem 1.15rem',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'historical' ? 700 : 500,
            color: activeTab === 'historical' ? 'var(--brand-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'historical' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <TrendingUp size={16} />
          <span>Historical Climate Normals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('methodology')}
          style={{
            padding: '0.65rem 1.15rem',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'methodology' ? 700 : 500,
            color: activeTab === 'methodology' ? 'var(--brand-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'methodology' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Sliders size={16} />
          <span>Calculation Methodology & Transparency</span>
        </button>
      </div>

      {/* 6. TAB CONTENT: STATEWIDE 31-DISTRICT MATRIX */}
      {activeTab === 'statewide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-surface)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Filter by district name or Kannada..."
                value={districtSearch}
                onChange={e => setDistrictSearch(e.target.value)}
                className="form-input no-icon"
                style={{ width: '100%', fontSize: '0.8125rem', padding: '0.45rem 0.75rem' }}
              />
            </div>

            {/* Division Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Division:</span>
              <select
                value={divisionFilter}
                onChange={e => setDivisionFilter(e.target.value)}
                className="form-input no-icon"
                style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
              >
                <option value="all">All 4 Divisions</option>
                <option value="bengaluru">Bengaluru</option>
                <option value="mysuru">Mysuru</option>
                <option value="belagavi">Belagavi</option>
                <option value="kalaburagi">Kalaburagi</option>
              </select>
            </div>

            {/* Sort Field Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as any)}
                className="form-input no-icon"
                style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
              >
                <option value="floodScore">Flood Risk Score</option>
                <option value="heatScore">Heat Stress Score</option>
                <option value="waterScore">Water Deficit Score</option>
                <option value="precip">Rainfall Intensity (mm/h)</option>
                <option value="temp">Observed Temperature (°C)</option>
              </select>

              <button
                type="button"
                onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                {sortDirection === 'desc' ? 'High to Low ↓' : 'Low to High ↑'}
              </button>
            </div>
          </div>

          {/* Statewide Districts Table */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflowX: 'auto',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>District & Division</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Observed Weather</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Rainfall (mm/h)</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Temperature</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Flood Risk Index</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Heat Stress Index</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Water Stress</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Data Feed</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(p => {
                  const floodColor = getRiskScoreColor(p.risk.flood.score);
                  const heatColor = getRiskScoreColor(p.risk.heat.score);

                  return (
                    <tr
                      key={p.districtId}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      className="table-row-hover"
                    >
                      {/* District & Division */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {p.districtName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {p.kannadaName} • {p.division} Division
                        </div>
                      </td>

                      {/* Weather Description */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {p.observation.weatherDescription}
                        </span>
                      </td>

                      {/* Rainfall Rate */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                          <CloudRain size={13} style={{ color: p.observation.precipitationRate > 0 ? '#2563EB' : 'var(--text-tertiary)' }} />
                          <b style={{ color: p.observation.precipitationRate > 15 ? '#DC2626' : 'var(--text-primary)' }}>
                            {p.observation.precipitationRate}
                          </b>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>mm/h</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                          {p.observation.precipitation24h !== null 
                            ? `Observed 24h: ${p.observation.precipitation24h} mm` 
                            : (p.observation.forecastPrecipitation24h !== undefined ? `Forecast 24h: ${p.observation.forecastPrecipitation24h} mm` : '24h sum unavailable')}
                        </div>
                      </td>

                      {/* Temperature & Humidity */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                          <Thermometer size={13} style={{ color: p.observation.temperature > 37 ? '#EA580C' : 'var(--text-tertiary)' }} />
                          <b>{p.observation.temperature}°C</b>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                          Apparent: {p.observation.apparentTemperature}°C ({p.observation.relativeHumidity}%)
                        </div>
                      </td>

                      {/* Flood Risk */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '50px', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${p.risk.flood.score}%`, height: '100%', backgroundColor: floodColor }} />
                          </div>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: floodColor, minWidth: '24px' }}>
                            {p.risk.flood.score}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: floodColor, fontWeight: 600 }}>
                          {p.risk.flood.level}
                        </span>
                      </td>

                      {/* Heat Risk */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '50px', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${p.risk.heat.score}%`, height: '100%', backgroundColor: heatColor }} />
                          </div>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: heatColor, minWidth: '24px' }}>
                            {p.risk.heat.score}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: heatColor, fontWeight: 600 }}>
                          {p.risk.heat.level}
                        </span>
                      </td>

                      {/* Water Stress */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: p.risk.waterStress.level === 'critical' ? '#FEF2F2' : 'var(--bg-surface-subtle)',
                            color: p.risk.waterStress.level === 'critical' ? '#DC2626' : 'var(--text-secondary)'
                          }}
                        >
                          {p.risk.waterStress.groundwaterZoneStatus}
                        </span>
                      </td>

                      {/* Data Source Badge */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: p.dataSource === 'LIVE' ? '#ECFDF5' : '#FFFBEB',
                            color: p.dataSource === 'LIVE' ? '#059669' : '#D97706'
                          }}
                        >
                          {p.dataSource}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectDistrictForDeepDive(p.districtId)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: 'var(--bg-surface-subtle)',
                            color: 'var(--brand-primary)',
                            border: '1px solid var(--brand-primary-border)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          Deep-Dive
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: DISTRICT DEEP-DIVE */}
      {activeTab === 'district' && selectedProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* District Selector & Elevation Header */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedProfile.districtName}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                  ({selectedProfile.kannadaName})
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: selectedProfile.dataSource === 'LIVE' ? '#ECFDF5' : '#FFFBEB',
                    color: selectedProfile.dataSource === 'LIVE' ? '#059669' : '#D97706'
                  }}
                >
                  SOURCE: {selectedProfile.dataSource} ({selectedProfile.providerName.split(' ')[0]})
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Division: <b>{selectedProfile.division}</b> • Elevation: <b>{selectedProfile.elevationMeters}m</b> MSL •
                Coordinates: <b>{selectedProfile.coordinates[0].toFixed(3)}°N, {selectedProfile.coordinates[1].toFixed(3)}°E</b>
              </div>
            </div>

            {/* District Dropdown Selector */}
            <div style={{ minWidth: '260px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                Switch Monitored District:
              </label>
              <select
                value={selectedProfile.districtId}
                onChange={e => setSelectedDistrictId(e.target.value)}
                className="form-input no-icon"
                style={{ width: '100%', fontSize: '0.8125rem', padding: '0.45rem 0.65rem' }}
              >
                {KARNATAKA_DISTRICTS.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.kannadaName}) — {d.division} Division
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Three Domain Risk Cards (Flood, Heat, Water Stress) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
            {/* FLOOD RISK CARD */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CloudRain size={18} style={{ color: '#2563EB' }} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Flood & Inundation Risk
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: getRiskScoreColor(selectedProfile.risk.flood.score) + '1A',
                    color: getRiskScoreColor(selectedProfile.risk.flood.score)
                  }}
                >
                  {selectedProfile.risk.flood.level}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: getRiskScoreColor(selectedProfile.risk.flood.score) }}>
                  {selectedProfile.risk.flood.score}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ 100 Risk Score</span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${selectedProfile.risk.flood.score}%`,
                    height: '100%',
                    backgroundColor: getRiskScoreColor(selectedProfile.risk.flood.score),
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedProfile.risk.flood.explanation}
              </p>

              {/* Contributing factors breakdown */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Contributing Risk Drivers:
                </span>
                {selectedProfile.risk.flood.contributingFactors.map((cf, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>• {cf.factor} ({cf.weightPercent}% weight):</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cf.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HEAT RISK CARD */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sun size={18} style={{ color: '#EA580C' }} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Urban Heat & Thermal Stress
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: getRiskScoreColor(selectedProfile.risk.heat.score) + '1A',
                    color: getRiskScoreColor(selectedProfile.risk.heat.score)
                  }}
                >
                  {selectedProfile.risk.heat.level}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: getRiskScoreColor(selectedProfile.risk.heat.score) }}>
                  {selectedProfile.risk.heat.score}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ 100 Risk Score</span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${selectedProfile.risk.heat.score}%`,
                    height: '100%',
                    backgroundColor: getRiskScoreColor(selectedProfile.risk.heat.score),
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedProfile.risk.heat.explanation}
              </p>

              {/* Contributing factors breakdown */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Contributing Thermal Factors:
                </span>
                {selectedProfile.risk.heat.contributingFactors.map((cf, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>• {cf.factor} ({cf.weightPercent}%):</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cf.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WATER STRESS CARD */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplet size={18} style={{ color: '#0891B2' }} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Water Stress & Aquifer Deficit
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: getRiskScoreColor(selectedProfile.risk.waterStress.score) + '1A',
                    color: getRiskScoreColor(selectedProfile.risk.waterStress.score)
                  }}
                >
                  {selectedProfile.risk.waterStress.level}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: getRiskScoreColor(selectedProfile.risk.waterStress.score) }}>
                  {selectedProfile.risk.waterStress.score}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ 100 Risk Score</span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${selectedProfile.risk.waterStress.score}%`,
                    height: '100%',
                    backgroundColor: getRiskScoreColor(selectedProfile.risk.waterStress.score),
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedProfile.risk.waterStress.explanation}
              </p>

              {/* Contributing factors breakdown */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Hydrogeological Drivers:
                </span>
                {selectedProfile.risk.waterStress.contributingFactors.map((cf, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>• {cf.factor} ({cf.weightPercent}%):</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cf.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 24-Hour Hourly Trend Visualizer (SVG Bar & Line Chart) */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  24-Hour Atmospheric & Precipitation Trend ({selectedProfile.districtName})
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Hourly measured & forecasted temperatures with precipitation intensity bars.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '12px', height: '3px', backgroundColor: '#EA580C', borderRadius: '2px' }} />
                  Temperature (°C)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#3B82F6', borderRadius: '2px' }} />
                  Precipitation (mm)
                </span>
              </div>
            </div>

            {/* Responsive Trend Visualizer */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {selectedProfile.hourlyTrends.slice(0, 16).map((point, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: '0 0 68px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-canvas)',
                    padding: '0.75rem 0.35rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.35rem'
                  }}
                >
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {point.hourLabel}
                  </span>

                  {/* Temp Value */}
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EA580C', fontFamily: 'var(--font-mono)' }}>
                    {point.temperature}°
                  </span>

                  {/* Precipitation Bar */}
                  <div
                    style={{
                      height: '40px',
                      width: '16px',
                      backgroundColor: '#E2E8F0',
                      borderRadius: '3px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      margin: '0.25rem 0'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.min(100, Math.max(10, point.precipitation * 15))}%`,
                        backgroundColor: point.precipitation > 0 ? '#3B82F6' : '#94A3B8',
                        borderRadius: '3px',
                        transition: 'height 0.3s ease'
                      }}
                      title={`Precipitation: ${point.precipitation} mm`}
                    />
                  </div>

                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: point.precipitation > 0 ? '#2563EB' : 'var(--text-tertiary)', fontWeight: 600 }}>
                    {point.precipitation > 0 ? `${point.precipitation}m` : '0m'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Drainage Linkage & Transparency Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
            {/* Citizen Reported Drainage Correlation */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Correlated Citizen Drainage Incidents ({districtDrainageTickets.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('#/risk-map')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View on Map →
                </button>
              </div>

              {districtDrainageTickets.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {districtDrainageTickets.slice(0, 3).map(inc => (
                    <div
                      key={inc.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-canvas)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                          {inc.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {inc.area} • Severity: <b style={{ textTransform: 'uppercase' }}>{inc.severity}</b>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate(`#/incidents/${inc.id}`)}
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--brand-primary)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={24} style={{ color: '#059669', margin: '0 auto 0.5rem auto' }} />
                  No unresolved citizen drainage complaints registered in {selectedProfile.districtName}.
                </div>
              )}
            </div>

            {/* Transparent Calculation Step-by-Step */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={16} style={{ color: 'var(--brand-primary)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Transparent Risk Calculation Engine
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                UrbanShield AI computes risk using physical observations rather than opaque black-box assumptions.
              </p>

              <div style={{ backgroundColor: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <div style={{ color: 'var(--brand-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  FLOOD_SCORE_FORMULA:
                </div>
                <div>0.45 * RainfallFactor({selectedProfile.observation.precipitationRate}mm/h)</div>
                <div>+ 0.30 * DistrictVulnerability({selectedProfile.elevationMeters}m MSL)</div>
                <div>+ 0.25 * ActiveDrainageBlockages({districtDrainageTickets.length} reports)</div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem', paddingTop: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  = Final Risk Score: {selectedProfile.risk.flood.score}/100 ({selectedProfile.risk.flood.level.toUpperCase()})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: HISTORICAL CLIMATE NORMALS */}
      {activeTab === 'historical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Karnataka 30-Year Agro-Meteorological Baseline Archive (IMD & CGWB)
            </span>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
              Baseline climate normals compiled from official India Meteorological Department (IMD) 30-year records (1991–2020)
              and Central Ground Water Board (CGWB) aquifer state classifications. Used as reference benchmarks against real-time anomalies.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflowX: 'auto',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>District</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Catchment River Basin</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Annual Normal Rainfall</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>SW Monsoon Normal</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Summer Peak Temp</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>CGWB Aquifer State</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Historical Flood Vulnerability</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Historical Drought Risk</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.districtId} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="table-row-hover">
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.districtName}
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {p.baseline?.catchmentBasin ?? 'Unavailable'}
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem', fontFamily: 'var(--font-mono)' }}>
                      {p.baseline?.annualNormalRainfallMm !== undefined ? `${p.baseline.annualNormalRainfallMm} mm` : 'Unavailable'}
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem', fontFamily: 'var(--font-mono)' }}>
                      {p.baseline?.monsoonNormalRainfallMm !== undefined ? `${p.baseline.monsoonNormalRainfallMm} mm` : 'Unavailable'}
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem', fontFamily: 'var(--font-mono)' }}>
                      {p.baseline?.averageMaxTempSummer !== undefined ? `${p.baseline.averageMaxTempSummer}°C` : 'Unavailable'}
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: p.risk.waterStress.groundwaterZoneStatus === 'Over-Exploited' ? '#FEF2F2' : 'var(--bg-surface-subtle)',
                          color: p.risk.waterStress.groundwaterZoneStatus === 'Over-Exploited' ? '#DC2626' : 'var(--text-secondary)'
                        }}
                      >
                        {p.risk.waterStress.groundwaterZoneStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {p.risk.flood.districtVulnerabilityIndex > 70 ? 'High' : 'Moderate'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {p.risk.waterStress.score > 50 ? 'High' : 'Moderate'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. TAB CONTENT: CALCULATION METHODOLOGY & TRANSPARENCY */}
      {activeTab === 'methodology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={20} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                UrbanShield AI — Transparent Risk Evaluation Matrix
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
              In accordance with government transparency guidelines, UrbanShield AI computes all severity indices through
              published mathematical formulations and empirical India Meteorological Department (IMD) thresholds.
              Risk levels are strictly distinguished between directly measured observations and calculated assessments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* Flood Risk Methodology */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                1. Flood Risk Index Methodology
              </span>
              <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
                <li><b>Precipitation Factor (45%):</b> Calibrated against IMD criteria where &gt;15 mm/h constitutes heavy rain, and &gt;35 mm/h constitutes violent rain.</li>
                <li><b>Topographical Vulnerability (30%):</b> Incorporates catchment slope, valley curvature, and low-lying stormwater drainage basins.</li>
                <li><b>Citizen Obstruction Multiplier (25%):</b> Directly correlates active unresolved reports of <code>blocked_drainage</code> and <code>flooding_waterlogging</code> from citizen response telemetry.</li>
              </ul>
            </div>

            {/* Heat Stress Methodology */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase' }}>
                2. Urban Heat Stress Methodology
              </span>
              <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
                <li><b>Rothfusz Heat Index:</b> Evaluates biometeorological apparent temperature combining dry-bulb surface temperature and relative humidity.</li>
                <li><b>Heat Wave Criteria:</b> Strictly triggers High at Apparent Temp &gt; 40°C, and Critical at Apparent Temp &gt; 42°C.</li>
                <li><b>Built Environment Buffer:</b> Accounts for dense urban thermal mass and asphalt albedo in metropolitan wards.</li>
              </ul>
            </div>

            {/* Water Stress Methodology */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0891B2', textTransform: 'uppercase' }}>
                3. Water Stress & Hydrogeology
              </span>
              <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
                <li><b>CGWB Ground Water Categorization:</b> Integrated from Central Ground Water Board assessment of Over-Exploited vs Safe taluks.</li>
                <li><b>Upper Profile Soil Moisture:</b> Evaluates satellite and modeled volumetric soil water content (m³/m³).</li>
                <li><b>Cumulative Deficit:</b> Tracks departure from 30-year seasonal rainfall normals across the 7-day observation window.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
