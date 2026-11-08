import React from 'react';

interface LegalDocProps {
  title: string;
  category: string;
}

export const LegalPage: React.FC<LegalDocProps> = ({ title, category }) => {
  return (
    <div style={{ paddingTop: '80px', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <section style={{ background: 'var(--color-eggplant)', color: '#FFFFFF', padding: '4.5rem 0 3.5rem 0', textAlign: 'center' }}>
        <div className="container-custom">
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-orchid)' }}>
            Compliance & Transparency — {category}
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', color: '#FFFFFF', marginTop: '0.5rem' }}>
            {title}
          </h1>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div
          className="container-custom"
          style={{
            maxWidth: '820px',
            background: 'var(--color-surface)',
            padding: '3rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-subtle)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-graphite)',
            lineHeight: 1.8,
            fontSize: '0.98rem',
          }}
        >
          <div
            style={{
              padding: '1rem 1.4rem',
              background: 'var(--color-lavender)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--color-orange)',
              marginBottom: '2rem',
              fontSize: '0.88rem',
              color: 'var(--color-heading)',
            }}
          >
            <strong>Pilot Deployment Notice:</strong> The terms and policies articulated below represent the operational guidelines for the Charge & Go pilot deployment in Dehradun, Uttarakhand. Final statutory provisions will be updated subject to formal regulatory filings.
          </div>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '0.6rem' }}>
            1. Custody and Handover Protocols
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Charge & Go assigns trained mobility drivers to execute on-demand electric vehicle pickup from the customer's specified location. Prior to operating any vehicle, a mandatory digital walkthrough is logged, capturing all exterior panels, battery State of Charge (SoC), and the physical odometer reading. This record serves as the mutual baseline of vehicle custody.
          </p>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '0.6rem' }}>
            2. Fixed ₹100 Service Fee Policy
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            The ₹100 pickup-and-drop concierge fee is fixed and transparently disclosed prior to booking confirmation. It covers authorized driver transit, charger queue management, and safe return delivery. Electric power drawn from charging bays is passed through directly at actual station meter rates without added margin.
          </p>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '0.6rem' }}>
            3. Cancellation and Rescheduling
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Users may cancel or reschedule a scheduled pickup at zero penalty up until a driver has been actively dispatched toward the pickup location. Once a driver has arrived at the pickup location, a nominal dispatch allowance may apply.
          </p>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '0.6rem' }}>
            4. Privacy and Photographic Evidence
          </h3>
          <p>
            All inspection photographs recorded by authorized drivers are encrypted and accessible exclusively by the booking customer and operations dispatch. Vehicle inspection imagery is permanently attached to your digital invoice record for your personal records.
          </p>
        </div>
      </section>
    </div>
  );
};
