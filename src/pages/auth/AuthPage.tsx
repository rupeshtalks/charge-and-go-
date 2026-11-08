import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Zap, Lock, Mail, User, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot-password';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(async () => {
      setLoading(false);
      if (mode === 'forgot-password') {
        setMsg('A reset link has been dispatched to your registered email.');
      } else {
        await api.switchRole('customer');
        navigate('/customer');
      }
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '90px',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        transition: 'background-color 0.25s ease',
      }}
    >
      <div
        className="cng-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
        }}
      >
        {/* Logo and title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--color-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 0 18px var(--color-orange-glow)',
            }}
          >
            <Zap size={24} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-heading)', margin: 0 }}>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Customer Account'}
            {mode === 'forgot-password' && 'Reset Your Password'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: '6px' }}>
            {mode === 'login' && 'Access your EV pickups, charging milestones, and invoices'}
            {mode === 'register' && 'Join the premier on-demand EV charging concierge'}
            {mode === 'forgot-password' && 'Enter your registered email to receive a recovery link'}
          </p>
        </div>

        {msg && (
          <div style={{ padding: '0.8rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', marginBottom: '1.2rem', textAlign: 'center', fontWeight: 600 }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '4px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-input-border)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-input-border)',
                    background: 'var(--color-input-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.4rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-input-border)',
                  background: 'var(--color-input-bg)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-heading)' }}>
                  Password
                </label>
                {mode === 'login' && (
                  <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--color-orange)', fontWeight: 700 }}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.4rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-input-border)',
                    background: 'var(--color-input-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}>
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Account' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
          {mode === 'login' ? (
            <div>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>
                Register here
              </Link>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
