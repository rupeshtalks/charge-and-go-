import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Booking, Invoice } from '../../types';
import { StatusTimeline } from '../../components/timeline/StatusTimeline';
import { PhotoEvidenceGallery } from '../../components/gallery/PhotoEvidenceGallery';
import { InvoiceView } from '../../components/invoice/InvoiceView';
import { formatINR } from '../../lib/constants';
import { ArrowLeft, Car, Shield, FileText, Camera, Clock, Zap, Home } from 'lucide-react';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'photos' | 'invoice'>('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([api.getBookingById(id), api.getInvoiceByBookingId(id)]).then(([b, inv]) => {
        setBooking(b);
        setInvoice(inv);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '80vh', color: 'var(--color-muted)' }}>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ color: 'var(--color-heading)' }}>Booking Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>The requested reference could not be located.</p>
        <Link to="/customer" className="btn-primary">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '90px', paddingBottom: '5rem', background: 'var(--color-bg)', minHeight: '100vh', transition: 'background-color 0.25s ease' }}>
      <div className="container-custom">
        {/* Navigation Breadcrumb with One-Click Return to Dashboard */}
        <div style={{ padding: '1.2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/customer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-heading)',
              fontSize: '0.88rem',
              fontWeight: 800,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '6px 14px',
              borderRadius: '999px',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Top Summary Card */}
        <div
          className="cng-card"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-orange)', fontWeight: 800, letterSpacing: '0.08em' }}>
              Booking Reference
            </div>
            <h1 style={{ fontSize: '1.7rem', color: 'var(--color-heading)', margin: '4px 0' }}>
              {booking.referenceNumber}
            </h1>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              Placed on {booking.preferredPickupDate} &bull; Slot: {booking.preferredPickupTimeSlot}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 700 }}>
              Serviced Vehicle
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-heading)' }}>
              {booking.vehicle.make} {booking.vehicle.model}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-orange)', fontWeight: 700 }}>
              {booking.vehicle.registrationNumber}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 700 }}>
              Financial Total
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
              {formatINR(booking.finalInvoiceTotal || booking.estimatedTotal)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              (Fixed ₹100 service fee + energy)
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '2px solid var(--color-border)',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '0.8rem 1.4rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'timeline' ? '3px solid var(--color-orange)' : '3px solid transparent',
              color: activeTab === 'timeline' ? 'var(--color-heading)' : 'var(--color-muted)',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={16} />
            <span>Status Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            style={{
              padding: '0.8rem 1.4rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'photos' ? '3px solid var(--color-orange)' : '3px solid transparent',
              color: activeTab === 'photos' ? 'var(--color-heading)' : 'var(--color-muted)',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Camera size={16} />
            <span>Inspection Photos ({booking.photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invoice')}
            style={{
              padding: '0.8rem 1.4rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'invoice' ? '3px solid var(--color-orange)' : '3px solid transparent',
              color: activeTab === 'invoice' ? 'var(--color-heading)' : 'var(--color-muted)',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={16} />
            <span>Tax Invoice</span>
          </button>
        </div>

        {/* Active Tab Views */}
        {activeTab === 'timeline' && <StatusTimeline timeline={booking.timeline} currentStatus={booking.status} />}
        {activeTab === 'photos' && <PhotoEvidenceGallery photos={booking.photos} bookingReference={booking.referenceNumber} />}
        {activeTab === 'invoice' && invoice && <InvoiceView invoice={invoice} />}
      </div>
    </div>
  );
};
