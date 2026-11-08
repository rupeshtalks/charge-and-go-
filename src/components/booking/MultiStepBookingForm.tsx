
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatINR } from '../../lib/constants';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import {
  LocationPicker,
  type LocationValue,
} from './LocationPicker';

type BookingFormData = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleMake: string;
  vehicleModel: string;
  registrationNumber: string;
  startingBatteryPercentage: number;
  vehicleNotes: string;
  pickupAddress: string;
  pickupLocality: string;
  pickupPinCode: string;
  returnAddress: string;
  preferredPickupDate: string;
  preferredPickupTimeSlot: string;
  targetBatteryPercentage: number;
  chargingPreference: string;
  specialInstructions: string;
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: '10px',
  border: '1px solid var(--color-input-border)',
  background: 'var(--color-input-bg)',
  color: 'var(--color-text)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 700,
  marginBottom: '7px',
  color: 'var(--color-heading)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: 'var(--color-heading)',
  marginBottom: '0.5rem',
};

const descriptionStyle: React.CSSProperties = {
  color: 'var(--color-muted)',
  fontSize: '0.9rem',
  lineHeight: 1.7,
  marginBottom: '1.5rem',
};

export const MultiStepBookingForm: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    customerName: 'Arjun Mehta',
    customerPhone: '+91 98765 43210',
    customerEmail: 'arjun.mehta@example.com',

    vehicleMake: 'Tata',
    vehicleModel: 'Nexon EV Empowered+',
    registrationNumber: 'UK 07 AF 8901',
    startingBatteryPercentage: 25,
    vehicleNotes: 'Charging flap release is on the left side of steering wheel.',

    pickupAddress: 'Villa 14, Silver Oak Estate, Rajpur Road',
    pickupLocality: 'Rajpur Road',
    pickupPinCode: '248001',
    returnAddress: 'Villa 14, Silver Oak Estate, Rajpur Road',

    preferredPickupDate: new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0],

    preferredPickupTimeSlot: '10:00 AM - 11:30 AM',
    targetBatteryPercentage: 85,
    chargingPreference: 'Fast DC Charging (CCS2)',

    specialInstructions:
      'Please leave vehicle key with security gate if not answering door.',
  });

  // Map coordinates for pickup and return locations.
  const [pickupLocation, setPickupLocation] = useState<LocationValue>({
    latitude: null,
    longitude: null,
    address: 'Villa 14, Silver Oak Estate, Rajpur Road',
  });

  const [returnLocation, setReturnLocation] = useState<LocationValue>({
    latitude: null,
    longitude: null,
    address: 'Villa 14, Silver Oak Estate, Rajpur Road',
  });

  const updateField = <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Transparent price estimate.
  const batteryDelta = Math.max(
    0,
    formData.targetBatteryPercentage - formData.startingBatteryPercentage,
  );

  const estimatedKWh = Math.round((40.5 * batteryDelta) / 100);
  const estimatedChargingCost = Math.round(estimatedKWh * 18);
  const fixedServiceFee = 100;

  const estimatedTax = Math.round(
    (estimatedChargingCost + fixedServiceFee) * 0.05,
  );

  const estimatedTotal =
    fixedServiceFee + estimatedChargingCost + estimatedTax;

  const handleNext = () => {
    setErrorMsg(null);

    if (step === 1) {
      if (!formData.customerName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(formData.customerEmail)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      if (formData.customerPhone.replace(/\D/g, '').length < 10) {
        setErrorMsg('Please enter a valid phone number.');
        return;
      }
    }

    if (step === 2 && !formData.registrationNumber.trim()) {
      setErrorMsg('Please enter your vehicle registration number.');
      return;
    }

    // Validate both map-selected locations.
    if (step === 3) {
      if (
        !pickupLocation.address.trim() ||
        pickupLocation.latitude === null ||
        pickupLocation.longitude === null
      ) {
        setErrorMsg('Please select your pickup location on the map.');
        return;
      }

      if (
        !returnLocation.address.trim() ||
        returnLocation.latitude === null ||
        returnLocation.longitude === null
      ) {
        setErrorMsg('Please select your return location on the map.');
        return;
      }

      if (!/^\d{6}$/.test(formData.pickupPinCode)) {
        setErrorMsg('Please enter a valid 6-digit pickup PIN code.');
        return;
      }

      if (!formData.preferredPickupDate) {
        setErrorMsg('Please select your preferred pickup date.');
        return;
      }
    }

    if (
      step === 4 &&
      formData.targetBatteryPercentage <= formData.startingBatteryPercentage
    ) {
      setErrorMsg(
        'Your target battery level must be higher than the current level.',
      );
      return;
    }

    setStep((previous) => Math.min(previous + 1, 5));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const created = await api.createBooking({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,

        vehicle: {
          id: 'vh_' + Date.now(),
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          registrationNumber: formData.registrationNumber,
          startingBatteryPercentage: formData.startingBatteryPercentage,
          notes: formData.vehicleNotes,
        },

        pickupAddress: pickupLocation.address,
        pickupLocality: formData.pickupLocality,
        pickupPinCode: formData.pickupPinCode,

        returnAddress: returnLocation.address,

        // Exact map coordinates sent to the backend.




        preferredPickupDate: formData.preferredPickupDate,
        preferredPickupTimeSlot: formData.preferredPickupTimeSlot,
        targetBatteryPercentage: formData.targetBatteryPercentage,
        chargingPreference: formData.chargingPreference,
        notes: formData.specialInstructions,
        estimatedChargingCost,
      });

      navigate(`/booking/${created.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to schedule booking. Please try again.';

      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    'Identity',
    'EV Details',
    'Pickup & Slot',
    'Charge Target',
    'Review & Confirm',
  ];

  const chargingCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: '1.15rem',
    borderRadius: '12px',
    border: selected
      ? '2px solid var(--color-orange)'
      : '1px solid var(--color-border)',
    background: selected
      ? 'rgba(255, 101, 13, 0.10)'
      : 'var(--color-surface-soft)',
    color: 'var(--color-text)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '95px',
  });

  return (
    <div className="booking-form-shell">
      {/* Booking Header */}
      <div className="booking-form-header">
        <div className="booking-header-top">
          <div>
            <span className="booking-step-label">
              STEP {step} OF 5
            </span>

            <h2 className="booking-main-heading">
              Schedule EV Pickup & Charging
            </h2>
          </div>

          <span className="booking-fee-pill">
            ₹100 Service Fee
          </span>
        </div>

        <div className="booking-progress">
          {stepsList.map((item, index) => (
            <div
              key={item}
              className={`booking-progress-segment ${index + 1 <= step ? 'completed' : ''
                }`}
            />
          ))}
        </div>

        <div className="booking-step-names">
          {stepsList.map((item, index) => (
            <span
              key={item}
              className={step === index + 1 ? 'active' : ''}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Form Body */}
      <div className="booking-form-body">
        {errorMsg && (
          <div className="booking-error">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: CUSTOMER INFORMATION */}
        {step === 1 && (
          <div>
            <h3 style={sectionTitleStyle}>
              Confirm Contact Information
            </h3>

            <p style={descriptionStyle}>
              Our driver and operations team will use these details to send
              booking updates and pickup notifications.
            </p>

            <div className="booking-fields">
              <div>
                <label style={labelStyle}>Full Name</label>

                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(event) =>
                    updateField('customerName', event.target.value)
                  }
                  style={inputStyle}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="booking-responsive-grid">
                <div>
                  <label style={labelStyle}>Phone Number</label>

                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(event) =>
                      updateField('customerPhone', event.target.value)
                    }
                    style={inputStyle}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address</label>

                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(event) =>
                      updateField('customerEmail', event.target.value)
                    }
                    style={inputStyle}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: VEHICLE DETAILS */}
        {step === 2 && (
          <div>
            <h3 style={sectionTitleStyle}>
              Your Electric Vehicle
            </h3>

            <p style={descriptionStyle}>
              Tell us about your EV so our operations team can prepare the
              correct charging connector and service.
            </p>

            <div className="booking-fields">
              <div className="booking-responsive-grid">
                <div>
                  <label style={labelStyle}>Make / Brand</label>

                  <select
                    value={formData.vehicleMake}
                    onChange={(event) =>
                      updateField('vehicleMake', event.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="Tata">Tata Motors</option>
                    <option value="MG">MG Motor</option>
                    <option value="Mahindra">Mahindra</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="BYD">BYD</option>
                    <option value="BMW">BMW</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="Volvo">Volvo</option>
                    <option value="Porsche">Porsche</option>
                    <option value="Citroen">Citroen</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Vehicle Model</label>

                  <input
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(event) =>
                      updateField('vehicleModel', event.target.value)
                    }
                    style={inputStyle}
                    placeholder="Enter your EV model"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Registration Number
                </label>

                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(event) =>
                    updateField(
                      'registrationNumber',
                      event.target.value.toUpperCase(),
                    )
                  }
                  style={{
                    ...inputStyle,
                    letterSpacing: '0.06em',
                    fontWeight: 800,
                  }}
                  placeholder="e.g. UK 07 AF 8901"
                />
              </div>

              <div>
                <div className="booking-range-heading">
                  <label style={labelStyle}>
                    Current Battery Level
                  </label>

                  <strong className="booking-range-value">
                    {formData.startingBatteryPercentage}%
                  </strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="90"
                  value={formData.startingBatteryPercentage}
                  onChange={(event) =>
                    updateField(
                      'startingBatteryPercentage',
                      Number(event.target.value),
                    )
                  }
                  className="booking-range"
                />

                <div className="booking-range-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>90%</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Vehicle Notes (Optional)
                </label>

                <input
                  type="text"
                  value={formData.vehicleNotes}
                  onChange={(event) =>
                    updateField('vehicleNotes', event.target.value)
                  }
                  style={inputStyle}
                  placeholder="Charging flap location or other instructions"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MAP-BASED PICKUP AND RETURN */}
        {step === 3 && (
          <div>
            <h3 style={sectionTitleStyle}>
              Pickup & Return Location
            </h3>

            <p style={descriptionStyle}>
              Select both locations on the map. You can use your current
              location or search for an address and adjust the map pin.
              Charge & Go currently operates in its Dehradun pilot area.
            </p>

            <div className="booking-fields">
              {/* PICKUP LOCATION MAP */}
              <div className="booking-location-section">
                <LocationPicker
                  label="Pickup Location"
                  value={pickupLocation}
                  onChange={(location) => {
                    setPickupLocation(location);
                    updateField('pickupAddress', location.address);
                  }}
                />
              </div>

              {/* LOCALITY AND PIN CODE */}
              <div className="booking-responsive-grid">
                <div>
                  <label style={labelStyle}>Locality</label>

                  <select
                    value={formData.pickupLocality}
                    onChange={(event) =>
                      updateField('pickupLocality', event.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="Rajpur Road">Rajpur Road</option>
                    <option value="Jakhan">Jakhan</option>
                    <option value="Hathibarkala">Hathibarkala</option>
                    <option value="Vasant Vihar">Vasant Vihar</option>
                    <option value="Dalanwala">Dalanwala</option>
                    <option value="GMS Road">GMS Road</option>
                    <option value="Race Course">Race Course</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>PIN Code</label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.pickupPinCode}
                    onChange={(event) =>
                      updateField('pickupPinCode', event.target.value)
                    }
                    style={inputStyle}
                    placeholder="248001"
                  />
                </div>
              </div>

              {/* RETURN LOCATION MAP */}
              <div className="booking-location-section">
                <LocationPicker
                  label="Return Location"
                  value={returnLocation}
                  onChange={(location) => {
                    setReturnLocation(location);
                    updateField('returnAddress', location.address);
                  }}
                />
              </div>

              {/* DATE AND TIME */}
              <div className="booking-responsive-grid">
                <div>
                  <label style={labelStyle}>
                    Preferred Pickup Date
                  </label>

                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferredPickupDate}
                    onChange={(event) =>
                      updateField('preferredPickupDate', event.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Pickup Time Window
                  </label>

                  <select
                    value={formData.preferredPickupTimeSlot}
                    onChange={(event) =>
                      updateField(
                        'preferredPickupTimeSlot',
                        event.target.value,
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="08:00 AM - 09:30 AM">
                      08:00 AM - 09:30 AM
                    </option>
                    <option value="10:00 AM - 11:30 AM">
                      10:00 AM - 11:30 AM
                    </option>
                    <option value="01:00 PM - 02:30 PM">
                      01:00 PM - 02:30 PM
                    </option>
                    <option value="04:00 PM - 05:30 PM">
                      04:00 PM - 05:30 PM
                    </option>
                    <option value="07:00 PM - 08:30 PM">
                      07:00 PM - 08:30 PM
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CHARGING REQUIREMENTS */}
        {step === 4 && (
          <div>
            <h3 style={sectionTitleStyle}>
              Target Charge & Preferences
            </h3>

            <p style={descriptionStyle}>
              Choose your desired battery level and charging preference.
              You can adjust these requirements before confirming.
            </p>

            <div className="booking-fields">
              <div className="booking-target-card">
                <div className="booking-range-heading">
                  <span className="booking-target-label">
                    Target State of Charge
                  </span>

                  <strong className="booking-target-value">
                    {formData.targetBatteryPercentage}%
                  </strong>
                </div>

                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={formData.targetBatteryPercentage}
                  onChange={(event) =>
                    updateField(
                      'targetBatteryPercentage',
                      Number(event.target.value),
                    )
                  }
                  className="booking-range"
                />

                <div className="booking-range-labels">
                  <span>50%</span>
                  <span>80% Recommended</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Charging Protocol
                </label>

                <div className="booking-responsive-grid">
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'chargingPreference',
                        'Fast DC Charging (CCS2)',
                      )
                    }
                    style={chargingCardStyle(
                      formData.chargingPreference.includes('DC'),
                    )}
                  >
                    <div className="booking-option-heading">
                      Fast DC (CCS2)

                      {formData.chargingPreference.includes('DC') && (
                        <CheckCircle2
                          size={17}
                          color="var(--color-orange)"
                        />
                      )}
                    </div>

                    <div className="booking-option-description">
                      Faster charging for a quicker turnaround.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'chargingPreference',
                        'Type-2 AC Balanced Charging',
                      )
                    }
                    style={chargingCardStyle(
                      formData.chargingPreference.includes('AC'),
                    )}
                  >
                    <div className="booking-option-heading">
                      Balanced AC (Type 2)

                      {formData.chargingPreference.includes('AC') && (
                        <CheckCircle2
                          size={17}
                          color="var(--color-orange)"
                        />
                      )}
                    </div>

                    <div className="booking-option-description">
                      A slower AC charging option.
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Driver Instructions
                </label>

                <textarea
                  rows={3}
                  value={formData.specialInstructions}
                  onChange={(event) =>
                    updateField('specialInstructions', event.target.value)
                  }
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  placeholder="Add any instructions for the driver..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW AND CONFIRM */}
        {step === 5 && (
          <div>
            <h3 style={sectionTitleStyle}>
              Booking Summary & Transparent Cost
            </h3>

            <p style={descriptionStyle}>
              Review your booking details before confirming. Our pickup and
              drop service fee is fixed at ₹100. Charging power is billed
              according to actual station meter readings.
            </p>

            {/* Vehicle and Location Summary */}
            <div className="booking-overview-card">
              <div>
                <span className="booking-summary-label">
                  ELECTRIC VEHICLE
                </span>

                <strong className="booking-summary-main">
                  {formData.vehicleMake} {formData.vehicleModel}
                </strong>

                <span className="booking-summary-accent">
                  {formData.registrationNumber}
                </span>
              </div>

              <div>
                <span className="booking-summary-label">
                  PICKUP SCHEDULE
                </span>

                <strong className="booking-summary-main">
                  {formData.preferredPickupDate}
                </strong>

                <span className="booking-summary-secondary">
                  {formData.preferredPickupTimeSlot}
                </span>
              </div>

              <div className="booking-summary-full">
                <span className="booking-summary-label">
                  PICKUP LOCATION
                </span>

                <span className="booking-summary-secondary">
                  {pickupLocation.address}, {formData.pickupLocality} -{' '}
                  {formData.pickupPinCode}
                </span>

                <span className="booking-summary-coordinates">
                  Coordinates: {pickupLocation.latitude?.toFixed(6)},{' '}
                  {pickupLocation.longitude?.toFixed(6)}
                </span>
              </div>

              <div className="booking-summary-full">
                <span className="booking-summary-label">
                  RETURN LOCATION
                </span>

                <span className="booking-summary-secondary">
                  {returnLocation.address}
                </span>

                <span className="booking-summary-coordinates">
                  Coordinates: {returnLocation.latitude?.toFixed(6)},{' '}
                  {returnLocation.longitude?.toFixed(6)}
                </span>
              </div>

              <div className="booking-summary-full">
                <span className="booking-summary-label">
                  TARGET BATTERY
                </span>

                <strong className="booking-summary-accent">
                  {formData.startingBatteryPercentage}% →{' '}
                  {formData.targetBatteryPercentage}%
                </strong>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="booking-cost-card">
              <div className="booking-cost-heading">
                <span>ESTIMATED COST BREAKDOWN</span>
                <span className="booking-cost-icon">₹</span>
              </div>

              <div className="booking-cost-row">
                <span>
                  Fixed Pickup & Drop Fee
                  <span className="booking-mandatory-pill">
                    MANDATORY
                  </span>
                </span>

                <strong>{formatINR(fixedServiceFee)}</strong>
              </div>

              <div className="booking-cost-row">
                <span>
                  Estimated Power Draw (~{estimatedKWh} kWh @ ₹18/kWh)
                </span>

                <strong>{formatINR(estimatedChargingCost)}</strong>
              </div>

              <div className="booking-cost-row muted">
                <span>Applicable GST (5%)</span>
                <strong>{formatINR(estimatedTax)}</strong>
              </div>

              <div className="booking-cost-total">
                <span>Estimated Total</span>
                <strong>{formatINR(estimatedTotal)}</strong>
              </div>

              <p className="booking-cost-note">
                * Final power cost is calculated upon completion using actual
                station meter readings. This amount is an estimate.
              </p>
            </div>

            <div className="booking-confirm-note">
              <CheckCircle2 size={18} />

              <span>
                Please verify your details. Your booking request will be
                submitted after you select Confirm & Request Pickup.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="booking-form-actions">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setStep((previous) => previous - 1);
              }}
              className="booking-back-button"
              disabled={submitting}
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="booking-next-button"
            >
              Continue
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="booking-next-button booking-confirm-button"
            >
              {submitting
                ? 'Confirming Booking...'
                : 'Confirm & Request Pickup'}

              {!submitting && <ArrowRight size={17} />}
            </button>
          )}
        </div>
      </div>

      {/* Component Styling */}
      <style>{`
        .booking-form-shell {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 24px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-card);
          color: var(--color-text);
        }

        .booking-form-header {
          padding: 1.8rem 2rem 1.4rem;
          background: linear-gradient(135deg, #1F0D29, #2B1038);
          border-bottom: 1px solid rgba(217, 168, 232, 0.16);
        }

        .booking-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .booking-step-label {
          display: block;
          color: #D9A8E8;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.13em;
          margin-bottom: 7px;
        }

        .booking-main-heading {
          color: #FFFFFF;
          font-size: clamp(1.15rem, 2.5vw, 1.5rem);
          line-height: 1.3;
          margin: 0;
          font-family: var(--font-display);
        }

        .booking-fee-pill {
          flex-shrink: 0;
          padding: 8px 13px;
          border: 1px solid rgba(255, 101, 13, 0.6);
          border-radius: 999px;
          color: #FF9B66;
          background: rgba(255, 101, 13, 0.12);
          font-size: 0.76rem;
          font-weight: 800;
        }

        .booking-progress {
          display: flex;
          gap: 7px;
        }

        .booking-progress-segment {
          height: 4px;
          flex: 1;
          border-radius: 20px;
          background: rgba(255,255,255,0.15);
          transition: background 0.25s ease;
        }

        .booking-progress-segment.completed {
          background: #FF650D;
          box-shadow: 0 0 10px rgba(255,101,13,0.4);
        }

        .booking-step-names {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          margin-top: 12px;
        }

        .booking-step-names span {
          color: rgba(255,255,255,0.48);
          font-size: 0.65rem;
          text-align: center;
        }

        .booking-step-names span.active {
          color: #F0C8FF;
          font-weight: 800;
        }

        .booking-form-body {
          padding: 2rem;
        }

        .booking-fields {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .booking-responsive-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .booking-error {
          margin-bottom: 1.4rem;
          padding: 0.9rem 1rem;
          border-radius: 10px;
          color: #FECACA;
          background: rgba(185, 28, 28, 0.18);
          border: 1px solid rgba(248, 113, 113, 0.4);
          font-size: 0.88rem;
        }

        .booking-location-section {
          min-width: 0;
        }

        .booking-range-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .booking-range-value {
          color: var(--color-orange);
          font-size: 1.2rem;
        }

        .booking-range {
          display: block;
          width: 100%;
          margin: 10px 0;
          accent-color: var(--color-orange);
          cursor: pointer;
        }

        .booking-range-labels {
          display: flex;
          justify-content: space-between;
          color: var(--color-muted);
          font-size: 0.73rem;
        }

        .booking-target-card {
          padding: 1.4rem;
          border-radius: 14px;
          background: var(--color-surface-soft);
          border: 1px solid var(--color-border);
        }

        .booking-target-label {
          font-weight: 800;
          color: var(--color-heading);
        }

        .booking-target-value {
          font-size: 1.6rem;
          color: var(--color-orange);
        }

        .booking-option-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: var(--color-heading);
          font-size: 0.9rem;
          font-weight: 800;
        }

        .booking-option-description {
          margin-top: 7px;
          color: var(--color-muted);
          font-size: 0.76rem;
          line-height: 1.5;
        }

        .booking-overview-card {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.2rem;
          padding: 1.3rem;
          margin-bottom: 1.4rem;
          border-radius: 14px;
          background: var(--color-surface-soft);
          border: 1px solid var(--color-border);
        }

        .booking-summary-full {
          grid-column: 1 / -1;
          padding-top: 0.8rem;
          border-top: 1px solid var(--color-border);
        }

        .booking-summary-label {
          display: block;
          margin-bottom: 7px;
          color: var(--color-muted);
          font-size: 0.69rem;
          font-weight: 800;
          letter-spacing: 0.07em;
        }

        .booking-summary-main {
          display: block;
          color: var(--color-heading);
          font-size: 0.98rem;
          line-height: 1.5;
        }

        .booking-summary-accent {
          display: block;
          color: var(--color-orange);
          font-size: 0.86rem;
          font-weight: 800;
          margin-top: 4px;
        }

        .booking-summary-secondary {
          display: block;
          color: var(--color-text-secondary);
          font-size: 0.84rem;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .booking-summary-coordinates {
          display: block;
          margin-top: 5px;
          color: var(--color-muted);
          font-size: 0.72rem;
          overflow-wrap: anywhere;
        }

        .booking-cost-card {
          padding: 1.4rem;
          border: 1px solid rgba(217, 168, 232, 0.35);
          border-radius: 15px;
          background: var(--color-surface-soft);
          color: var(--color-text);
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        }

        .booking-cost-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.1rem;
          color: var(--color-heading);
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.07em;
        }

        .booking-cost-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          color: #FF9B66;
          background: rgba(255,101,13,0.12);
          font-weight: 900;
          font-size: 1rem;
        }

        .booking-cost-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.65rem 0;
          color: var(--color-text);
          font-size: 0.88rem;
        }

        .booking-cost-row > span {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
        }

        .booking-cost-row strong {
          flex-shrink: 0;
          color: var(--color-heading);
        }

        .booking-cost-row.muted {
          color: var(--color-muted);
        }

        .booking-mandatory-pill {
          padding: 3px 7px;
          border-radius: 5px;
          background: rgba(217,168,232,0.16);
          color: var(--color-orchid);
          font-size: 0.61rem;
          font-weight: 900;
        }

        .booking-cost-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 0.7rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
          color: var(--color-heading);
          font-size: 1rem;
          font-weight: 900;
        }

        .booking-cost-total strong {
          color: var(--color-orange);
          font-size: 1.35rem;
        }

        .booking-cost-note {
          margin: 0.8rem 0 0;
          color: var(--color-muted);
          font-size: 0.74rem;
          line-height: 1.6;
        }

        .booking-confirm-note {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 1.2rem;
          padding: 0.9rem 1rem;
          border-radius: 10px;
          background: rgba(54,211,153,0.08);
          border: 1px solid rgba(54,211,153,0.2);
          color: var(--color-text-secondary);
          font-size: 0.8rem;
          line-height: 1.6;
        }

        .booking-confirm-note svg {
          flex-shrink: 0;
          color: #36D399;
          margin-top: 1px;
        }

        .booking-form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
        }

        .booking-back-button,
        .booking-next-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 48px;
          padding: 0.8rem 1.6rem;
          border-radius: 999px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .booking-back-button {
          color: var(--color-heading);
          background: transparent;
          border: 1px solid var(--color-border);
        }

        .booking-back-button:hover {
          background: var(--color-surface-soft);
          border-color: var(--color-orchid);
        }

        .booking-next-button {
          color: #FFFFFF;
          background: linear-gradient(135deg, #FF650D, #FF7E36);
          border: 1px solid transparent;
          box-shadow: 0 7px 22px rgba(255,101,13,0.2);
        }

        .booking-next-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(255,101,13,0.32);
        }

        .booking-next-button:disabled,
        .booking-back-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .booking-confirm-button {
          min-width: 240px;
        }

        @media (max-width: 600px) {
          .booking-form-header {
            padding: 1.4rem 1.2rem;
          }

          .booking-header-top {
            align-items: flex-start;
            flex-direction: column;
          }

          .booking-step-names span {
            font-size: 0.57rem;
          }

          .booking-form-body {
            padding: 1.3rem 1rem;
          }

          .booking-responsive-grid {
            grid-template-columns: 1fr;
          }

          .booking-overview-card {
            grid-template-columns: 1fr;
          }

          .booking-summary-full {
            grid-column: auto;
          }

          .booking-cost-card {
            padding: 1rem;
          }

          .booking-cost-row {
            align-items: flex-start;
            font-size: 0.8rem;
          }

          .booking-cost-total strong {
            font-size: 1.15rem;
          }

          .booking-form-actions {
            flex-wrap: wrap;
          }

          .booking-back-button,
          .booking-next-button {
            flex: 1;
            padding-left: 1rem;
            padding-right: 1rem;
            font-size: 0.8rem;
          }

          .booking-confirm-button {
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
};
