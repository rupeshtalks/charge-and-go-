
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { UserProfile } from '../../types';
import {
  useAppPreferences,
  SupportedLanguage,
  SupportedTheme,
} from '../../context/AppPreferencesContext';
import {
  Camera,
  Check,
  Shield,
  User,
  Mail,
  Phone,
  Globe,
  Moon,
  Sun,
  Monitor,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 15px',
  borderRadius: '12px',
  border: '1px solid var(--color-input-border)',
  background: 'var(--color-input-bg)',
  color: 'var(--color-text)',
  fontSize: '0.94rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '0.84rem',
  fontWeight: 700,
  color: 'var(--color-heading)',
};

const cardStyle: React.CSSProperties = {
  padding: 'clamp(18px, 4vw, 28px)',
  borderRadius: '20px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  boxShadow: 'var(--shadow-card)',
};

export const ProfilePage: React.FC = () => {
  const { t, language, setLanguage, theme, setTheme } =
    useAppPreferences();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const currentUser = await api.getCurrentUser();

        if (!active) return;

        if (!currentUser) {
          setErrorMsg('Unable to load your profile. Please sign in again.');
          return;
        }

        setUser(currentUser);
        setName(currentUser.name || '');
        setPhone(currentUser.phone || '');
        setAvatarPreview(currentUser.avatarUrl || null);
      } catch {
        if (active) {
          setErrorMsg('Something went wrong while loading your profile.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const handleAvatarUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploadError(null);
    setSuccessMsg(false);

    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };

    reader.onerror = () => {
      setUploadError('Unable to read this image. Please try another one.');
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) return;

    setErrorMsg(null);
    setSuccessMsg(false);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Please enter a valid name.');
      return;
    }

    if (!/^[0-9+\-\s()]{10,16}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    setSaving(true);

    try {
      const updatedUser: UserProfile = {
        ...user,
        name: cleanName,
        phone: cleanPhone,
        avatarUrl: avatarPreview || undefined,
      };

      // Preserves the existing development-profile storage mechanism.
      // Replace this with your authenticated backend update API when available.
      localStorage.setItem(
        'cng_dev_user_v1',
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);
      setName(cleanName);
      setPhone(cleanPhone);
      setSuccessMsg(true);

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }

      successTimerRef.current = setTimeout(() => {
        setSuccessMsg(false);
      }, 3500);
    } catch {
      setErrorMsg('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--color-bg)',
          color: 'var(--color-heading)',
          gap: '12px',
        }}
      >
        <Loader2 size={22} className="animate-spin" />
        Loading your profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '130px 20px',
          background: 'var(--color-bg)',
          textAlign: 'center',
          color: 'var(--color-heading)',
        }}
      >
        <AlertCircle size={38} />
        <h2>Profile unavailable</h2>
        <p>{errorMsg || 'Please sign in and try again.'}</p>
        <Link to="/login" className="btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  const dashboardPath =
    user.role === 'admin'
      ? '/admin'
      : user.role === 'driver'
        ? '/driver'
        : '/customer';

  const languages = [
    { code: 'en', label: 'English', sub: 'English' },
    { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
  ];

  const themes = [
    {
      code: 'light',
      label: 'Light',
      description: 'Bright and minimal',
      icon: Sun,
    },
    {
      code: 'dark',
      label: 'Dark',
      description: 'Elegant dark surfaces',
      icon: Moon,
    },
    {
      code: 'system',
      label: 'System',
      description: 'Follow your device',
      icon: Monitor,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '95px',
        paddingBottom: '70px',
        background: 'var(--color-bg)',
        transition: 'background 0.25s ease',
      }}
    >
      <div
        className="container-custom"
        style={{
          maxWidth: '850px',
          paddingLeft: 'clamp(16px, 4vw, 24px)',
          paddingRight: 'clamp(16px, 4vw, 24px)',
        }}
      >
        {/* Navigation */}
        <div style={{ marginBottom: '26px' }}>
          <Link
            to={dashboardPath}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              color: 'var(--color-heading)',
              textDecoration: 'none',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '10px 16px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '30px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-orange)',
              fontSize: '0.76rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 800,
            }}
          >
            <Sparkles size={15} />
            {t('profile.title')}
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.8rem)',
              lineHeight: 1.15,
              color: 'var(--color-heading)',
              margin: '12px 0 8px',
              letterSpacing: '-0.045em',
            }}
          >
            Your profile.
            <br />
            <span style={{ color: 'var(--color-orange)' }}>
              Your preferences.
            </span>
          </h1>

          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.94rem',
              lineHeight: 1.7,
              maxWidth: '550px',
            }}
          >
            Keep your personal details and Charge & Go experience up to date.
          </p>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div
            role="status"
            style={{
              ...cardStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              color: '#10B981',
              borderColor: '#10B981',
              background: 'rgba(16,185,129,0.08)',
            }}
          >
            <Check size={19} />
            <strong>{t('profile.savedSuccess')}</strong>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            style={{
              ...cardStyle,
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              marginBottom: '20px',
              color: 'var(--color-danger)',
            }}
          >
            <AlertCircle size={19} />
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSave}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Profile identity */}
          <section style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '22px',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '112px',
                    height: '112px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--color-surface-soft)',
                    border: '3px solid var(--color-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <User size={48} color="var(--color-heading)" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload profile picture"
                  title="Change profile picture"
                  style={{
                    position: 'absolute',
                    right: '0',
                    bottom: '3px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-surface)',
                    background: 'var(--color-orange)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={17} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '180px' }}>
                <h2
                  style={{
                    color: 'var(--color-heading)',
                    fontSize: '1.35rem',
                    margin: '0 0 8px',
                  }}
                >
                  {name || user.name}
                </h2>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 11px',
                    borderRadius: '999px',
                    background: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-orange)',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    textTransform: 'capitalize',
                  }}
                >
                  <Shield size={13} />
                  {user.role} Account
                </div>

                <p
                  style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.78rem',
                    marginTop: '10px',
                  }}
                >
                  JPG, PNG or WebP · Maximum 5MB
                </p>

                {uploadError && (
                  <p
                    role="alert"
                    style={{
                      color: 'var(--color-danger)',
                      fontSize: '0.8rem',
                      marginTop: '8px',
                    }}
                  >
                    <AlertCircle
                      size={13}
                      style={{ verticalAlign: 'middle' }}
                    />{' '}
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Personal details */}
          <section style={cardStyle}>
            <div style={{ marginBottom: '22px' }}>
              <h3
                style={{
                  color: 'var(--color-heading)',
                  fontSize: '1.15rem',
                  margin: 0,
                }}
              >
                Personal information
              </h3>
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '0.82rem',
                  marginTop: '6px',
                }}
              >
                Your contact details and account identity.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                gap: '20px',
              }}
            >
              <div>
                <label style={labelStyle}>
                  <User size={14} style={{ verticalAlign: 'middle' }} />{' '}
                  {t('profile.fullName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  maxLength={80}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <Phone size={14} style={{ verticalAlign: 'middle' }} />{' '}
                  {t('profile.phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  maxLength={16}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>
                <Mail size={14} style={{ verticalAlign: 'middle' }} />{' '}
                {t('profile.email')}
              </label>

              <input
                type="email"
                value={user.email}
                disabled
                style={{
                  ...inputStyle,
                  opacity: 0.65,
                  cursor: 'not-allowed',
                }}
              />

              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '0.76rem',
                  marginTop: '7px',
                }}
              >
                Your registered email is linked to your login credentials.
              </p>
            </div>
          </section>

          {/* Language preferences */}
          <section style={cardStyle}>
            <div style={{ marginBottom: '18px' }}>
              <h3
                style={{
                  color: 'var(--color-heading)',
                  fontSize: '1.15rem',
                  margin: 0,
                }}
              >
                Language preference
              </h3>
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '0.82rem',
                  marginTop: '6px',
                }}
              >
                Choose your preferred language.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {languages.map((item) => {
                const selected = language === item.code;

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() =>
                      setLanguage(item.code as SupportedLanguage)
                    }
                    aria-pressed={selected}
                    style={{
                      padding: '16px',
                      borderRadius: '13px',
                      border: selected
                        ? '2px solid var(--color-orange)'
                        : '1px solid var(--color-border)',
                      background: selected
                        ? 'var(--color-orange-subtle)'
                        : 'var(--color-surface-soft)',
                      color: 'var(--color-heading)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <strong>{item.label}</strong>
                      {selected && (
                        <Check size={17} color="var(--color-orange)" />
                      )}
                    </div>
                    <span
                      style={{
                        display: 'block',
                        marginTop: '5px',
                        fontSize: '0.75rem',
                        color: 'var(--color-muted)',
                      }}
                    >
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Theme preferences */}
          <section style={cardStyle}>
            <div style={{ marginBottom: '18px' }}>
              <h3
                style={{
                  color: 'var(--color-heading)',
                  fontSize: '1.15rem',
                  margin: 0,
                }}
              >
                Appearance
              </h3>
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '0.82rem',
                  marginTop: '6px',
                }}
              >
                Personalize how Charge & Go looks on your device.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {themes.map((item) => {
                const Icon = item.icon;
                const selected = theme === item.code;

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() =>
                      setTheme(item.code as SupportedTheme)
                    }
                    aria-pressed={selected}
                    style={{
                      padding: '17px',
                      borderRadius: '13px',
                      border: selected
                        ? '2px solid var(--color-orange)'
                        : '1px solid var(--color-border)',
                      background: selected
                        ? 'var(--color-orange-subtle)'
                        : 'var(--color-surface-soft)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Icon
                        size={20}
                        color="var(--color-orange)"
                      />
                      {selected && (
                        <Check size={16} color="var(--color-orange)" />
                      )}
                    </div>

                    <strong
                      style={{
                        display: 'block',
                        color: 'var(--color-heading)',
                        marginTop: '12px',
                        fontSize: '0.9rem',
                      }}
                    >
                      {item.label}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        color: 'var(--color-muted)',
                        fontSize: '0.75rem',
                        marginTop: '4px',
                      }}
                    >
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Save */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '4px',
            }}
          >
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '0.94rem',
                minWidth: '190px',
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  {t('profile.saveChanges')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
