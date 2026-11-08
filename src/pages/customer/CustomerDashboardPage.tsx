
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Booking, InAppNotification, UserProfile } from '../../types';
import { STATUS_METADATA, formatINR, formatDateTime } from '../../lib/constants';
import {
  BatteryCharging,
  Plus,
  Car,
  ChevronRight,
  Bell,
  Sparkles,
  ShieldCheck,
  Receipt,
  Zap,
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'invoices'>('overview');

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.getCurrentUser(),
      api.getBookings(),
      api.getNotifications(),
    ])
      .then(([u, b, n]) => {
        if (!mounted) return;
        setUser(u);
        setBookings(b);
        setNotifications(n);
      })
      .catch((error) => {
        console.error('Unable to load customer dashboard:', error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeBooking = bookings.find(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );

  const customerVehicles = [
    {
      id: 'vh_01',
      name: 'Tata Nexon EV Empowered+',
      reg: 'UK 07 AF 8901',
      range: '465 km',
      battery: 84,
      color: '#00F2FE',
    },
    {
      id: 'vh_02',
      name: 'Mahindra XUV400 EL Pro',
      reg: 'UK 07 BE 4420',
      range: '375 km',
      battery: 62,
      color: '#FF5A0A',
    },
  ];

  if (loading) {
    return (
      <div style={{
        paddingTop: '130px',
        textAlign: 'center',
        minHeight: '80vh',
        color: 'var(--color-muted)',
      }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '3px solid rgba(231,176,222,0.2)',
          borderTopColor: 'var(--color-orange)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem',
        }} />
        <p style={{ fontWeight: 600 }}>
          Loading your personal mobility suite...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      paddingTop: '95px',
      paddingBottom: '6rem',
      background: 'var(--color-bg)',
      minHeight: '100vh',
      transition: 'background-color 0.25s ease',
    }}>
      <div className="container-custom">

        {/* WELCOME BANNER */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: '2.2rem 0 1.8rem',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '2rem',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(231,176,222,0.12)',
              border: '1px solid var(--color-border)',
              padding: '4px 12px',
              borderRadius: '999px',
              marginBottom: '8px',
            }}>
              <Sparkles size={13} color="var(--color-orchid)" />
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-orchid)',
                letterSpacing: '0.08em',
              }}>
                Customer Mobility Suite • Personal Fleet
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              color: 'var(--color-heading)',
              margin: '4px 0',
            }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Customer'}
            </h1>

            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.92rem',
            }}>
              Personal EV Concierge Active • Dehradun Hub
              {user?.email ? ` (${user.email})` : ''}
            </p>
          </div>

          <Link
            to="/book"
            className="btn-primary"
            style={{
              padding: '0.85rem 1.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={18} />
            <span>Book Concierge Charge</span>
          </Link>
        </div>

        {/* DASHBOARD TABS */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '2.5rem',
          overflowX: 'auto',
        }}>
          {[
            { id: 'overview', label: 'Fleet Overview & Active Service', icon: Car },
            { id: 'vehicles', label: 'My Vehicles (2)', icon: BatteryCharging },
            { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
                  borderBottom: active
                    ? '3px solid var(--color-orange)'
                    : '3px solid transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon
                  size={16}
                  color={active ? 'var(--color-orange)' : 'currentColor'}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {activeBooking ? (
              <div style={{
                background: 'linear-gradient(135deg, #2A0932 0%, #15021C 100%)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.2rem',
                border: '2px solid var(--color-orchid)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                marginBottom: '3rem',
                position: 'relative',
                overflow: 'hidden',
                color: '#FFFFFF',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-60px',
                  right: '-60px',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,242,254,0.18), transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  marginBottom: '1.4rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#00F2FE',
                      boxShadow: '0 0 12px #00F2FE',
                    }} />
                    <span style={{
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      color: '#00F2FE',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                    }}>
                      Active Concierge Mission in Progress
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.82rem',
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(231,176,222,0.25)',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '999px',
                  }}>
                    Ref: {activeBooking.referenceNumber}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '2rem',
                  alignItems: 'center',
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.6rem',
                      color: '#FFFFFF',
                      marginBottom: '4px',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {activeBooking.vehicle.make} {activeBooking.vehicle.model}
                    </h3>

                    <div style={{
                      fontSize: '0.95rem',
                      color: 'var(--color-orange)',
                      fontWeight: 800,
                      marginBottom: '0.9rem',
                    }}>
                      {activeBooking.vehicle.registrationNumber}
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(231,176,222,0.18)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(231,176,222,0.3)',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}>
                      <Zap size={14} color="#FF5A0A" />
                      Status: {STATUS_METADATA[activeBooking.status]?.label || activeBooking.status}
                    </div>
                  </div>

                  {/* BATTERY PROGRESS */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: '#D8C9DD',
                      marginBottom: '6px',
                    }}>
                      <span>Battery Charge Target</span>
                      <strong style={{ color: '#00F2FE' }}>80% Target</strong>
                    </div>

                    <div style={{
                      height: '10px',
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: '74%',
                        background: 'linear-gradient(90deg,#FF5A0A,#00F2FE)',
                        borderRadius: '999px',
                      }} />
                    </div>

                    <div style={{
                      fontSize: '0.76rem',
                      color: '#B8A7BF',
                      marginTop: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span>Started: 24%</span>
                      <span>Targeting 80% Fast DC</span>
                    </div>
                  </div>

                  {/* DRIVER */}
                  <div>
                    <div style={{
                      fontSize: '0.78rem',
                      color: '#D8C9DD',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}>
                      Dedicated Verified Chauffeur
                    </div>

                    <div style={{
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: '#FFFFFF',
                    }}>
                      {activeBooking.assignedDriverName || 'Assigning verified pilot...'}
                    </div>

                    {activeBooking.assignedDriverPhone && (
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#E7B0DE',
                        marginTop: '4px',
                      }}>
                        {activeBooking.assignedDriverPhone}
                      </div>
                    )}
                  </div>

                  {/* FIXED VISIBLE TRACK BUTTON */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                  }}>
                    <Link
                      to={`/booking/${activeBooking.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        background: '#FF5A0A',
                        color: '#FFFFFF',
                        padding: '14px 24px',
                        minHeight: '48px',
                        borderRadius: '50px',
                        fontSize: '14px',
                        fontWeight: 800,
                        textDecoration: 'none',
                        border: '1px solid #FF5A0A',
                        boxShadow: '0 8px 24px rgba(255,90,10,0.3)',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <span style={{ color: '#FFFFFF' }}>
                        Track Live Journey
                      </span>
                      <ChevronRight size={18} color="#FFFFFF" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '3rem',
                boxShadow: 'var(--shadow-subtle)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(255,90,10,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ShieldCheck size={28} color="var(--color-orange)" />
                  </div>

                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      color: 'var(--color-heading)',
                    }}>
                      No Active Concierge Runs Right Now
                    </h3>
                    <p style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.9rem',
                    }}>
                      Your vehicles are ready for their next charging session.
                    </p>
                  </div>
                </div>

                <Link to="/book" className="btn-primary">
                  Schedule Pickup Now (₹100)
                  <ChevronRight size={15} />
                </Link>
              </div>
            )}

            {/* BOOKINGS AND NOTIFICATIONS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
              gap: '2.5rem',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '1.2rem',
                  gap: '10px',
                }}>
                  <h2 style={{
                    fontSize: '1.35rem',
                    color: 'var(--color-heading)',
                    margin: 0,
                  }}>
                    Recent Concierge Charging Runs
                  </h2>

                  <span style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-muted)',
                  }}>
                    Total: {bookings.length} Bookings
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <div style={{
                    background: 'var(--color-surface)',
                    padding: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    border: '1px solid var(--color-border)',
                  }}>
                    <Car size={36} color="var(--color-muted)" />
                    <h4 style={{ color: 'var(--color-heading)' }}>
                      No Bookings Yet
                    </h4>
                    <p style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.88rem',
                    }}>
                      You haven't requested an EV charge yet.
                      Book your first concierge pickup.
                    </p>
                    <Link to="/book" className="btn-primary">
                      Schedule First Pickup (₹100)
                    </Link>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="cng-card"
                        style={{
                          padding: '1.4rem 1.6rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div style={{
                            fontWeight: 800,
                            color: 'var(--color-heading)',
                            fontSize: '1.05rem',
                            marginBottom: '5px',
                          }}>
                            {b.vehicle.make} {b.vehicle.model}
                          </div>

                          <div style={{
                            fontSize: '0.82rem',
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                          }}>
                            <span>Ref: {b.referenceNumber}</span>
                            <span>Date: {b.preferredPickupDate}</span>
                            <span>Slot: {b.preferredPickupTimeSlot}</span>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          flexWrap: 'wrap',
                        }}>
                          <span className={`badge ${STATUS_METADATA[b.status]?.badgeClass || 'badge-eggplant'}`}>
                            {STATUS_METADATA[b.status]?.label || b.status}
                          </span>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontWeight: 800,
                              color: 'var(--color-heading)',
                            }}>
                              {formatINR(b.finalInvoiceTotal || b.estimatedTotal)}
                            </div>

                            <div style={{
                              fontSize: '0.74rem',
                              color: b.isPaid ? 'var(--color-success)' : 'var(--color-orange)',
                              fontWeight: 800,
                            }}>
                              {b.isPaid ? '● Settled' : '● Due'}
                            </div>
                          </div>

                          <Link
                            to={`/booking/${b.id}`}
                            className="btn-secondary"
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.82rem',
                            }}
                          >
                            Details <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NOTIFICATIONS */}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1.2rem',
                }}>
                  <Bell size={18} color="var(--color-orange)" />
                  <h2 style={{
                    fontSize: '1.35rem',
                    color: 'var(--color-heading)',
                    margin: 0,
                  }}>
                    Alerts & Updates
                  </h2>
                </div>

                <div style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.2rem',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-subtle)',
                }}>
                  {notifications.length === 0 ? (
                    <p style={{
                      color: 'var(--color-muted)',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                    }}>
                      You're all caught up! No new notifications.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '1rem 0',
                          borderBottom: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '8px',
                          marginBottom: '4px',
                        }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: 'var(--color-heading)',
                          }}>
                            {n.title}
                          </span>

                          <span style={{
                            fontSize: '0.72rem',
                            color: 'var(--color-muted)',
                            whiteSpace: 'nowrap',
                          }}>
                            {formatDateTime(n.timestamp)}
                          </span>
                        </div>

                        <p style={{
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.84rem',
                          lineHeight: 1.45,
                          margin: 0,
                        }}>
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}

                  <Link
                    to="/notifications"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: 'var(--color-orange)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      marginTop: '1rem',
                      textDecoration: 'none',
                    }}
                  >
                    View All Notifications
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VEHICLES TAB */}
        {activeTab === 'vehicles' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.4rem',
                  color: 'var(--color-heading)',
                }}>
                  Registered Vehicles
                </h2>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.88rem',
                }}>
                  Manage the electric vehicles connected to your account.
                </p>
              </div>

              <Link to="/profile" className="btn-secondary">
                <Plus size={16} />
                Manage Vehicles
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
              gap: '1.8rem',
            }}>
              {customerVehicles.map((vh) => (
                <div
                  key={vh.id}
                  className="cng-card"
                  style={{
                    padding: '1.8rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    gap: '1rem',
                  }}>
                    <div>
                      <span style={{
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        color: vh.color,
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                      }}>
                        Connected EV
                      </span>

                      <h3 style={{
                        fontSize: '1.25rem',
                        color: 'var(--color-heading)',
                        margin: '4px 0',
                      }}>
                        {vh.name}
                      </h3>

                      <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-orange)',
                        fontWeight: 800,
                      }}>
                        {vh.reg}
                      </div>
                    </div>

                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(231,176,222,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Car size={22} color="var(--color-orchid)" />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      marginBottom: '4px',
                      color: 'var(--color-text-secondary)',
                    }}>
                      <span>Reported Battery</span>
                      <strong style={{ color: 'var(--color-heading)' }}>
                        {vh.battery}%
                      </strong>
                    </div>

                    <div style={{
                      height: '8px',
                      background: 'var(--color-surface-soft)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${vh.battery}%`,
                        background: 'var(--color-orange)',
                        borderRadius: '999px',
                      }} />
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderTop: '1px solid var(--color-border-subtle)',
                    paddingTop: '1rem',
                  }}>
                    <span style={{
                      fontSize: '0.82rem',
                      color: 'var(--color-muted)',
                    }}>
                      Est. Range: <strong>{vh.range}</strong>
                    </span>

                    <Link
                      to="/book"
                      className="btn-primary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                      }}
                    >
                      Request Charge
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                color: 'var(--color-heading)',
              }}>
                Transparent Billing & Tax Invoices
              </h2>

              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.88rem',
              }}>
                Every run includes a flat ₹100 concierge fee plus actual charging costs and applicable GST.
              </p>
            </div>

            <div className="cng-card" style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                minWidth: '750px',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.88rem',
              }}>
                <thead>
                  <tr style={{
                    background: 'var(--color-surface-soft)',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-heading)',
                  }}>
                    {[
                      'Invoice #',
                      'Vehicle',
                      'Fixed Concierge Fee',
                      'Power Cost',
                      'Total (INR)',
                      'Action',
                    ].map((heading) => (
                      <th key={heading} style={{
                        padding: '1rem 1.4rem',
                        fontWeight: 800,
                      }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <td style={{
                        padding: '1rem 1.4rem',
                        fontWeight: 700,
                        color: 'var(--color-heading)',
                      }}>
                        INV-{b.referenceNumber}
                      </td>

                      <td style={{
                        padding: '1rem 1.4rem',
                        color: 'var(--color-text-secondary)',
                      }}>
                        {b.vehicle.make} {b.vehicle.model}
                      </td>

                      <td style={{
                        padding: '1rem 1.4rem',
                        color: 'var(--color-text-secondary)',
                      }}>
                        ₹100.00
                      </td>

                      <td style={{
                        padding: '1rem 1.4rem',
                        color: 'var(--color-text-secondary)',
                      }}>
                        {formatINR(b.estimatedChargingCost)}
                      </td>

                      <td style={{
                        padding: '1rem 1.4rem',
                        fontWeight: 800,
                        color: 'var(--color-heading)',
                      }}>
                        {formatINR(b.finalInvoiceTotal || b.estimatedTotal)}
                      </td>

                      <td style={{ padding: '1rem 1.4rem' }}>
                        <Link
                          to={`/booking/${b.id}`}
                          style={{
                            color: 'var(--color-orange)',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          View Receipt
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {bookings.length === 0 && (
                <p style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--color-muted)',
                }}>
                  No invoices available yet.
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDashboardPage;
