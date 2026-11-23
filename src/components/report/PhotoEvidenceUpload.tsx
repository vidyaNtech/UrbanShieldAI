import React, { useState, useRef } from 'react';
import type { ReportPhotoEvidence } from '../../types/incident';
import { 
  UploadCloud, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Info
} from 'lucide-react';

interface PhotoEvidenceUploadProps {
  photos: ReportPhotoEvidence[];
  onChange: (photos: ReportPhotoEvidence[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

export const PhotoEvidenceUpload: React.FC<PhotoEvidenceUploadProps> = ({
  photos,
  onChange,
  maxFiles = 5,
  maxSizeMb = 10
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track ongoing reader operations to prevent concurrent selections from exceeding maxFiles
  const pendingCountRef = useRef<number>(0);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    // Account for both confirmed photos and photos currently being read by FileReader
    const activeTotal = photos.length + pendingCountRef.current;
    const remainingSlots = maxFiles - activeTotal;
    if (remainingSlots <= 0) {
      setErrorMsg(`Maximum of ${maxFiles} photographs allowed per report. (${pendingCountRef.current} upload(s) currently in progress).`);
      return;
    }

    const allSelected = Array.from(fileList);
    const messages: string[] = [];

    if (allSelected.length > remainingSlots) {
      messages.push(`Only ${remainingSlots} photo slot(s) available. The last ${allSelected.length - remainingSlots} file(s) were not queued.`);
    }

    const candidateFiles = allSelected.slice(0, remainingSlots);
    const validFiles: File[] = [];

    candidateFiles.forEach(file => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        messages.push(`"${file.name}" is not a supported format (JPG, PNG, WEBP).`);
        return;
      }

      // Validate size
      if (file.size > maxSizeMb * 1024 * 1024) {
        messages.push(`"${file.name}" exceeds the ${maxSizeMb}MB maximum limit.`);
        return;
      }

      validFiles.push(file);
    });

    if (messages.length > 0) {
      setErrorMsg(messages.join(' '));
    }

    if (validFiles.length === 0) {
      return;
    }

    // Reserve pending slots immediately so rapid successive selections respect the quota
    pendingCountRef.current += validFiles.length;

    const newPhotos: ReportPhotoEvidence[] = [];
    let completedCount = 0;

    validFiles.forEach(file => {
      const reader = new FileReader();

      const finishOne = (loadedPhoto?: ReportPhotoEvidence) => {
        completedCount++;
        pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
        
        if (loadedPhoto) {
          // Content-aware deduplication: check if identical image dataUrl is already present
          const isContentDuplicate = photos.some(p => p.dataUrl === loadedPhoto.dataUrl) ||
                                     newPhotos.some(p => p.dataUrl === loadedPhoto.dataUrl);
          if (isContentDuplicate) {
            setErrorMsg(`"${loadedPhoto.name}" contains duplicate image content to an existing upload.`);
          } else {
            newPhotos.push(loadedPhoto);
          }
        }

        if (completedCount === validFiles.length) {
          if (newPhotos.length > 0) {
            onChange([...photos, ...newPhotos]);
          }
        }
      };

      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && result.trim().length > 0) {
          finishOne({
            id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            name: file.name,
            size: file.size,
            dataUrl: result,
            uploadedAt: new Date().toISOString()
          });
        } else {
          setErrorMsg(`Empty or unreadable data in "${file.name}".`);
          finishOne();
        }
      };

      reader.onerror = () => {
        setErrorMsg(`Failed to read "${file.name}".`);
        finishOne();
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (idToRemove: string) => {
    const updated = photos.filter(p => p.id !== idToRemove);
    onChange(updated);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="photo-evidence-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Informational Guidance Banner */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.875rem 1rem',
          backgroundColor: 'rgba(13, 148, 136, 0.06)',
          border: '1px solid rgba(13, 148, 136, 0.25)',
          borderRadius: 'var(--radius-md, 8px)',
          fontSize: '0.875rem',
          color: 'var(--text-main, #1e293b)'
        }}
      >
        <Info size={18} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <strong>Photographic Evidence Guidelines:</strong>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #475569)', fontSize: '0.8125rem' }}>
            Clear photos assist field engineers and disaster response units in verifying severity promptly. 
            Photographs are optional; if you cannot take a photo, you may proceed with detailed location and problem descriptions.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-md, 6px)',
            color: '#b91c1c',
            fontSize: '0.8125rem'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          borderRadius: 'var(--radius-md, 8px)',
          border: `2px dashed ${dragActive ? '#0d9488' : 'var(--border-color, #cbd5e1)'}`,
          backgroundColor: dragActive ? 'rgba(13, 148, 136, 0.05)' : 'var(--bg-muted, #f8fafc)',
          cursor: photos.length >= maxFiles ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          disabled={photos.length >= maxFiles}
          onChange={(e) => processFiles(e.target.files)}
          style={{ display: 'none' }}
        />

        <div 
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(13, 148, 136, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.875rem',
            color: '#0d9488'
          }}
        >
          <UploadCloud size={28} />
        </div>

        <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main, #1e293b)', margin: '0 0 0.25rem 0' }}>
          Drag and drop incident photographs here, or <span style={{ color: '#0d9488', textDecoration: 'underline' }}>browse</span>
        </p>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
          Supports JPG, JPEG, PNG, WEBP (Up to {maxSizeMb}MB per file • Max {maxFiles} images)
        </p>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.5rem' }}>
          {photos.length} of {maxFiles} photos uploaded
        </p>
      </div>

      {/* Photo Previews Grid */}
      {photos.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', marginBottom: '0.75rem' }}>
            Attached Evidence ({photos.length})
          </h4>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1rem'
            }}
          >
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                style={{
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: 'var(--radius-md, 8px)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', height: '130px', backgroundColor: '#f1f5f9' }}>
                  <img
                    src={photo.dataUrl}
                    alt={photo.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(photo.id);
                    }}
                    title="Remove photograph"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '6px',
                      left: '6px',
                      padding: '2px 6px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      borderRadius: '4px',
                      fontWeight: 500
                    }}
                  >
                    Photo #{idx + 1}
                  </span>
                </div>

                <div style={{ padding: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div 
                    title={photo.name}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-main, #1e293b)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {photo.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>
                    {formatFileSize(photo.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prototype AI Pre-Triage Assessment Interface (Clearly Labeled DEMO SIMULATION) */}
      <div 
        style={{
          border: '1px solid #0d9488',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(13, 148, 136, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: '#0d9488' }} />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main, #1e293b)' }}>
              Vision Pre-Triage Model Pipeline
            </span>
          </div>
          <span
            style={{
              padding: '2px 8px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#475569',
              letterSpacing: '0.5px'
            }}
          >
            DEMO SIMULATION
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted, #475569)', lineHeight: 1.45 }}>
          {photos.length > 0 ? (
            <>
              <strong>Preliminary Pre-Check:</strong> {photos.length} image(s) queued for edge telemetry validation. 
              In production, the deep neural model will extract edge segmentation, pothole surface volumetric estimates, and road obstruction bounding boxes upon server intake.
            </>
          ) : (
            <>
              <strong>No photo provided:</strong> Automated visual edge triage will be skipped. 
              The report will proceed through standard geospatial radius verification by local municipal authorities.
            </>
          )}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
          <CheckCircle2 size={14} style={{ color: '#0d9488' }} />
          <span>Service boundary intact: Ready for asynchronous FastAPI / PyTorch inference microservice integration.</span>
        </div>
      </div>
    </div>
  );
};
