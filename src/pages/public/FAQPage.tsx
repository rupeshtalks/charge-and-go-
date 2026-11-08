import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the ₹100 service fee work?',
      a: 'Charge & Go charges a flat ₹100 fee per booking. This covers verified driver collection from your address, transit to the fast-charging station, charger plugging and monitoring, and return delivery back to you. Electricity power consumption is billed separately at the actual meter reading without any markup.',
    },
    {
      q: 'How do I know my vehicle is handled safely?',
      a: 'Every pickup requires a mandatory 360° digital photographic walkthrough and odometer reading logged by the driver before wheels turn. The timestamped photos are instantly visible on your customer dashboard. All our drivers undergo comprehensive electric vehicle handling training.',
    },
    {
      q: 'What charging speeds and ports are supported?',
      a: 'We support all major Indian EV standards including CCS2 Fast DC (up to 60kW and 120kW) as well as Type-2 AC charging for vehicles like Tata Nexon/Punch/Tiago EV, MG ZS EV, Mahindra XUV400, Hyundai Ioniq 5, and BYD.',
    },
    {
      q: 'Can I track the vehicle charging progress in real-time?',
      a: 'Yes. Our driver logs real-time milestones: pickup inspection, arrival at station, active charging telemetry (e.g. 68% SoC), charging completion, and return transit. You can see photographic proof and battery levels right in your dashboard.',
    },
    {
      q: 'How is payment settled?',
      a: 'Upon successful return of your vehicle, an official GST tax invoice is generated with the fixed ₹100 fee plus actual kWh power consumed. You can pay via UPI, cards, or net banking directly through the platform.',
    },
    {
      q: 'Can I reschedule or cancel a booking?',
      a: 'Bookings can be rescheduled or cancelled freely before a driver is dispatched to your pickup address without any cancellation charges.',
    },
  ];

  return (
    <div style={{ paddingTop: '80px', background: 'var(--color-bg)' }}>
      {/* Header */}
      <section style={{ background: 'var(--color-eggplant)', color: '#FFFFFF', padding: '5rem 0 4rem 0', textAlign: 'center' }}>
        <div className="container-custom">
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-orchid)' }}>
            Got Questions?
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'rgba(250, 248, 246, 0.85)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
            Everything you need to know about our EV pickup, charging, and return platform.
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container-custom" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: isOpen ? '1px solid var(--color-orchid)' : '1px solid rgba(64,8,73,0.1)',
                    boxShadow: isOpen ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-heading)', paddingRight: '1rem' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={20} color="var(--color-orange)" /> : <ChevronDown size={20} color="var(--color-muted)" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--color-graphite)', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid var(--color-lavender)', paddingTop: '1rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem', background: 'var(--color-lavender)', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '0.5rem' }}>
              Still have a specific question?
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Our operations dispatch desk is available throughout operating hours (07:00 AM – 10:00 PM).
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn-secondary">Contact Operations Support</Link>
              <Link to="/book" className="btn-primary">Book EV Pickup (₹100)</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
