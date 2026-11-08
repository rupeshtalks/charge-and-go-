import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EVViewer3D } from '../../components/3d/EVViewer3D';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { ArrowRight, ShieldCheck, Zap, Clock, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useAppPreferences();
  const [activeScene, setActiveScene] = useState(0);

  const scenes = [
    {
      id: 'scene-1',
      tag: '01 / THE VEHICLE',
      title: 'State-of-the-Art EV Mobility Custody',
      subtitle: 'Premium electric vehicles deserve white-glove attention.',
      description: 'Charge & Go brings bespoke concierge pickup, rapid fast-charging at certified hubs, and pristine return delivery to your doorstep. Never wait at a charging station again.',
      stat: '100% EV Focused',
      statLabel: 'Dedicated battery protocols',
    },
    {
      id: 'scene-2',
      tag: '02 / THE BOTTLENECK',
      title: 'Charging Shouldn’t Hijack Your Afternoon',
      subtitle: 'Between traffic, queueing at bays, and waiting for 80% SoC, charging drains hours.',
      description: 'Your calendar is packed. Spending 90 minutes parked in an industrial charging hub disrupts your meetings, family time, and leisure. We eliminate the detour entirely.',
      stat: '2.5 Hours',
      statLabel: 'Average time saved per charge',
    },
    {
      id: 'scene-3',
      tag: '03 / THE CONCIERGE',
      title: 'Pickup. Fast Charge. Safe Return.',
      subtitle: 'Seamless digital custody from key handover to driveway delivery.',
      description: 'A verified mobility driver collects your vehicle from your home or workplace, pilots it safely to a dedicated fast-charging bay, monitors battery thermals, and brings it back trip-ready.',
      stat: 'Fixed ₹100',
      statLabel: 'Transparent pickup & drop fee',
    },
    {
      id: 'scene-4',
      tag: '04 / RADICAL TRANSPARENCY',
      title: 'Timestamped Photographic Evidence',
      subtitle: 'Absolute peace of mind with 360° digital inspection logs.',
      description: 'Every handover includes verified odometer snapshots, vehicle condition photos, and station meter receipts. Follow live status progression on your customer dashboard in real time.',
      stat: 'Verified Proof',
      statLabel: 'Every milestone logged',
    },
  ];

  return (
    <div style={{ background: 'var(--color-bg)' }}>
      {/* ==============================================================
          HERO SECTION — CINEMATIC 3D WEBGL HERO
          ============================================================== */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #1f0324 0%, var(--color-eggplant) 55%, #2a0532 100%)',
          color: 'var(--color-pearl)',
          paddingTop: '90px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background glow accents */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(231, 176, 222, 0.12) 0%, rgba(64, 8, 73, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 90, 10, 0.14) 0%, rgba(64, 8, 73, 0) 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container-custom" style={{ position: 'relative', zIndex: 10, paddingBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', alignItems: 'center' }} className="hero-grid">
            {/* Hero Copy */}
            <div style={{ maxWidth: '640px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  background: 'rgba(231, 176, 222, 0.15)',
                  border: '1px solid rgba(231, 176, 222, 0.35)',
                  color: 'var(--color-orchid)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1.5rem',
                }}
              >
                <Sparkles size={14} color="var(--color-orange)" />
                <span>{t('hero.badge')}</span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.6rem, 5.8vw, 4.6rem)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: '#FFFFFF',
                  marginBottom: '1.4rem',
                }}
              >
                {t('hero.headlinePrefix')}{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, var(--color-orchid), #ffffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('hero.headlineHighlight')}
                </span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                  color: 'rgba(250, 248, 246, 0.85)',
                  lineHeight: 1.6,
                  marginBottom: '2.2rem',
                }}
              >
                {t('hero.subheading')}
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <Link to="/book" className="btn-primary" style={{ padding: '1rem 2.2rem', fontSize: '1rem' }}>
                  <span>{t('hero.ctaPrimary')}</span>
                  <ArrowRight size={18} />
                </Link>

                <Link to="/how-it-works" className="btn-dark" style={{ padding: '1rem 1.8rem', fontSize: '1rem' }}>
                  <span>{t('hero.ctaSecondary')}</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.8rem',
                  marginTop: '2.5rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '0.85rem',
                  color: 'rgba(250, 248, 246, 0.75)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="var(--color-orchid)" />
                  <span>{t('hero.trustPhoto')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} color="var(--color-orange)" />
                  <span>{t('hero.trustFee')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--color-orchid)" />
                  <span>{t('hero.trustSpeed')}</span>
                </div>
              </div>
            </div>

            {/* Interactive 3D WebGL Vehicle Component */}
            <div
              style={{
                position: 'relative',
                height: '480px',
                width: '100%',
                background: 'radial-gradient(circle at center, rgba(64, 8, 73, 0.5) 0%, rgba(15, 2, 18, 0.9) 100%)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(231, 176, 222, 0.25)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                overflow: 'hidden',
              }}
            >
              <EVViewer3D interactive={true} accentColor="#FF5A0A" />
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 960px) {
            .hero-grid {
              grid-template-columns: 1.1fr 0.9fr !important;
            }
          }
        `}</style>
      </section>

      {/* ==============================================================
          CINEMATIC SLIDING STORYTELLING SECTION (SCENES 1 TO 4)
          ============================================================== */}
      <section
        style={{
          padding: '6rem 0',
          background: 'var(--color-surface-soft)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container-custom">
          <div style={{ maxWidth: '680px', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-orange)' }}>
              The Charge & Go Narrative
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', color: 'var(--color-heading)', marginTop: '0.4rem' }}>
              Designed For Drivers Who Value Every Hour.
            </h2>
          </div>

          {/* Story Carousel / Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            {scenes.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveScene(idx)}
                style={{
                  textAlign: 'left',
                  background: activeScene === idx ? 'var(--color-eggplant)' : 'var(--color-surface)',
                  color: activeScene === idx ? '#FFFFFF' : 'var(--color-text)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: activeScene === idx ? '2px solid var(--color-orchid)' : '1px solid var(--color-border)',
                  boxShadow: activeScene === idx ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: activeScene === idx ? 'var(--color-orchid)' : 'var(--color-muted)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {s.tag}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: activeScene === idx ? '#FFFFFF' : 'var(--color-heading)' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: activeScene === idx ? 'rgba(255,255,255,0.75)' : 'var(--color-muted)' }}>
                  {s.subtitle}
                </div>
              </button>
            ))}
          </div>

          {/* Featured Active Story Showcase Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(2rem, 4vw, 3.5rem)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-elevated)',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2.5rem',
              alignItems: 'center',
            }}
            className="story-featured-grid"
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'var(--color-orchid)',
                  color: 'var(--color-heading)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                {scenes[activeScene].tag}
              </div>
              <h3 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--color-heading)', marginBottom: '1.2rem' }}>
                {scenes[activeScene].title}
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-text)', lineHeight: 1.7, marginBottom: '2rem' }}>
                {scenes[activeScene].description}
              </p>

              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ borderLeft: '3px solid var(--color-orange)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
                    {scenes[activeScene].stat}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                    {scenes[activeScene].statLabel}
                  </div>
                </div>

                <Link to="/book" className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                  <span>Reserve a Time Slot</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-eggplant) 0%, #1a0322 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                color: '#FFFFFF',
                border: '1px solid rgba(231, 176, 222, 0.25)',
              }}
            >
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-orchid)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
                Operational Standard
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <CheckCircle2 size={18} color="var(--color-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.92rem' }}>Dedicated verified drivers with EV torque & handling certification.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <CheckCircle2 size={18} color="var(--color-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.92rem' }}>Direct partnership with high-output DC charging corridors.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <CheckCircle2 size={18} color="var(--color-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.92rem' }}>Digital odometer and battery SoC records stored permanently on invoice.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 900px) {
            .story-featured-grid {
              grid-template-columns: 1.2fr 0.8fr !important;
            }
          }
        `}</style>
      </section>

      {/* ==============================================================
          TRANSPARENT PRICING PREVIEW (₹100 FIXED SERVICE FEE)
          ============================================================== */}
      <section style={{ padding: '6rem 0', background: 'var(--color-bg)' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-orange)' }}>
              Honest EV Economics
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--color-heading)', marginTop: '0.4rem' }}>
              ₹100 Flat Pickup & Return. Power at Pure Cost.
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.98rem', marginTop: '0.8rem' }}>
              We never inflate electric tariff prices or introduce opaque hidden charges.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              maxWidth: '960px',
              margin: '0 auto',
            }}
          >
            {/* Flat Concierge Fee Card */}
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                border: '2px solid var(--color-orange)',
                boxShadow: 'var(--shadow-card)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  background: 'var(--color-orange)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                }}
              >
                Fixed Fee Guarantee
              </div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--color-heading)', marginBottom: '0.5rem' }}>
                {t('pricing.conciergeTitle')}
              </h3>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--color-heading)', fontFamily: 'var(--font-display)', margin: '1rem 0' }}>
                ₹100 <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)', fontWeight: 500 }}>{t('pricing.perBooking')}</span>
              </div>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Covers doorstep collection by our certified driver, transit to the optimal DC station, and prompt return handover.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-orange)" />
                  Doorstep key handover & return
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-orange)" />
                  360° timestamped photo verification
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-orange)" />
                  Live status progression dashboard
                </li>
              </ul>
            </div>

            {/* Charging Power Card */}
            <div
              style={{
                background: 'var(--color-eggplant)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                border: '1px solid rgba(231, 176, 222, 0.25)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3 style={{ fontSize: '1.35rem', color: 'var(--color-orchid)', marginBottom: '0.5rem' }}>
                {t('pricing.powerTitle')}
              </h3>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-display)', margin: '1rem 0' }}>
                At Actuals <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>(Per kWh)</span>
              </div>
              <p style={{ color: 'rgba(250, 248, 246, 0.8)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                You pay exactly what the charging bay meters, typically ₹17–₹20/kWh at regional DC stations. Zero markups.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-orchid)" />
                  Original station receipt attached to invoice
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-orchid)" />
                  CCS2 DC Fast Charging up to 60kW/120kW
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-orchid)" />
                  Transparent GST invoicing for tax compliance
                </li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/pricing" className="btn-secondary" style={{ padding: '0.8rem 1.8rem' }}>
              View Complete Tariff Breakdown & Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* ==============================================================
          FINAL BOOKING INVITATION CTA
          ============================================================== */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--color-eggplant) 0%, #1f0324 100%)',
          color: '#FFFFFF',
          padding: '6rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container-custom" style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255, 90, 10, 0.2)',
              color: 'var(--color-orange)',
              border: '1px solid var(--color-orange)',
              fontWeight: 800,
              fontSize: '0.8rem',
              padding: '4px 14px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              marginBottom: '1.2rem',
            }}
          >
            Ready For Effortless Charging?
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              color: '#FFFFFF',
              maxWidth: '780px',
              margin: '0 auto 1.5rem auto',
            }}
          >
            Book Your First Pickup in 60 Seconds.
          </h2>

          <p style={{ color: 'rgba(250, 248, 246, 0.85)', fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto 2.5rem auto' }}>
            Tell us your EV model, select your preferred window, and let our verified concierge specialists handle the rest.
          </p>

          <Link to="/book" className="btn-primary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.05rem' }}>
            <span>{t('hero.ctaPrimary')}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
