import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import { NavIcon } from '../common/NavIcon';
import { StatusBadge } from '../common/StatusBadge';
import { LocationPickerMap } from '../report/LocationPickerMap';
import { PhotoEvidenceUpload } from '../report/PhotoEvidenceUpload';
import { incidentService } from '../../services/incidentService';
import { INCIDENT_CATEGORIES, getCategoryMeta } from '../../config/incidentCategories';
import type { 
  IncidentCategory, 
  IncidentSeverity, 
  SafetyHazardIndicator, 
  ReportPhotoEvidence,
  UrbanIncident 
} from '../../types/incident';
import type { UserProfile } from '../../types/auth';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Shield, 
  PlusCircle
} from 'lucide-react';

interface ReportProblemViewProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

interface SafetyOption {
  id: SafetyHazardIndicator;
  label: string;
  description: string;
}

const SAFETY_INDICATORS: SafetyOption[] = [
  { id: 'traffic_obstruction', label: 'Traffic Obstruction', description: 'Blocks or slows vehicular movement on key carriageways' },
  { id: 'risk_to_pedestrians', label: 'Risk to Pedestrians', description: 'Hazardous footpaths, deep exposed pits, or slippery surfaces' },
  { id: 'water_accumulation', label: 'Water Accumulation', description: 'Stagnant water, vector risk, or submerged road sections' },
  { id: 'property_damage', label: 'Possible Property Damage', description: 'Risk of wall collapse, tree branch falling, or vehicle tire damage' },
  { id: 'immediate_safety_concern', label: 'Immediate Public Safety Concern', description: 'Requires rapid response dispatch to avert imminent accidents' }
];

const SEVERITY_LEVELS: { id: IncidentSeverity; label: string; desc: string; color: string; badge: 'low' | 'moderate' | 'high' | 'critical' }[] = [
  { id: 'low', label: 'Low', desc: 'Minor inconvenience; does not pose immediate hazard.', color: '#10b981', badge: 'low' },
  { id: 'moderate', label: 'Moderate', desc: 'Noticeable issue; causing inconvenience or gradual degradation.', color: '#0d9488', badge: 'moderate' },
  { id: 'high', label: 'High', desc: 'Substantial hazard; risk of vehicular damage or injury.', color: '#f59e0b', badge: 'high' },
  { id: 'critical', label: 'Critical', desc: 'Immediate emergency; severe danger to life, transit, or infrastructure.', color: '#ef4444', badge: 'critical' }
];

