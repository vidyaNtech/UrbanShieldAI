import React, { useState, useMemo } from 'react';
import { incidentService } from '../../services/incidentService';
import { MapHeaderSummary } from '../map/MapHeaderSummary';
import { CategoryFilterBar } from '../map/CategoryFilterBar';
import { MapLayerControls } from '../map/MapLayerControls';
import { RiskMapLeaflet } from '../map/RiskMapLeaflet';
import { IncidentDrawer } from '../map/IncidentDrawer';
import { DistrictRiskPanel } from '../map/DistrictRiskPanel';
import { AiRiskInsightPanel } from '../map/AiRiskInsightPanel';
import { MapSearchBox } from '../map/MapSearchBox';
import { EmptyState } from '../common/EmptyState';
import type { 
  UrbanIncident, 
  IncidentCategory, 
  MapLayerType, 
  IncidentFilterState 
} from '../../types/incident';

interface LiveRiskMapViewProps {
  onNavigate: (path: string) => void;
}

export const LiveRiskMapView: React.FC<LiveRiskMapViewProps> = ({ onNavigate }) => {
  // 1. Filter States
  const [filters, setFilters] = useState<IncidentFilterState>({
    category: 'all',
    severity: 'all',
    status: 'all',
    district: 'all',
    quickFilter: 'all',
    searchQuery: ''
  });

  // 2. Active Thematic Layer
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('standard');

  // 3. Selected Marker / Incident for Side Drawer
  const [selectedIncident, setSelectedIncident] = useState<UrbanIncident | null>(null);

  // 4. Map View Coordinates for external triggers (Search / AI Insights / District selector)
  const [focusCoordinates, setFocusCoordinates] = useState<[number, number] | undefined>(undefined);
  const [focusZoom, setFocusZoom] = useState<number | undefined>(undefined);

  // 5. Active District
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Reactive store subscription
  const [storeVersion, setStoreVersion] = useState(0);
  React.useEffect(() => {
    return incidentService.subscribe(() => setStoreVersion(v => v + 1));
  }, []);

  // 6. Calculate filtered incidents from underlying central service
  const filteredIncidents = useMemo(() => {
    return incidentService.filterIncidents({
      ...filters,
      district: selectedDistrict !== 'all' ? selectedDistrict : undefined
    });
  }, [filters, selectedDistrict, storeVersion]);

  // 7. Calculate dynamic statistics
  const summaryStats = useMemo(() => {
    return incidentService.getSummaryStats();
  }, [storeVersion]);

  // 8. Calculate Category counts dynamically
  const categoryCounts = useMemo(() => {
    const all = incidentService.getAllIncidents();
    const counts: Record<string, number> = {};
    all.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [storeVersion]);

  // Check if non-default filters are active
  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.quickFilter !== 'all' || 
    selectedDistrict !== 'all' || 
    Boolean(filters.searchQuery);

  // Filter actions
  const handleSelectCategory = (cat: IncidentCategory | 'all') => {
    setFilters(prev => ({ ...prev, category: cat }));
  };

  const handleSelectQuickFilter = (qf: IncidentFilterState['quickFilter']) => {
    setFilters(prev => ({ ...prev, quickFilter: qf }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      severity: 'all',
      status: 'all',
      district: 'all',
      quickFilter: 'all',
      searchQuery: ''
    });
    setSelectedDistrict('all');
    setSelectedIncident(null);
    setFocusCoordinates(undefined);
  };

  const handleFocusFromAiInsight = (coords: [number, number], zoom: number, incidentId?: string) => {
    setFocusCoordinates(coords);
    setFocusZoom(zoom);
    if (incidentId) {
      const match = incidentService.getIncidentById(incidentId);
      if (match) setSelectedIncident(match);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    setFocusCoordinates(result.coordinates);
    setFocusZoom(result.zoom);
    if (result.districtId) {
      setSelectedDistrict(result.districtId);
    }
    if (result.incidentId) {
      const match = incidentService.getIncidentById(result.incidentId);
      if (match) setSelectedIncident(match);
    }
  };

  const handleViewIncidentDetails = (id: string) => {
    onNavigate(`#/incidents/${id}`);
  };

  return (
    <div className="live-risk-map-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Map Header & Summary Strip */}
      <MapHeaderSummary
        stats={summaryStats}
        currentFilter={filters.quickFilter}
        onSelectQuickFilter={handleSelectQuickFilter}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 2. Search & Controls Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', alignItems: 'center' }}>
        <MapSearchBox
          onSelectResult={handleSelectSearchResult}
          onClear={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
        />

        <MapLayerControls
          activeLayer={activeLayer}
          onSelectLayer={setActiveLayer}
        />
      </div>

      {/* 3. Problem Category Filter Bar */}
      <CategoryFilterBar
        selectedCategory={filters.category || 'all'}
        onSelectCategory={handleSelectCategory}
        categoryCounts={categoryCounts}
        totalCount={incidentService.getAllIncidents().length}
      />

      {/* 4. Main Geospatial Workspace Grid */}
      <div className="map-workspace-grid">
        {/* Interactive Leaflet Map Column */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <RiskMapLeaflet
            incidents={filteredIncidents}
            selectedIncident={selectedIncident || undefined}
            onSelectIncident={setSelectedIncident}
            activeLayer={activeLayer}
            selectedDistrict={selectedDistrict}
            focusCoordinates={focusCoordinates}
            focusZoom={focusZoom}
            height="620px"
            onSelectDistrict={setSelectedDistrict}
          />

          {/* Empty state when zero incidents match active filters */}
          {filteredIncidents.length === 0 && (
            <div style={{ marginTop: '1rem' }}>
              <EmptyState
                title="No Incidents Match Selected Filters"
                description="There are currently no recorded incidents matching the active category, severity, or district parameters."
                iconName="Map"
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            </div>
          )}
        </div>

        {/* Right Intelligence Column (District Risk + AI Insights) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* District Risk Intelligence Panel */}
          <DistrictRiskPanel
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            onResetToStatewide={() => setSelectedDistrict('all')}
            onNavigate={onNavigate}
          />

          {/* AI Risk Insight Evidence Panel */}
          <AiRiskInsightPanel
            onFocusLocation={handleFocusFromAiInsight}
          />
        </div>
      </div>

      {/* 5. Sliding Incident Detail Drawer */}
      <IncidentDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onViewDetails={handleViewIncidentDetails}
      />
    </div>
  );
};
