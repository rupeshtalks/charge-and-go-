import React, { useState } from 'react';
import { PhotoEvidence } from '../../types';
import { formatDateTime } from '../../lib/constants';
import { Camera, Calendar, User, Eye, X } from 'lucide-react';

interface PhotoEvidenceGalleryProps {
  photos: PhotoEvidence[];
  bookingReference?: string;
}

export const PhotoEvidenceGallery: React.FC<PhotoEvidenceGalleryProps> = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEvidence | null>(null);

  const categoryLabels: Record<string, string> = {
    pickup_condition: 'Vehicle Pickup Condition',
    pickup_odometer: 'Pickup Odometer Reading',
    station_arrival: 'Station Arrival & Docking',
    charging_progress: 'Active Charging Rate',
    charging_completed: 'Completed Charge SoC',
    return_condition: 'Return Delivery & Park',
  };

  if (!photos || photos.length === 0) {
    return (
      <div
        className="cng-card"
        style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          border: '1px dashed var(--color-border)',
        }}
      >
        <Camera size={38} color="var(--color-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h4 style={{ color: 'var(--color-heading)', marginBottom: '0.4rem' }}>No Photos Logged Yet</h4>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto' }}>
          Our verified drivers log timestamped photographs at vehicle pickup, charging bays, and return handovers. Photos will automatically populate here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="cng-card"
            style={{
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {/* Image Preview */}
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden', backgroundColor: '#000' }}>
              <img
                src={photo.url}
                alt={photo.caption}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(18, 3, 24, 0.88)',
                  color: 'var(--color-orchid)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(231,176,222,0.3)',
                }}
              >
                {categoryLabels[photo.category] || photo.category}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                }}
              >
                <Eye size={12} />
                <span>Tap to view</span>
              </div>
            </div>

            {/* Metadata Footer */}
            <div style={{ padding: '0.9rem 1rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                {photo.caption}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {formatDateTime(photo.timestamp)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', textTransform: 'capitalize', fontWeight: 600 }}>
                  <User size={12} />
                  {photo.uploaderRole}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(10, 2, 14, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cng-card"
            style={{
              position: 'relative',
              maxWidth: '820px',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                background: 'rgba(0,0,0,0.65)',
                border: 'none',
                color: '#FFFFFF',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Close photo view"
            >
              <X size={20} />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption}
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', backgroundColor: '#111' }}
            />
            <div style={{ padding: '1.4rem' }}>
              <div style={{ display: 'inline-block', background: 'var(--color-orchid)', color: '#120318', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {categoryLabels[selectedPhoto.category] || selectedPhoto.category}
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-heading)', marginBottom: '0.5rem' }}>
                {selectedPhoto.caption}
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                Recorded on {formatDateTime(selectedPhoto.timestamp)} by authorized {selectedPhoto.uploaderRole}.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
