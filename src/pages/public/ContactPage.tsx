import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ paddingTop: '80px', background: 'var(--color-bg)' }}>
      {/* Header */}
      <section style={{ background: 'var(--color-eggplant)', color: '#FFFFFF', padding: '5rem 0 4rem 0', textAlign: 'center' }}>
        <div className="container-custom">
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-orchid)' }}>
            Operations & Support Desk
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Get In Touch
          </h1>
          <p style={{ color: 'rgba(250, 248, 246, 0.85)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
            Assisting EV owners, fleet managers, and partner charging networks in Dehradun.
          </p>
        </div>
      </section>

      <section style={{ padding: '5rem 0' }}>
        <div className="container-custom" style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            {/* Contact Details */}
            <div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>
                Pilot Headquarters
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Charge & Go operates a specialized driver dispatch and vehicle staging hub in Dehradun with dedicated technician support.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} color="var(--color-orange)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-heading)', fontSize: '0.95rem' }}>Operating Hub Address</div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                      Plot 42, Rajpur Road EV Corridor, Dehradun, Uttarakhand, 248001
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={20} color="var(--color-orange)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-heading)', fontSize: '0.95rem' }}>Dispatch Helpline</div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                      +91 98765 43210 (07:00 AM – 10:00 PM IST)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} color="var(--color-orange)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-heading)', fontSize: '0.95rem' }}>Electronic Inquiries</div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                      operations@chargeandgo.in
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <CheckCircle2 size={48} color="var(--color-orange)" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: 'var(--color-heading)', marginBottom: '0.5rem' }}>Inquiry Received</h3>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                    Thank you for reaching out. Our dispatch team will follow up via phone or email shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '0.2rem' }}>
                    Send Operations a Message
                  </h3>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '4px' }}>
                      Your Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '4px' }}>
                      Contact Phone / Email
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="+91 or email@domain.com"
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '4px' }}>
                      Message or Query
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your fleet or pickup query..."
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    <Send size={16} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
