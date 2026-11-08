import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../lib/constants';
import { CheckCircle2, ArrowRight, Calculator, HelpCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [startingBattery, setStartingBattery] = useState<number>(20);
  const [targetBattery, setTargetBattery] = useState<number>(85);
  const [batterySizeKWh, setBatterySizeKWh] = useState<number>(40); // Standard Nexon EV battery ~40.5kWh
  const tariffPerKWh = 18.0; // Current regional benchmark

  const energyNeeded = Math.max(0, Math.round(((targetBattery - startingBattery) * batterySizeKWh) / 100));
  const estimatedEnergyCost = Math.round(energyNeeded * tariffPerKWh);
  const fixedServiceFee = 100; // Mandatory ₹100
  const estimatedTax = Math.round((estimatedEnergyCost + fixedServiceFee) * 0.05);
  const totalCost = fixedServiceFee + estimatedEnergyCost + estimatedTax;

  return (
    <div style={{ paddingTop: '80px', background: 'var(--color-bg)' }}>
      {/* Header */}
      <section style={{ background: 'var(--color-eggplant)', color: '#FFFFFF', padding: '5rem 0 4rem 0', textAlign: 'center' }}>
        <div className="container-custom">
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-orange)' }}>
            Transparent Economics
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Fixed ₹100 Service Fee. Electricity At Actuals.
          </h1>
          <p style={{ color: 'rgba(250, 248, 246, 0.85)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
            No subscriptions required. No disguised markup on charging tariffs. Pure transparency.
          </p>
        </div>
      </section>

      {/* Main Pricing Breakdown */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container-custom">
          {/* Interactive Cost Estimator */}
          <div
            style={{
              maxWidth: '840px',
              margin: '0 auto 4rem auto',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              border: '2px solid var(--color-orchid)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <Calculator size={22} color="var(--color-orange)" />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-heading)', margin: 0 }}>
                Interactive EV Charge Cost Estimator
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '6px' }}>
                  Current Battery: <span style={{ color: 'var(--color-orange)' }}>{startingBattery}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={startingBattery}
                  onChange={(e) => setStartingBattery(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-orange)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '6px' }}>
                  Target Battery: <span style={{ color: 'var(--color-orange)' }}>{targetBattery}%</span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={targetBattery}
                  onChange={(e) => setTargetBattery(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-orange)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '6px' }}>
                  EV Battery Pack Size
                </label>
                <select
                  value={batterySizeKWh}
                  onChange={(e) => setBatterySizeKWh(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1D5DB', background: '#fff' }}
                >
                  <option value={30}>30 kWh (Tata Tiago/Tigor EV)</option>
                  <option value={40}>40.5 kWh (Tata Nexon EV)</option>
                  <option value={50}>50 kWh (MG ZS EV)</option>
                  <option value={70}>72 kWh (BYD Atto 3)</option>
                </select>
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            <div
              style={{
                background: 'var(--color-lavender)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.2rem',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 700 }}>Fixed Service Fee</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-heading)' }}>{formatINR(fixedServiceFee)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Pickup, transit & return</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 700 }}>Power Cost (~{energyNeeded} kWh)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-heading)' }}>{formatINR(estimatedEnergyCost)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>At ~₹18/kWh station meter</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 700 }}>Estimated Total</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-orange)', fontFamily: 'var(--font-display)' }}>
                  {formatINR(totalCost)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Incl. 5% GST</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/book" className="btn-primary" style={{ padding: '0.9rem 2.4rem', fontSize: '1rem' }}>
              <span>Book Charge With Transparent Pricing</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
