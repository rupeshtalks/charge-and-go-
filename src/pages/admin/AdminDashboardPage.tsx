import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Booking, ChargingStation } from '../../types';
import { formatINR, STATUS_METADATA } from '../../lib/constants';
import {
  BarChart3,
  Users,
  Zap,
  Shield,
  Settings,
  Sliders,
  CheckCircle,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Search,
  Filter,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [fixedFeeSetting, setFixedFeeSetting] = useState<number>(100);
  const [tariffSetting, setTariffSetting] = useState<number>(18.5);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [adminTab, setAdminTab] = useState<'kpi' | 'bookings' | 'stations' | 'policy'>('kpi');
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    Promise.all([api.getBookings(), api.getChargingStations()]).then(([b, s]) => {
      setBookings(b);
      setStations(s);
    });
  }, []);

  const totalGMV = bookings.reduce((sum, b) => sum + (b.finalInvoiceTotal || b.estimatedTotal), 0);
  const totalServiceFeeRevenue = bookings.length * fixedFeeSetting;
  const activeJobs = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const filteredBookings = bookings.filter((b) => {
    const q = filterQuery.toLowerCase();
    return (
      b.referenceNumber.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.vehicle.registrationNumber.toLowerCase().includes(q) ||
      b.pickupLocality.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ paddingTop: '85px', paddingBottom: '6rem', background: 'var(--color-bg)', minHeight: '100vh', transition: 'background-color 0.25s ease' }}>
      <div className="container-custom">
        {/* Admin Command Banner */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '2rem 0',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(231,176,222,0.15)', border: '1px solid var(--color-border)', padding: '4px 12px', borderRadius: '999px', marginBottom: '8px' }}>
              <Shield size={14} color="var(--color-orchid)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-orchid)', letterSpacing: '0.08em' }}>
                Executive Operations &amp; Platform Command
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', color: 'var(--color-heading)', margin: '4px 0' }}>
              Dehradun Central Operations Suite
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Live Telemetry, Verified Driver Allocation, Tariff Policy &amp; Settlement Oversight
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'var(--color-surface-soft)', color: 'var(--color-heading)', border: '1px solid var(--color-border)', padding: '7px 16px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 800 }}>
              Pilot Hub: Dehradun (Active)
            </span>
            <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981', padding: '7px 16px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 800 }}>
              ● 2 Drivers Active
            </span>
          </div>
        </div>

        {/* Admin Multi-Tab Command Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '2.5rem', overflowX: 'auto' }}>
          {[
            { id: 'kpi', label: 'Executive KPIs & Revenue', icon: BarChart3 },
            { id: 'bookings', label: `Fleet Bookings (${bookings.length})`, icon: Layers },
            { id: 'stations', label: `Fast DC Hubs (${stations.length})`, icon: Zap },
            { id: 'policy', label: 'Pricing & Commission Policy', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as 'kpi' | 'bookings' | 'stations' | 'policy')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.8rem 1.4rem',
                  border: 'none',
                  background: 'transparent',
                  color: active ? 'var(--color-heading)' : 'var(--color-muted)',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  borderBottom: active ? '3px solid var(--color-orange)' : '3px solid transparent',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} color={active ? 'var(--color-orange)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================
            ADMIN TAB 1: EXECUTIVE KPIS & FINANCIAL OVERSIGHT
           ========================================================= */}
        {adminTab === 'kpi' && (
          <>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="cng-card" style={{ padding: '1.6rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Total Bookings Handled
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-heading)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                  {bookings.length}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  <TrendingUp size={14} /> 100% On-Time Return SLA
                </div>
              </div>

              <div className="cng-card" style={{ padding: '1.6rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Active Concierge Runs
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-orange)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                  {activeJobs}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  Assigned to Pilot Vikram Singh
                </div>
              </div>

              <div className="cng-card" style={{ padding: '1.6rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Fixed Concierge Revenue (₹100/Run)
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-heading)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                  {formatINR(totalServiceFeeRevenue)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  Net concierge platform margins
                </div>
              </div>

              <div className="cng-card" style={{ padding: '1.6rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Gross GMV Pass-Through
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-heading)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                  {formatINR(totalGMV)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  Electricity at actuals + 18% GST
                </div>
              </div>
            </div>

            {/* Hub Utilization Overview */}
            <div className="cng-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--color-orange)" />
                <span>Station Slot Utilization (Dehradun Pilot)</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {stations.map((stn) => {
                  const usedSlots = stn.totalSlots - stn.availableSlots;
                  const pct = Math.round((usedSlots / stn.totalSlots) * 100);
                  return (
                    <div key={stn.id} style={{ background: 'var(--color-surface-soft)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ color: 'var(--color-heading)', fontSize: '0.95rem' }}>{stn.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{stn.address}</div>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-orange)', fontWeight: 800 }}>
                          ₹{stn.tariffPerKWh}/kWh
                        </span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--color-surface)', borderRadius: '999px', overflow: 'hidden', margin: '10px 0' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-orange)', borderRadius: '999px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                        <span>Utilization: {pct}%</span>
                        <span>{stn.availableSlots} of {stn.totalSlots} Slots Free</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* =========================================================
            ADMIN TAB 2: BOOKING MANAGEMENT & FILTERS
           ========================================================= */}
        {adminTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--color-heading)', margin: 0 }}>
                  Master Fleet Booking Ledger
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                  Filter, inspect and verify vehicle telemetry and photo evidence across all orders.
                </p>
              </div>

              {/* Search filter input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface-soft)', padding: '8px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
                <Search size={16} color="var(--color-muted)" />
                <input
                  type="text"
                  placeholder="Search ref, customer, plate..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '0.88rem', width: '220px' }}
                />
              </div>
            </div>

            <div className="cng-card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-heading)' }}>
                    <th style={{ padding: '1rem 1.2rem', fontWeight: 800 }}>Ref #</th>
                    <th style={{ padding: '1rem 1.2rem', fontWeight: 800 }}>Customer</th>
                    <th style={{ padding: '1rem 1.2rem', fontWeight: 800 }}>Vehicle Details</th>
                    <th style={{ padding: '1rem 1.2rem', fontWeight: 800 }}>Assigned Driver</th>
                    <th style={{ padding: '1rem 1.2rem', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '1rem 1.2rem', fontWeight: 800 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '1rem 1.2rem', fontWeight: 800, color: 'var(--color-heading)' }}>
                        {b.referenceNumber}
                      </td>
                      <td style={{ padding: '1rem 1.2rem', color: 'var(--color-text-secondary)' }}>
                        <div><strong>{b.customerName}</strong></div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{b.customerPhone}</div>
                      </td>
                      <td style={{ padding: '1rem 1.2rem', color: 'var(--color-text-secondary)' }}>
                        <div>{b.vehicle.make} {b.vehicle.model}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-orange)', fontWeight: 700 }}>
                          {b.vehicle.registrationNumber}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.2rem', color: 'var(--color-text-secondary)' }}>
                        {b.assignedDriverName || 'Pending Allocation'}
                      </td>
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <span className={`badge ${STATUS_METADATA[b.status]?.badgeClass || 'badge-eggplant'}`}>
                          {STATUS_METADATA[b.status]?.label || b.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.2rem', fontWeight: 800, color: 'var(--color-heading)' }}>
                        {formatINR(b.finalInvoiceTotal || b.estimatedTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            ADMIN TAB 3: CHARGING STATIONS & HUBS
           ========================================================= */}
        {adminTab === 'stations' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-heading)', margin: 0 }}>
                Partner Fast DC Stations &amp; Hardware Status
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                Hardware gun telemetry, live tariff configurations and connector types.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem' }}>
              {stations.map((stn) => (
                <div key={stn.id} className="cng-card" style={{ padding: '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--color-orange)', fontWeight: 800 }}>
                        Partner Station Hub
                      </span>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-heading)', margin: '4px 0' }}>
                        {stn.name}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                        {stn.address}
                      </div>
                    </div>
                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 800 }}>
                      Operational
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                      <strong>Supported Charging Guns:</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {stn.supportedTypes.map((t, idx) => (
                        <span key={idx} style={{ background: 'var(--color-surface-soft)', color: 'var(--color-heading)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <span style={{ fontSize: '0.84rem', color: 'var(--color-muted)' }}>
                      Benchmarked Tariff:
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-heading)' }}>
                      ₹{stn.tariffPerKWh} / kWh
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            ADMIN TAB 4: PRICING & COMMISSION POLICY CONTROLS
           ========================================================= */}
        {adminTab === 'policy' && (
          <div style={{ maxWidth: '680px' }}>
            <div className="cng-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Sliders size={20} color="var(--color-orange)" />
                <h2 style={{ fontSize: '1.3rem', color: 'var(--color-heading)', margin: 0 }}>
                  Pricing Policy &amp; Commission Authority
                </h2>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Charge &amp; Go operates with a transparent flat ₹100 concierge fee structure. Update policy thresholds below.
              </p>

              {settingsSaved && (
                <div
                  style={{
                    padding: '0.8rem 1.2rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10B981',
                    color: '#10B981',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    marginBottom: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  ✓ Pricing configuration saved to platform runtime memory.
                </div>
              )}

              <form onSubmit={handleSavePricing} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '6px' }}>
                    Fixed Concierge Pickup &amp; Drop Fee (INR)
                  </label>
                  <input
                    type="number"
                    value={fixedFeeSetting}
                    onChange={(e) => setFixedFeeSetting(parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-input-border)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                  />
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                    Current nationwide standard: ₹100 per pickup &amp; drop run.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '6px' }}>
                    Baseline Fast DC Tariff Estimate (₹ / kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tariffSetting}
                    onChange={(e) => setTariffSetting(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-input-border)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                  />
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                    Used for calculating customer estimates during initial booking.
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  <span>Save Policy Settings</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
