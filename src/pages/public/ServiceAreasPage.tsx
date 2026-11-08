import React, { useState } from 'react';
import { api } from '../../services/api';
import { MapPin, Search, CheckCircle, AlertCircle, Building, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServiceAreasPage: React.FC = () => {
  const [pinInput, setPinInput] = useState('');
  const [result, setResult] = useState<{ covered: boolean; message: string } | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    const res = await api.checkPinCode(pinInput);
    setResult(res);
  };

  const localities = [
    { name: 'Rajpur Road', hub: 'Rajpur Gateway Hub (60kW / 120kW DC)', status: 'Active' },
    { name: 'Jakhan & Pacific Hills', hub: 'Rajpur Gateway Hub', status: 'Active' },
    { name: 'Hathibarkala & Survey Estate', hub: 'Rajpur Gateway Hub', status: 'Active' },
    { name: 'Vasant Vihar', hub: 'GreenGrid Express GMS Bay', status: 'Active' },
    { name: 'Ballupur & Kaulagarh', hub: 'GreenGrid Express GMS Bay', status: 'Active' },
    { name: 'GMS Road & Kamla Palace', hub: 'GreenGrid Express GMS Bay', status: 'Active' },
    { name: 'Dalanwala', hub: 'East Doon EV Fast Corridor', status: 'Active' },
    { name: 'Race Course & Subhash Nagar', hub: 'East Doon EV Fast Corridor', status: 'Active' },
  ];

  return (
    <div style={{ paddingTop: '80px', background: 'var(--color-bg)' }}>
      {/* Header */}
      <section style={{ background: 'var(--color-eggplant)', color: '#FFFFFF', padding: '5rem 0 4rem 0', textAlign: 'center' }}>
        <div className="container-custom">
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-orchid)' }}>
            Operational Pilot
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Service Coverage: Dehradun Town
          </h1>
          <p style={{ color: 'rgba(250, 248, 246, 0.85)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
            Charge & Go is actively operating across prime residential and commercial corridors in Dehradun, Uttarakhand.
          </p>
        </div>
      </section>

      <section style={{ padding: '5rem 0' }}>
        <div className="container-custom">
          {/* PIN Code Checker */}
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto 4rem auto',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', color: 'var(--color-heading)', marginBottom: '0.6rem' }}>
              Check PIN Code Service Availability
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Enter your 6-digit postal code to verify if your home or office address is inside our active concierge radius.
            </p>

            <form onSubmit={handleCheck} style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 248001)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={6}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '0.85rem 1.2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #D1D5DB',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.85rem 1.8rem' }}>
                <Search size={16} />
                <span>Verify Coverage</span>
              </button>
            </form>

            {result && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1.2rem',
                  borderRadius: 'var(--radius-md)',
                  background: result.covered ? '#D1FAE5' : '#FEF3C7',
                  border: result.covered ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                  color: result.covered ? '#065F46' : '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                }}
              >
                {result.covered ? <CheckCircle size={22} color="#059669" /> : <AlertCircle size={22} color="#D97706" />}
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{result.message}</div>
              </div>
            )}
          </div>

          {/* Active Localities Table */}
          <div style={{ maxWidth: '840px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-heading)', marginBottom: '1.2rem' }}>
              Supported Localities in Dehradun
            </h3>
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'var(--color-lavender)' }}>
                {localities.map((loc, i) => (
                  <div key={i} style={{ background: 'var(--color-surface)', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-heading)', fontSize: '1.05rem' }}>{loc.name}</span>
                      <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase' }}>
                        {loc.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={13} color="var(--color-orange)" />
                      <span>Partner: {loc.hub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/book" className="btn-primary" style={{ padding: '0.9rem 2.2rem' }}>
                Schedule Pickup in Dehradun (₹100 Fee)
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