export const ReportProblemView: React.FC<ReportProblemViewProps> = ({ user, onNavigate }) => {
  // Step indicator state (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [category, setCategory] = useState<IncidentCategory>('potholes');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [observedSeverity, setObservedSeverity] = useState<IncidentSeverity>('moderate');
  const [firstObserved, setFirstObserved] = useState('');
  const [safetyIndicators, setSafetyIndicators] = useState<SafetyHazardIndicator[]>([]);

  // Location State
  const [district, setDistrict] = useState(user.district || 'Bengaluru Urban');
  const [cityOrTown, setCityOrTown] = useState('Bengaluru');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(12.9716);
  const [longitude, setLongitude] = useState<number | undefined>(77.5946);
  const [locationVerified, setLocationVerified] = useState<boolean>(false);

  // Photo Evidence State
  const [photos, setPhotos] = useState<ReportPhotoEvidence[]>([]);

  // Form Submission & UX States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<UrbanIncident | null>(null);

  // Toggle safety indicators
  const handleToggleSafety = (indicator: SafetyHazardIndicator) => {
    setSafetyIndicators(prev => 
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!category) newErrors.category = 'Please select a problem category.';
    if (!title.trim()) {
      newErrors.title = 'Please enter a short descriptive title.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide details about what happened and what you observed.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Description should be at least 15 characters to assist verification.';
    }

    if (!observedSeverity) newErrors.observedSeverity = 'Please select your observed severity.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!district.trim()) newErrors.district = 'Please select a Karnataka district.';
    if (!cityOrTown.trim()) newErrors.cityOrTown = 'Please specify city, town, or taluk.';
    if (!area.trim()) newErrors.area = 'Please specify area, street, or locality.';
    if (!locationVerified) newErrors.location = 'Please confirm the incident location on the map or via GPS before proceeding.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step Navigation Handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cancel Handler
  const handleCancelClick = () => {
    const hasData = title.trim().length > 0 || description.trim().length > 0 || photos.length > 0;
    if (hasData) {
      setShowCancelModal(true);
    } else {
      onNavigate('#/citizen/my-reports');
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onNavigate('#/citizen/my-reports');
  };

  // Final Submission
  const handleSubmitReport = async () => {
    if (isSubmitting) return; // Prevent concurrent rapid submissions

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate minor dispatch latency
      await new Promise(res => setTimeout(res, 400));

      const created = incidentService.createReport({
        category,
        title: title.trim(),
        description: description.trim(),
        observedSeverity,
        firstObserved: firstObserved || undefined,
        safetyIndicators,
        state: 'Karnataka',
        district,
        cityOrTown: cityOrTown.trim(),
        area: area.trim(),
        landmark: landmark.trim() || undefined,
        latitude,
        longitude,
        locationVerified,
        photos,
        reportedByUserId: user.id,
        reportedByUserName: user.fullName,
        reportedByUserEmail: user.email
      });

      setSubmittedIncident(created);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to submit report', err);
      setErrors({ submit: 'Failed to record incident report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to submit another report
  const handleResetForAnother = () => {
    setSubmittedIncident(null);
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setArea('');
    setLandmark('');
    setPhotos([]);
    setSafetyIndicators([]);
    setFirstObserved('');
  };

  // ==========================================
  // CONFIRMATION SCREEN
  // ==========================================
  if (submittedIncident) {
    const catMeta = getCategoryMeta(submittedIncident.category);
    return (
      <div className="report-success-view" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div 
          style={{
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-color, #cbd5e1)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
            textAlign: 'center'
          }}
        >
          {/* Animated Success Badge */}
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Check size={36} strokeWidth={3} />
          </div>

          <h2 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.5rem 0' }}>
            Report Submitted Successfully
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9375rem', maxWidth: '540px', margin: '0 auto 1.75rem auto', lineHeight: 1.5 }}>
            Thank you for contributing to Karnataka&apos;s urban safety intelligence. Your incident has been cataloged into the telemetry registry and scheduled for authority review.
          </p>

          {/* Incident Confirmation Card */}
          <div 
            style={{
              backgroundColor: 'var(--bg-muted, #f8fafc)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Incident Tracking ID</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0d9488', fontFamily: 'monospace' }}>
                  {submittedIncident.id}
                </div>
              </div>

              <StatusBadge
                label="Submitted — Awaiting Verification"
                variant="normal"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '2px' }}>Problem Category</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                  <NavIcon name={catMeta.iconName} size={16} style={{ color: catMeta.color }} />
                  {catMeta.label}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '2px' }}>Reported Location</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                  {submittedIncident.area}, {submittedIncident.cityOrTown}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                  {submittedIncident.district}, Karnataka
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '2px' }}>Submission Timestamp</span>
                <div style={{ fontWeight: 500, color: 'var(--text-main, #1e293b)', fontSize: '0.875rem' }}>
                  {new Date(submittedIncident.reportedAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '2px' }}>Photographs Attached</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                  {submittedIncident.evidencePhotos?.length || 0} photo(s)
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => onNavigate('#/citizen/my-reports')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.1))'
              }}
            >
              <FileText size={18} />
              View in My Reports
            </button>

            <button
              type="button"
              onClick={() => onNavigate('#/risk-map')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #1e293b)',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: 'var(--radius-md, 8px)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: 'pointer'
              }}
            >
              <MapPin size={18} style={{ color: '#0d9488' }} />
              Locate on Live Risk Map
            </button>

            <button
              type="button"
              onClick={handleResetForAnother}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'transparent',
                color: 'var(--text-muted, #64748b)',
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={16} />
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP FORM FLOW
  // ==========================================
  return (
    <div className="report-problem-container" style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <PageHeader
        title="Report an Urban Problem"
        subtitle="Help identify risks and improve public safety across Karnataka."
        breadcrumbs={[
          { label: 'Citizen Portal', path: '#/citizen/overview' },
          { label: 'Report a Problem', isCurrent: true }
        ]}
        actions={
          <button
            type="button"
            onClick={handleCancelClick}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--text-muted, #64748b)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: 'var(--radius-md, 6px)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        }
      />

      {/* Step Indicator Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-color, #cbd5e1)',
          padding: '1rem 1.5rem',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))'
        }}
      >
        {[
          { num: 1, label: 'Problem Details' },
          { num: 2, label: 'Location' },
          { num: 3, label: 'Evidence' },
          { num: 4, label: 'Review & Submit' }
        ].map((step, idx) => {
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;

          return (
            <React.Fragment key={step.num}>
              <div 
                onClick={() => {
                  // Allow jumping back to earlier completed steps
                  if (isDone) setCurrentStep(step.num);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  cursor: isDone ? 'pointer' : 'default',
                  opacity: isActive || isDone ? 1 : 0.6
                }}
              >
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isDone ? '#10b981' : isActive ? '#0d9488' : '#e2e8f0',
                    color: isDone || isActive ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isDone ? <Check size={16} strokeWidth={3} /> : step.num}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Step {step.num}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-main, #0f172a)' : 'var(--text-muted, #64748b)' }}>
                    {step.label}
                  </span>
                </div>
              </div>

              {idx < 3 && (
                <div 
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: isDone ? '#10b981' : '#e2e8f0',
                    margin: '0 0.75rem',
                    minWidth: '24px'
                  }} 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#dc2626' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Discard Unfinished Report?</h3>
            </div>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              You have entered problem details. If you cancel now, your draft report data will be discarded.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Discard Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Step Content Card */}
      <div 
        style={{
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: 'var(--radius-lg, 10px)',
          border: '1px solid var(--border-color, #cbd5e1)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem'
        }}
      >
        {/* ==================================================== */}
        {/* STEP 1: PROBLEM DETAILS                             */}
        {/* ==================================================== */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.25rem 0' }}>
                1. Select Problem Category & Nature
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                Choose the category that best matches the civic hazard you are reporting.
              </p>
            </div>

            {/* Category Selector Grid */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.625rem' }}>
                Problem Category <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                {INCIDENT_CATEGORIES.map(cat => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-color, #e2e8f0)',
                        backgroundColor: isSelected ? cat.bgColor : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? cat.color : '#f1f5f9',
                          color: isSelected ? '#ffffff' : cat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <NavIcon name={cat.iconName} size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: isSelected ? cat.color : 'var(--text-main, #1e293b)' }}>
                          {cat.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.375rem' }}>{errors.category}</p>
              )}
            </div>

            {/* Short Title */}
            <div>
              <label 
                htmlFor="report-title"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.375rem' }}
              >
                Short Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="report-title"
                type="text"
                placeholder='e.g. Deep pothole near the bus stop on Outer Ring Road'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: errors.title ? '1.5px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontSize: '0.875rem',
                  color: 'var(--text-main, #1e293b)'
                }}
              />
              {errors.title && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.title}</p>
              )}
            </div>

            {/* Detailed Description */}
            <div>
              <label 
                htmlFor="report-description"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.375rem' }}
              >
                Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="report-description"
                rows={4}
                placeholder="Explain what happened, what you observed, approximate dimensions, and whether the issue is getting worse after recent rain..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: errors.description ? '1.5px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontSize: '0.875rem',
                  color: 'var(--text-main, #1e293b)',
                  lineHeight: 1.5,
                  fontFamily: 'inherit'
                }}
              />
              {errors.description && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.description}</p>
              )}
            </div>

            {/* Observed Severity (Required) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                  Observed Severity <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                  (Citizen-observed assessment, subject to authority triage)
                </span>
              </div>

              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                {SEVERITY_LEVELS.map(sev => {
                  const isSelected = observedSeverity === sev.id;
                  return (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setObservedSeverity(sev.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: isSelected ? `2px solid ${sev.color}` : '1px solid var(--border-color, #e2e8f0)',
                        backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.05)' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? sev.color : 'var(--text-main, #1e293b)' }}>
                          {sev.label}
                        </span>
                        <div 
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: sev.color
                          }} 
                        />
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.35 }}>
                        {sev.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* First Observed (Optional) */}
            <div>
              <label 
                htmlFor="first-observed"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.375rem' }}
              >
                First Observed (Optional)
              </label>
              <input
                id="first-observed"
                type="text"
                placeholder="e.g. Started 2 days ago after heavy evening downpour"
                value={firstObserved}
                onChange={(e) => setFirstObserved(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontSize: '0.875rem',
                  color: 'var(--text-main, #1e293b)'
                }}
              />
            </div>

            {/* Safety Indicators (Optional Multi-Select) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.5rem' }}>
                Safety & Hazard Indicators (Select all that apply)
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {SAFETY_INDICATORS.map(ind => {
                  const isChecked = safetyIndicators.includes(ind.id);
                  return (
                    <label
                      key={ind.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.625rem 0.875rem',
                        borderRadius: 'var(--radius-md, 6px)',
                        border: isChecked ? '1px solid #0d9488' : '1px solid #e2e8f0',
                        backgroundColor: isChecked ? 'rgba(13, 148, 136, 0.04)' : '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSafety(ind.id)}
                        style={{ marginTop: '3px', accentColor: '#0d9488' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                          {ind.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                          {ind.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Privacy & Civic Trust Notice */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--bg-muted, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted, #475569)'
              }}
            >
              <Shield size={18} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Civic Privacy Commitment:</strong> The hazard location and submitted photos will be shared with authorized municipal engineers and disaster teams to investigate this civic problem. UrbanShield AI never requests sensitive personal identifiers unrelated to incident verification.
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: PRECISE LOCATION                            */}
        {/* ==================================================== */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.25rem 0' }}>
                2. Pinpoint Incident Location
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                Accurate geospatial telemetry ensures the appropriate Karnataka zonal authority is notified.
              </p>
            </div>

            <LocationPickerMap
              district={district}
              cityOrTown={cityOrTown}
              area={area}
              landmark={landmark}
              latitude={latitude}
              longitude={longitude}
              locationVerified={locationVerified}
              onChange={(fields) => {
                if (fields.district !== undefined) setDistrict(fields.district);
                if (fields.cityOrTown !== undefined) setCityOrTown(fields.cityOrTown);
                if (fields.area !== undefined) setArea(fields.area);
                if (fields.landmark !== undefined) setLandmark(fields.landmark);
                if (fields.latitude !== undefined) setLatitude(fields.latitude);
                if (fields.longitude !== undefined) setLongitude(fields.longitude);
                if (fields.locationVerified !== undefined) setLocationVerified(fields.locationVerified);
              }}
              errors={errors}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: PHOTO AND EVIDENCE UPLOAD                   */}
        {/* ==================================================== */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.25rem 0' }}>
                3. Photographic Evidence
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                Upload photos of the problem to accelerate field verification and dispatch.
              </p>
            </div>

            <PhotoEvidenceUpload
              photos={photos}
              onChange={setPhotos}
              maxFiles={5}
              maxSizeMb={10}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: REVIEW AND SUBMIT                           */}
        {/* ==================================================== */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.25rem 0' }}>
                4. Review Report Summary
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                Please review all details before formal submission to Karnataka urban telemetry.
              </p>
            </div>

            {/* Comprehensive Review Card */}
            <div 
              style={{
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                overflow: 'hidden'
              }}
            >
              {/* Section 1: Problem Details Summary */}
              <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.5px' }}>
                    1. Problem Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d9488',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Edit Details
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <div 
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: getCategoryMeta(category).bgColor,
                      border: `1px solid ${getCategoryMeta(category).borderColor}`,
                      color: getCategoryMeta(category).color,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <NavIcon name={getCategoryMeta(category).iconName} size={14} />
                    {getCategoryMeta(category).label}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>•</span>

                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-main, #1e293b)' }}>
                    Observed Severity: <strong style={{ textTransform: 'capitalize' }}>{observedSeverity}</strong>
                  </span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.5rem 0' }}>
                  {title}
                </h4>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #475569)', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                  {description}
                </p>

                {firstObserved && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', marginBottom: '0.5rem' }}>
                    <strong>First Observed:</strong> {firstObserved}
                  </div>
                )}

                {safetyIndicators.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                    {safetyIndicators.map(ind => {
                      const opt = SAFETY_INDICATORS.find(s => s.id === ind);
                      return (
                        <span 
                          key={ind} 
                          style={{
                            padding: '2px 8px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            color: '#475569'
                          }}
                        >
                          {opt?.label || ind}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Location Summary */}
              <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.5px' }}>
                    2. Location Telemetry
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d9488',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Edit Location
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>Address / Area</span>
                    <strong style={{ color: 'var(--text-main, #1e293b)' }}>{area}</strong>
                    {landmark && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Ref: {landmark}</div>}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>City & District</span>
                    <strong style={{ color: 'var(--text-main, #1e293b)' }}>{cityOrTown}, {district}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Karnataka, India</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>Coordinates</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                      {latitude?.toFixed(5)}° N, {longitude?.toFixed(5)}° E
                    </span>
                    <div style={{ marginTop: '4px' }}>
                      {locationVerified ? (
                        <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>GPS Verified</span>
                      ) : (
                        <span style={{ color: '#b45309', fontSize: '0.75rem' }}>Manually Specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Evidence Summary */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.5px' }}>
                    3. Evidence Photographs ({photos.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d9488',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Edit Photos
                  </button>
                </div>

                {photos.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', margin: 0, fontStyle: 'italic' }}>
                    No photos uploaded. (Submission will proceed using descriptive and geospatial telemetry.)
                  </p>
                ) : (
                  <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {photos.map((p, idx) => (
                      <div 
                        key={p.id}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '1px solid #cbd5e1',
                          flexShrink: 0,
                          position: 'relative'
                        }}
                      >
                        <img 
                          src={p.dataUrl} 
                          alt={p.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '1px 4px', borderRadius: '2px' }}>
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: 'var(--radius-md, 6px)',
                  color: '#b91c1c',
                  fontSize: '0.875rem'
                }}
              >
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP CONTROLS (Back / Next / Submit)                */}
        {/* ==================================================== */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            paddingTop: '1.25rem',
            marginTop: '0.5rem'
          }}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.625rem 1.125rem',
                backgroundColor: 'transparent',
                color: 'var(--text-main, #1e293b)',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: 'var(--radius-md, 6px)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelClick}
              style={{
                padding: '0.625rem 1.125rem',
                backgroundColor: 'transparent',
                color: 'var(--text-muted, #64748b)',
                border: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.1))'
                }}
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.75rem',
                  backgroundColor: isSubmitting ? '#64748b' : '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(13, 148, 136, 0.35))'
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Check size={18} strokeWidth={2.5} />
                    Submit Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
