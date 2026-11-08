import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Clock, MapPin, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-eggplant)',
        color: 'var(--color-pearl)',
        padding: '5rem 0 2.5rem 0',
        borderTop: '1px solid rgba(231, 176, 222, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orb */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231, 176, 222, 0.15) 0%, rgba(64, 8, 73, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container-custom">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3.5rem',
            marginBottom: '4rem',
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.2rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'var(--color-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.3rem', color: '#FFFFFF' }}>
                CHARGE <span style={{ color: 'var(--color-orchid)' }}>&</span> GO
              </span>
            </div>
            <p style={{ color: 'rgba(250, 248, 246, 0.75)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your EV charged. Your time saved. On-demand electric vehicle pickup, fast charging, and return delivery with verified photo evidence.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                background: 'rgba(255, 90, 10, 0.15)',
                border: '1px solid rgba(255, 90, 10, 0.3)',
                color: 'var(--color-orange)',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <span>Fixed Service Fee: ₹100 / booking</span>
            </div>
          </div>

          {/* Service Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '1.2rem' }}>Service Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link to="/how-it-works" style={{ color: 'rgba(250,248,246,0.8)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" style={{ color: 'rgba(250,248,246,0.8)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Pricing & Transparency (₹100 Fee)
                </Link>
              </li>
              <li>
                <Link to="/coverage" style={{ color: 'rgba(250,248,246,0.8)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Coverage & Localities
                </Link>
              </li>
              <li>
                <Link to="/faq" style={{ color: 'rgba(250,248,246,0.8)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Access */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '1.2rem' }}>Portals & Operations</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link to="/customer" style={{ color: 'rgba(250,248,246,0.8)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Customer Dashboard <ArrowUpRight size={14} color="var(--color-orchid)" />
                </Link>
              </li>
              <li>
                <Link to="/driver" style={{ color: 'rgba(250,248,246,0.8)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Driver Mobile Console <ArrowUpRight size={14} color="var(--color-orchid)" />
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ color: 'rgba(250,248,246,0.8)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Operator / Admin Suite <ArrowUpRight size={14} color="var(--color-orchid)" />
                </Link>
              </li>
              <li>
                <Link to="/book" style={{ color: 'var(--color-orange)', fontWeight: 700, fontSize: '0.9rem' }}>
                  + Schedule a Vehicle Pickup
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Area & Transparency */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '1.2rem' }}>Launch Coverage</h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <MapPin size={18} color="var(--color-orchid)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', color: 'rgba(250,248,246,0.85)' }}>
                Active Pilot: <strong>Dehradun, Uttarakhand</strong> (Rajpur Rd, Jakhan, Vasant Vihar, Dalanwala, GMS Rd).
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <ShieldCheck size={18} color="var(--color-orchid)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', color: 'rgba(250,248,246,0.85)' }}>
                Verified photo handovers before & after every charging cycle.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Clock size={18} color="var(--color-orchid)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', color: 'rgba(250,248,246,0.85)' }}>
                Operating Hours: 07:00 AM – 10:00 PM IST
              </span>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'rgba(250, 248, 246, 0.6)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Charge & Go Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/terms" style={{ color: 'inherit' }}>Terms of Service</Link>
            <Link to="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link>
            <Link to="/refunds" style={{ color: 'inherit' }}>Refund Policy</Link>
            <Link to="/contact" style={{ color: 'inherit' }}>Contact & Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
