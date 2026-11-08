import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Clock, Key, BatteryCharging, RotateCcw } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Book Online in Seconds',
      description: 'Specify your EV make and model, current battery percentage, target charge, and convenient pickup window.',
      icon: Key,
    },
    {
      number: '02',
      title: 'Concierge Vehicle Pickup',
      description: 'A verified Charge & Go driver arrives at your doorstep, conducts an initial 360° vehicle inspection, logs odometer and battery SoC, and collects the key.',
      icon: Clock,
    },
    {
      number: '03',
      title: 'Optimal DC Station Transit',
      description: 'The driver navigates directly to our partner fast-charging bays with guaranteed slot reservations.',
      icon: Zap,
    },
    {
      number: '04',
      title: 'Fast Charging & Telemetry Logging',
      description: 'High-power CCS2 DC charging powers your battery to the requested level (typically 80–85%). All updates stream directly to your customer dashboard.',
      icon: BatteryCharging,
    },
    {
      number: '05',
      title: 'Secure Return Delivery',
      description: 'Your EV is returned to your driveway or workplace, parked safely, and returned with key handover confirmation.',
      icon: RotateCcw,
    },
    {
      number: '06',
      title: 'Transparent Digital Invoice',
      description: 'Access your transparent invoice breaking down the fixed ₹100 service fee and actual electricity meter draw with photo proof.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div style={{ paddingTop: '80px', background: 'var(--color-bg)' }}>
      {/* Header */}
      <section style={{ background: 'var(--color-eggplant)', color: '#FFFFFF', padding: '5rem 0 4rem 0', textAlign: 'center' }}>
        <div className="container-custom">
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-orchid)' }}>
            The Full Journey
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '1rem' }}>
            How Charge & Go Works
          </h1>
          <p style={{ color: 'rgba(250, 248, 246, 0.85)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
            From your driveway to the fast-charging hub and back: zero disruption to your daily routine.
          </p>
        </div>
      </section>

      {/* Steps Grid */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container-custom">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.number}
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    border: '1px solid rgba(64, 8, 73, 0.1)',
                    boxShadow: 'var(--shadow-subtle)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'var(--color-lavender)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} color="var(--color-orange)" />
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--color-orchid)' }}>
                      {st.number}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-heading)', marginBottom: '0.6rem' }}>
                    {st.title}
                  </h3>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {st.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link to="/book" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
              <span>Experience It Yourself (₹100 Fee)</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
