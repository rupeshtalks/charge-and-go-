
import React from 'react';
import { MultiStepBookingForm } from '../../components/booking/MultiStepBookingForm';

export const BookingFlowPage: React.FC = () => {
  return (
    <main
      style={{
        paddingTop: '120px',
        paddingBottom: '5rem',
        background: '#100416',
        minHeight: '100vh',
        color: '#F8F5FA',
        boxSizing: 'border-box',
      }}
    >
      <div className="container-custom">
        <header
          style={{
            textAlign: 'center',
            marginBottom: '2.5rem',
            padding: '0 16px',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#FF650D',
            }}
          >
            Seamless Concierge Reservation
          </span>

          <h1
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              color: '#FFFFFF',
              margin: '10px 0',
            }}
          >
            Book Your EV Pickup & Charging
          </h1>

          <p
            style={{
              color: '#C6B6CC',
              fontSize: '0.98rem',
              lineHeight: 1.7,
              maxWidth: '760px',
              margin: '0 auto',
            }}
          >
            Transparent ₹100 pickup-and-drop service fee.
            Power draw billed strictly at actual station meter readings.
          </p>
        </header>

        <MultiStepBookingForm />
      </div>
    </main>
  );
};
