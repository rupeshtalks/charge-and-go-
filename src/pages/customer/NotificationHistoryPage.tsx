import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { InAppNotification } from '../../types';
import { formatDateTime } from '../../lib/constants';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { Bell, CheckCheck, Clock, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationHistoryPage: React.FC = () => {
  const { t } = useAppPreferences();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'charging' | 'driver'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    const updated = await api.getNotifications();
    setNotifications(updated);
  };

  const handleMarkAllRead = async () => {
    const all = await api.getNotifications();
    for (const n of all) {
      await api.markNotificationRead(n.id);
    }
    const updated = await api.getNotifications();
    setNotifications(updated);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'charging') return n.type === 'charging';
    if (filter === 'driver') return n.type === 'driver';
    return true;
  });

  return (
    <div style={{ paddingTop: '95px', paddingBottom: '5rem', background: 'var(--color-bg)', minHeight: '100vh', transition: 'background-color 0.25s ease' }}>
      <div className="container-custom" style={{ maxWidth: '820px' }}>
        <div style={{ marginBottom: '1.2rem' }}>
          <Link
            to="/customer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-heading)',
              fontSize: '0.86rem',
              fontWeight: 800,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '6px 14px',
              borderRadius: '999px',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-orange)', fontWeight: 800 }}>
              Audit & Telemetry Logs
            </span>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-heading)', margin: '4px 0' }}>
              All Notification History
            </h1>
          </div>

          <button onClick={handleMarkAllRead} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
            <CheckCheck size={16} />
            <span>{t('notifications.markAllRead')}</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {(['all', 'unread', 'charging', 'driver'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 800,
                border: filter === f ? 'none' : '1px solid var(--color-border)',
                cursor: 'pointer',
                background: filter === f ? 'var(--color-orange)' : 'var(--color-surface)',
                color: filter === f ? '#FFFFFF' : 'var(--color-heading)',
                boxShadow: 'var(--shadow-subtle)',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Stream */}
        {filtered.length === 0 ? (
          <div className="cng-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <Bell size={40} color="var(--color-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: 'var(--color-heading)', marginBottom: '0.4rem' }}>No Notifications Found</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>You're completely up to date with your vehicle activity.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className="cng-card"
                style={{
                  background: n.read ? 'var(--color-surface)' : 'var(--color-surface-soft)',
                  border: n.read ? '1px solid var(--color-border)' : '2px solid var(--color-orchid)',
                  padding: '1.4rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {!n.read && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'var(--color-orange)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('notifications.newBadge')}
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Zap size={16} color="var(--color-orange)" />
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-heading)' }}>
                    {n.title}
                  </span>
                </div>

                <p style={{ color: 'var(--color-text)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {n.message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {formatDateTime(n.timestamp)}
                  </span>
                  {n.bookingId && (
                    <Link to={`/booking/${n.bookingId}`} style={{ color: 'var(--color-orange)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Track Booking <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
