import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InAppNotification } from '../../types';
import { formatDateTime } from '../../lib/constants';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { Bell, Check, CheckCheck, Clock, ArrowRight, Zap, Car, Shield, X } from 'lucide-react';

interface NotificationCenterDrawerProps {
  notifications: InAppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  isOpen,
  onClose,
}) => {
  const { t } = useAppPreferences();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(36, 33, 39, 0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-elevated)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.4rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 90, 10, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} color="var(--color-orange)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-heading)', margin: 0, fontFamily: 'var(--font-display)' }}>
                {t('notifications.title')}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                {unreadCount} {t('notifications.unread')}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              padding: '6px',
            }}
            aria-label="Close notifications drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Pills & Mark All Read */}
        <div
          style={{
            padding: '0.8rem 1.5rem',
            background: 'var(--color-surface-soft)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: filter === 'all' ? 'var(--color-orange)' : 'transparent',
                color: filter === 'all' ? '#FFFFFF' : 'var(--color-muted)',
              }}
            >
              {t('notifications.all')} ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: filter === 'unread' ? 'var(--color-orange)' : 'transparent',
                color: filter === 'unread' ? '#FFFFFF' : 'var(--color-muted)',
              }}
            >
              {t('notifications.unread')} ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-orange)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCheck size={14} />
              <span>{t('notifications.markAllRead')}</span>
            </button>
          )}
        </div>

        {/* Notification Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <Bell size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.35 }} />
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('notifications.noNotifications')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  style={{
                    background: n.read ? 'transparent' : 'var(--color-surface-soft)',
                    border: n.read ? '1px solid var(--color-border)' : '1px solid var(--color-orchid-alpha-40)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {!n.read && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--color-orange)',
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Zap size={14} color="var(--color-orange)" />
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-heading)' }}>
                      {n.title}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.4, margin: '0 0 8px 0' }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> {formatDateTime(n.timestamp)}
                    </span>
                    {n.bookingId && (
                      <Link
                        to={`/booking/${n.bookingId}`}
                        onClick={onClose}
                        style={{ color: 'var(--color-orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        Track <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <Link
            to="/notifications"
            onClick={onClose}
            style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-orange)' }}
          >
            {t('notifications.viewAll')} →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
