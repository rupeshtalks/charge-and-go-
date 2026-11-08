import React from 'react';
import { BookingStatus, StatusTimelineEvent } from '../../types';
import { STATUS_METADATA, formatDateTime } from '../../lib/constants';
import { CheckCircle2, Clock, MapPin, Zap, ArrowRight, Camera } from 'lucide-react';

interface StatusTimelineProps {
  timeline: StatusTimelineEvent[];
  currentStatus: BookingStatus;
  onViewPhoto?: (url: string, caption?: string) => void;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  timeline,
  currentStatus,
  onViewPhoto,
}) => {
  const currentMeta = STATUS_METADATA[currentStatus] || STATUS_METADATA.requested;

  return (
    <div style={{ position: 'relative' }}>
      {/* Current Status Highlight Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2A0932 0%, #15021C 100%)',
          color: '#FFFFFF',
          padding: '1.6rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-orchid)', marginBottom: '4px', fontWeight: 800 }}>
            Current Live Status
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: currentMeta.color,
                boxShadow: `0 0 12px ${currentMeta.color}`,
                display: 'inline-block',
              }}
            />
            {currentMeta.label}
          </div>
          <div style={{ fontSize: '0.88rem', color: '#D8C9DD', marginTop: '4px' }}>
            {currentMeta.description}
          </div>
        </div>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {timeline.length} Updates Recorded
        </div>
      </div>

      {/* Chronological Vertical Milestones */}
      <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
        {/* Continuous connecting track line */}
        <div
          style={{
            position: 'absolute',
            left: '14px',
            top: '8px',
            bottom: '24px',
            width: '2px',
            background: 'linear-gradient(to bottom, var(--color-orange), var(--color-orchid), var(--color-border))',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          {timeline.map((event, idx) => {
            const isLatest = idx === timeline.length - 1;

            return (
              <div key={idx} style={{ position: 'relative' }}>
                {/* Node icon pill */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.5rem',
                    top: '2px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: isLatest ? 'var(--color-orange)' : 'var(--color-surface)',
                    border: `2px solid ${isLatest ? 'var(--color-orange)' : 'var(--color-orchid)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isLatest ? '0 0 14px var(--color-orange-glow)' : 'var(--shadow-subtle)',
                    zIndex: 2,
                  }}
                >
                  {isLatest ? (
                    <Zap size={15} color="#FFFFFF" />
                  ) : (
                    <CheckCircle2 size={16} color="var(--color-orchid)" />
                  )}
                </div>

                {/* Card Container */}
                <div
                  className="cng-card"
                  style={{
                    border: isLatest ? '1px solid var(--color-orchid)' : '1px solid var(--color-border)',
                    padding: '1.3rem',
                    boxShadow: isLatest ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
                      {event.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                      <Clock size={13} />
                      <span>{formatDateTime(event.timestamp)}</span>
                    </div>
                  </div>

                  <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                    {event.description}
                  </p>

                  {/* Telemetry metadata tags (if recorded) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'var(--color-surface-soft)',
                        color: 'var(--color-heading)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      Logged by: {event.actorRole}
                    </span>

                    {typeof event.batteryPercentage === 'number' && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'var(--color-orange-subtle)',
                          color: 'var(--color-orange)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid rgba(255, 90, 10, 0.25)',
                        }}
                      >
                        <Zap size={12} /> Battery: {event.batteryPercentage}%
                      </span>
                    )}

                    {typeof event.odometerReading === 'number' && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'var(--color-surface-soft)',
                          color: 'var(--color-heading)',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        Odometer: {event.odometerReading.toLocaleString('en-IN')} km
                      </span>
                    )}

                    {event.evidencePhotoUrl && (
                      <button
                        onClick={() => onViewPhoto && onViewPhoto(event.evidencePhotoUrl!, event.title)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--color-orchid)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--color-heading)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <Camera size={12} color="var(--color-orange)" />
                        <span>View Photo Proof</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
