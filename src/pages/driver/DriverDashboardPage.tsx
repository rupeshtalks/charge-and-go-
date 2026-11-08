import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import { STATUS_METADATA } from '../../lib/constants';
import {
  Car,
  Navigation,
  Camera,
  CheckCircle2,
  Zap,
  Phone,
  MapPin,
  Clock,
  Gauge,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const DriverDashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
  const [batteryInput, setBatteryInput] = useState<number>(30);
  const [odometerInput, setOdometerInput] = useState<number>(12500);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    api.getBookings()
      .then((all) => {
        if (!mounted) return;
        setJobs(all);
        if (all.length > 0) setSelectedJob(all[0]);
      })
      .catch(() => {
        if (mounted) setErrorMsg('Unable to load assigned jobs. Please refresh.');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateStatus = async (
    newStatus: BookingStatus,
    title: string,
    desc: string
  ) => {
    if (!selectedJob || submitting) return;

    if (batteryInput < 0 || batteryInput > 100) {
      setErrorMsg('Battery percentage must be between 0 and 100.');
      return;
    }

    if (odometerInput < 0) {
      setErrorMsg('Please enter a valid odometer reading.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const updated = await api.updateBookingStatus(selectedJob.id, newStatus, {
        title,
        description: desc,
        actorRole: 'driver',
        batteryPercentage: batteryInput,
        odometerReading: odometerInput,
        photoUrl:
          'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
        photoCategory: 'pickup_condition',
      });

      setSelectedJob(updated);
      setActionSuccess(`Mission updated: ${title}`);

      const refreshed = await api.getBookings();
      setJobs(refreshed);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to update mission status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeJobs = jobs.filter(
    (j) => j.status !== 'completed' && j.status !== 'cancelled'
  );

  const completedJobs = jobs.filter((j) => j.status === 'completed');

  // RED / GREEN STATUS LABELS
  const getStatusStyle = (status: string): React.CSSProperties => {
    if (status === 'completed') {
      return {
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#34D399',
        border: '1px solid #10B981',
      };
    }

    if (status === 'cancelled') {
      return {
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#F87171',
        border: '1px solid #EF4444',
      };
    }

    return {
      background: 'rgba(255, 101, 13, 0.13)',
      color: '#FF914D',
      border: '1px solid rgba(255, 101, 13, 0.55)',
    };
  };

  const statusLabel = (status: string) =>
    STATUS_METADATA[status as BookingStatus]?.label || status;

  const statusBadge = (status: string): React.CSSProperties => ({
    ...getStatusStyle(status),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 13px',
    borderRadius: '999px',
    fontSize: '0.73rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  });

  const actionButtonStyle: React.CSSProperties = {
    minHeight: '54px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    fontSize: '0.88rem',
    fontWeight: 800,
    lineHeight: 1.4,
    textAlign: 'center',
    whiteSpace: 'normal',
    cursor: submitting ? 'not-allowed' : 'pointer',
    opacity: submitting ? 0.65 : 1,
    transition: 'all 0.2s ease',
  };

  return (
    <div
      style={{
        paddingTop: '85px',
        paddingBottom: '6rem',
        background: 'var(--color-bg)',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .driver-action-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .driver-action-grid button {
          min-width: 0;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .driver-complete-button {
          grid-column: 1 / -1;
          background: #059669 !important;
          border: 1px solid #10B981 !important;
          color: #FFFFFF !important;
        }

        .driver-complete-button:hover {
          background: #047857 !important;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
        }

        .driver-error {
          background: rgba(239, 68, 68, 0.13);
          color: #FCA5A5;
          border: 1px solid rgba(239, 68, 68, 0.6);
          padding: 13px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .driver-success {
          background: rgba(16, 185, 129, 0.13);
          color: #34D399;
          border: 1px solid #10B981;
          padding: 13px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        @media (max-width: 600px) {
          .driver-action-grid {
            grid-template-columns: 1fr;
          }

          .driver-complete-button {
            grid-column: auto;
          }

          .driver-main-card {
            padding: 1.1rem !important;
          }
        }
      `}</style>

      <div className="container-custom" style={{ maxWidth: '960px' }}>
        {/* DRIVER HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1C0521 0%, #2A0932 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '1.8rem',
            marginBottom: '1.8rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.2rem',
            border: '1px solid var(--color-border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(231,176,222,0.15)',
                border: '1px solid rgba(231,176,222,0.3)',
                padding: '4px 10px',
                borderRadius: '999px',
                marginBottom: '8px',
              }}
            >
              <Zap size={13} color="#FF650D" />
              <span
                style={{
                  fontSize: '0.74rem',
                  color: '#D9A8E8',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                }}
              >
                Mobility Operations Dispatch • Driver Console
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.6rem',
                color: '#FFFFFF',
                margin: '2px 0',
                fontFamily: 'var(--font-display)',
              }}
            >
              Pilot: Vikram Singh
            </h1>

            <div style={{ fontSize: '0.84rem', color: '#D8C9DD' }}>
              Dehradun Central Pilot Cluster • Verified EV Valet License #UK-07-DRV-882
            </div>
          </div>

          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              color: '#34D399',
              padding: '8px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
              }}
            />
            On Active Shift
          </div>
        </div>

        {/* STATISTICS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.8rem',
          }}
        >
          <div className="cng-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 800 }}>
              ACTIVE MISSIONS
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FF650D' }}>
              {activeJobs.length}
            </div>
          </div>

          <div className="cng-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 800 }}>
              COMPLETED MISSIONS
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34D399' }}>
              {completedJobs.length}
            </div>
          </div>

          <div className="cng-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 800 }}>
              SAFETY RATING
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34D399' }}>
              4.98 ★
            </div>
          </div>
        </div>

        {/* ERROR AND SUCCESS MESSAGES */}
        {errorMsg && (
          <div className="driver-error">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        {actionSuccess && (
          <div className="driver-success">
            <CheckCircle2 size={18} />
            {actionSuccess}
          </div>
        )}

        {/* SELECTED MISSION */}
        {selectedJob ? (
          <div
            className="cng-card driver-main-card"
            style={{
              padding: '2rem',
              border: '2px solid var(--color-orange)',
              marginBottom: '2.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '1.2rem',
              }}
            >
              <span style={statusBadge(selectedJob.status)}>
                {statusLabel(selectedJob.status)}
              </span>

              <span style={{ fontSize: '0.84rem', color: 'var(--color-muted)', fontWeight: 600 }}>
                Mission Ref: {selectedJob.referenceNumber}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.6rem',
                    color: 'var(--color-heading)',
                    margin: 0,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {selectedJob.vehicle.make} {selectedJob.vehicle.model}
                </h2>

                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: 'var(--color-orange)',
                    marginTop: '4px',
                  }}
                >
                  {selectedJob.vehicle.registrationNumber}
                </div>
              </div>

              <a
                href={`tel:${selectedJob.customerPhone}`}
                className="btn-secondary"
                style={{ padding: '0.65rem 1.2rem', fontSize: '0.85rem' }}
              >
                <Phone size={15} color="var(--color-orange)" />
                Call Owner ({selectedJob.customerName.split(' ')[0]})
              </a>
            </div>

            {/* PICKUP DETAILS */}
            <div
              style={{
                background: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border)',
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.8rem',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <MapPin size={18} color="var(--color-orange)" />
                <div>
                  <strong style={{ color: 'var(--color-heading)' }}>Pickup Point: </strong>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedJob.pickupAddress}, {selectedJob.pickupLocality} ({selectedJob.pickupPinCode})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--color-orchid)" />
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  Scheduled Window: <strong>{selectedJob.preferredPickupTimeSlot}</strong>
                  {' • '}Target: <strong>{selectedJob.targetBatteryPercentage}%</strong>
                </span>
              </div>
            </div>

            {/* DRIVER INPUTS */}
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '1.5rem',
                marginBottom: '1.8rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--color-heading)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Gauge size={18} color="var(--color-orange)" />
                Operational Telemetry & Inspection Logging
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.2rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '6px' }}>
                    Observed Battery %
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={batteryInput}
                    onChange={(e) => setBatteryInput(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-input-border)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '6px' }}>
                    Odometer Reading (km)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={odometerInput}
                    onChange={(e) => setOdometerInput(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-input-border)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              {/* WORKFLOW ACTIONS */}
              <div className="driver-action-grid">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    handleUpdateStatus(
                      'pickup_in_progress',
                      'Driver En Route',
                      'Pilot Vikram Singh has departed towards your pickup location.'
                    )
                  }
                  className="btn-secondary"
                  style={actionButtonStyle}
                >
                  <Navigation size={17} />
                  1. En Route to Pickup
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    handleUpdateStatus(
                      'vehicle_picked_up',
                      'Vehicle Picked Up',
                      `Vehicle received with ${batteryInput}% battery and ${odometerInput} km on odometer.`
                    )
                  }
                  className="btn-secondary"
                  style={actionButtonStyle}
                >
                  <Camera size={17} />
                  2. Confirm Pickup & Inspect
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    handleUpdateStatus(
                      'charging_in_progress',
                      'Fast DC Charging Initiated',
                      `Vehicle connected at Rajpur Gateway Hub. Target: ${selectedJob.targetBatteryPercentage}%.`
                    )
                  }
                  className="btn-primary"
                  style={actionButtonStyle}
                >
                  <Zap size={17} />
                  3. Start Fast Charge
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    handleUpdateStatus(
                      'return_in_progress',
                      'Returning Vehicle',
                      'Fast charging completed to target. Returning vehicle to owner residence.'
                    )
                  }
                  className="btn-secondary"
                  style={actionButtonStyle}
                >
                  <Car size={17} />
                  4. Start Return Run
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    handleUpdateStatus(
                      'completed',
                      'Job Successfully Completed',
                      `Vehicle returned safely to owner. Final odometer logged: ${odometerInput} km.`
                    )
                  }
                  className="driver-complete-button"
                  style={actionButtonStyle}
                >
                  <CheckCircle2 size={18} />
                  {submitting ? 'Updating Mission...' : '5. Confirm Safe Handover & Complete Mission'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="cng-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: 'var(--color-muted)' }}>No jobs assigned currently.</p>
          </div>
        )}

        {/* ALL ASSIGNED JOBS */}
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>
            All Assigned Shift Runs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="cng-card"
                style={{
                  padding: '1.2rem',
                  cursor: 'pointer',
                  border:
                    selectedJob?.id === job.id
                      ? '2px solid var(--color-orange)'
                      : '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--color-heading)', fontSize: '1rem' }}>
                    {job.vehicle.make} {job.vehicle.model} ({job.vehicle.registrationNumber})
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    Pickup: {job.pickupLocality} • Customer: {job.customerName}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={statusBadge(job.status)}>
                    {statusLabel(job.status)}
                  </span>
                  <ChevronRight size={16} color="var(--color-orange)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};