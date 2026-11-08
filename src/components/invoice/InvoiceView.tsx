import React, { useRef } from 'react';
import { Invoice } from '../../types';
import { formatINR, formatDateTime } from '../../lib/constants';
import { Zap, Download, Printer, Shield, CheckCircle2 } from 'lucide-react';

interface InvoiceViewProps {
  invoice: Invoice;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-orange)', fontWeight: 800, letterSpacing: '0.06em' }}>
            Official Tax Invoice
          </span>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-heading)', margin: '2px 0' }}>
            Invoice #{invoice.invoiceNumber}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={handlePrint} className="btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
            <Printer size={15} />
            <span>Print</span>
          </button>
          <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
            <Download size={15} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Card / Printable Document */}
      <div
        ref={printAreaRef}
        className="cng-card invoice-printable"
        style={{
          padding: '2.5rem',
        }}
      >
        {/* Header Block */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--color-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={18} color="#FFFFFF" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.35rem', color: 'var(--color-heading)' }}>
                CHARGE <span style={{ color: 'var(--color-orange)' }}>&</span> GO
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Charge & Go Technologies Pvt. Ltd.<br />
              Pilot Operations Center, Rajpur Road, Dehradun<br />
              GSTIN: 05AAACC1234F1Z8 (Provisional)
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                background: invoice.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 90, 10, 0.15)',
                color: invoice.paymentStatus === 'paid' ? '#10B981' : 'var(--color-orange)',
                border: invoice.paymentStatus === 'paid' ? '1px solid #10B981' : '1px solid rgba(255, 90, 10, 0.35)',
                fontWeight: 800,
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '999px',
                marginBottom: '0.6rem',
              }}
            >
              {invoice.paymentStatus === 'paid' ? '● Paid in Full' : '● Payment Pending'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              Date: <strong>{formatDateTime(invoice.issueDate)}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              Ref: <strong>{invoice.bookingReference}</strong>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.8rem',
            marginBottom: '2.5rem',
            background: 'var(--color-surface-soft)',
            padding: '1.4rem 1.6rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '4px' }}>
              Billed To (Customer)
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-heading)' }}>
              {invoice.customerName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{invoice.customerPhone}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{invoice.customerEmail}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '4px' }}>
              Serviced Electric Vehicle
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-heading)' }}>
              {invoice.vehicleDescription}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-orange)', fontWeight: 800 }}>
              Reg: {invoice.registrationNumber}
            </div>
            {invoice.consumedKWh && (
              <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                Energy Dispensed: {invoice.consumedKWh} kWh (@ ₹{invoice.tariffPerKWh}/kWh)
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ marginBottom: '2.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 0' }}>Item Description</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Basis / Rate</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {/* Mandatory Fixed Pickup-Drop Fee */}
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '1rem 0' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-heading)' }}>
                    Fixed Pickup-and-Drop Service Fee
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                    Authorized driver collection, station transit, and secure return delivery
                  </div>
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                  Fixed tariff
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 800, color: 'var(--color-heading)' }}>
                  {formatINR(invoice.fixedServiceFee)}
                </td>
              </tr>

              {/* Charging Cost at Actuals */}
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '1rem 0' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-heading)' }}>
                    DC Fast Charging Energy Consumption
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                    Actual verified charging station meter draw ({invoice.consumedKWh || 24.4} kWh)
                  </div>
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                  ₹{invoice.tariffPerKWh || 18}/kWh
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 800, color: 'var(--color-heading)' }}>
                  {formatINR(invoice.chargingCost)}
                </td>
              </tr>

              {/* Taxes */}
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '1rem 0' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-heading)' }}>
                    Applicable GST / Taxes
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                    5% GST on electric vehicle charging service
                  </div>
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                  5.0%
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 800, color: 'var(--color-heading)' }}>
                  {formatINR(invoice.taxAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Calculations */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
              <span>Subtotal:</span>
              <span>{formatINR(invoice.fixedServiceFee + invoice.chargingCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
              <span>Taxes:</span>
              <span>{formatINR(invoice.taxAmount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.8rem 0 0.4rem 0',
                borderTop: '2px solid var(--color-border)',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: 'var(--color-heading)',
                fontFamily: 'var(--font-display)',
              }}
            >
              <span>Total Paid:</span>
              <span style={{ color: 'var(--color-orange)' }}>{formatINR(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--color-muted)',
            fontSize: '0.78rem',
          }}
        >
          <Shield size={16} color="var(--color-orange)" style={{ flexShrink: 0 }} />
          <span>
            Every Charge & Go service includes full digital custody logs, timestamped odometer records, and station charging receipts for 100% financial transparency.
          </span>
        </div>
      </div>
    </div>
  );
};
