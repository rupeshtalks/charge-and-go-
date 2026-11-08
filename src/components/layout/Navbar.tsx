
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Zap, Menu, X, User, ArrowRight, Bell, Globe, Sun, Moon,
  LogOut, LayoutDashboard, Shield, Truck, ChevronDown,
  Bot, Sparkles, Send, Loader2, MessageCircle,
} from 'lucide-react';

import { api } from '../../services/api';
import { UserRole, InAppNotification, UserProfile } from '../../types';
import {
  useAppPreferences,
  SupportedLanguage,
} from '../../context/AppPreferencesContext';
import { NotificationCenterDrawer } from '../notifications/NotificationCenterDrawer';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const getWelcomeMessage = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Hello, Admin! 👋 I can help you with bookings, drivers, operations and platform management. What would you like to know?';

    case 'driver':
      return 'Hello, Driver! 👋 I can help you with assigned jobs, pickups, charging updates and deliveries. How can I assist you?';

    default:
      return 'Hello! 👋 Welcome to Charge & Go. I’m your AI assistant. Ask me about EV charging, bookings, pricing, or how our service works.';
  }
};

export const Navbar: React.FC = () => {
  const { t, language, setLanguage, setTheme, resolvedTheme } =
    useAppPreferences();

  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');

  // AI assistant state
  const [aiOpen, setAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage('customer'),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load user and notification data
  const loadData = async () => {
    try {
      const [currentUser, currentNotifications] = await Promise.all([
        api.getCurrentUser(),
        api.getNotifications(),
      ]);

      setUser(currentUser);
      setCurrentRole(currentUser.role);
      setNotifications(currentNotifications);
    } catch (error) {
      console.error('Unable to load navbar data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Change chatbot greeting when portal changes
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${currentRole}`,
        role: 'assistant',
        content: getWelcomeMessage(currentRole),
      },
    ]);

    setChatError('');
    setChatInput('');
  }, [currentRole]);

  // Automatically scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (!aiOpen) return;

    const timer = window.setTimeout(() => {
      chatInputRef.current?.focus();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [aiOpen]);

  // Portal switching
  const handleRoleSwitch = async (role: UserRole) => {
    try {
      await api.switchRole(role);
      setCurrentRole(role);
      await loadData();
      setProfileDropdownOpen(false);
    } catch (error) {
      console.error('Unable to switch role:', error);
    }
  };

  // Notification actions
  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(await api.getNotifications());
    } catch (error) {
      console.error('Unable to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const all = await api.getNotifications();

      for (const notification of all) {
        if (!notification.read) {
          await api.markNotificationRead(notification.id);
        }
      }

      setNotifications(await api.getNotifications());
    } catch (error) {
      console.error('Unable to mark all notifications as read:', error);
    }
  };

  // Send chatbot message with explicit text or from input
  const executeSendMessage = async (textToSend: string) => {
    const question = textToSend.trim();
    if (!question || chatLoading) return;

    const previousMessages = messages;
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setChatInput('');
    setChatError('');
    setChatLoading(true);

    try {
      // Pass Bearer token if user is signed in
      const authHeader: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const storedToken =
        localStorage.getItem('sb-access-token') ||
        localStorage.getItem('supabase.auth.token') ||
        sessionStorage.getItem('sb-access-token');

      if (storedToken) {
        authHeader['Authorization'] = `Bearer ${storedToken}`;
      }

      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          message: question,
        }),
      });

      if (!response.ok) {
        throw new Error(`Assistant request failed (${response.status})`);
      }

      const data = await response.json();

      const answer =
        data.reply ||
        data.answer ||
        data.message ||
        'I received your message, but could not generate a response. Please try again.';

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: answer,
        },
      ]);
    } catch (error) {
      console.error('AI assistant error:', error);
      setChatError(
        'I could not connect to the AI service. Please verify the backend is running.',
      );
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    await executeSendMessage(chatInput);
  };

  const handleSendDirectMessage = (question: string) => {
    executeSendMessage(question);
  };

  const handleSuggestion = (question: string) => {
    executeSendMessage(question);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dashboardPath =
    currentRole === 'admin'
      ? '/admin'
      : currentRole === 'driver'
        ? '/driver'
        : '/customer';

  const isAtDashboard = location.pathname === dashboardPath;

  const navLinks = [
    { label: t('nav.howItWorks'), to: '/how-it-works' },
    { label: t('nav.pricing'), to: '/pricing' },
    { label: t('nav.coverage'), to: '/coverage' },
    { label: t('nav.faq'), to: '/faq' },
  ];

  return (
    <>
      <header className={`cng-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="cng-nav-inner">

          {/* BRAND */}
          <Link to="/" className="cng-brand" title="Return to homepage">
            <span className="cng-brand-icon">
              <Zap size={22} fill="white" strokeWidth={2.3} />
            </span>

            <span className="cng-brand-copy">
              <span className="cng-brand-name">
                CHARGE<span>&</span>GO
              </span>
              <span className="cng-brand-tagline">
                YOUR EV CHARGED. YOUR TIME SAVED.
              </span>
            </span>
          </Link>

          {/* MAIN NAVIGATION */}
          <nav className="cng-main-nav">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`cng-nav-link ${location.pathname === link.to ? 'active' : ''
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="cng-nav-actions">

            <Link
              to={dashboardPath}
              className={`cng-garage ${isAtDashboard ? 'active' : ''}`}
              title={`Open your ${currentRole} dashboard`}
            >
              {currentRole === 'admin' ? (
                <Shield size={16} />
              ) : currentRole === 'driver' ? (
                <Truck size={16} />
              ) : (
                <LayoutDashboard size={16} />
              )}

              <span>
                {currentRole === 'admin'
                  ? 'Admin Suite'
                  : currentRole === 'driver'
                    ? 'Driver Ops'
                    : 'My Garage'}
              </span>
            </Link>

            {/* LANGUAGE */}
            <div className="cng-language">
              <Globe size={15} />

              {(['en', 'te', 'hi'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={language === lang ? 'selected' : ''}
                  onClick={() => setLanguage(lang)}
                  aria-label={`Switch language to ${lang}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* THEME */}
            <button
              type="button"
              className="cng-icon-btn"
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
              title="Toggle appearance"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* AI ASSISTANT - AVAILABLE IN ALL THREE PORTALS */}
            <button
              type="button"
              className={`cng-ai-trigger ${aiOpen ? 'active' : ''}`}
              onClick={() => setAiOpen(true)}
              aria-label="Open AI assistant"
              aria-expanded={aiOpen}
            >
              <span className="cng-ai-icon">
                <Sparkles size={16} />
              </span>
              <span className="cng-ai-label">AI Assistant</span>
              <span className="cng-ai-status" />
            </button>

            {/* NOTIFICATIONS */}
            <button
              type="button"
              className="cng-icon-btn cng-notification-btn"
              onClick={() => setNotifDrawerOpen(true)}
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="cng-notification-count">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* PROFILE */}
            <div className="cng-profile-wrapper">
              <button
                type="button"
                className={`cng-profile ${profileDropdownOpen ? 'active' : ''
                  }`}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
              >
                <span className="cng-avatar">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profile" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </span>

                <span className="cng-profile-role">{currentRole}</span>
                <ChevronDown size={14} className="cng-profile-chevron" />
              </button>

              {profileDropdownOpen && (
                <>
                  <button
                    className="cng-dropdown-backdrop"
                    aria-label="Close profile menu"
                    onClick={() => setProfileDropdownOpen(false)}
                  />

                  <div className="cng-profile-dropdown">
                    <div className="cng-profile-info">
                      <strong>{user?.name || 'Welcome'}</strong>
                      <span>{user?.email}</span>
                    </div>

                    <div className="cng-role-section">
                      <span className="cng-dropdown-label">
                        ACTIVE PORTAL
                      </span>

                      <div className="cng-role-options">
                        {(['customer', 'driver', 'admin'] as UserRole[]).map(
                          (role) => (
                            <button
                              key={role}
                              type="button"
                              className={
                                currentRole === role ? 'selected' : ''
                              }
                              onClick={() => handleRoleSwitch(role)}
                            >
                              {role}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <Link
                      to={dashboardPath}
                      className="cng-dropdown-link"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="cng-dropdown-link"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User size={17} />
                      {t('nav.myProfile')}
                    </Link>

                    <Link
                      to="/notifications"
                      className="cng-dropdown-link"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Bell size={17} />
                      {t('nav.notifications')}
                    </Link>

                    <Link
                      to="/login"
                      className="cng-dropdown-link logout"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <LogOut size={17} />
                      {t('nav.signOut')}
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* BOOKING CTA */}
            <Link to="/book" className="cng-book-btn">
              <span>{t('nav.bookCharge')}</span>
              <ArrowRight size={17} />
            </Link>

            {/* MOBILE MENU */}
            <button
              type="button"
              className="cng-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div className="cng-mobile-menu">
            <Link to={dashboardPath} className="cng-mobile-dashboard">
              <LayoutDashboard size={18} />
              Go to {currentRole.toUpperCase()} Dashboard
            </Link>

            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="cng-mobile-link">
                {link.label}
                <ArrowRight size={15} />
              </Link>
            ))}

            <button
              type="button"
              className="cng-mobile-ai"
              onClick={() => {
                setAiOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <Sparkles size={17} />
              Chat with AI Assistant
              <ArrowRight size={15} />
            </button>

            <Link to="/profile" className="cng-mobile-link">
              {t('nav.myProfile')}
              <ArrowRight size={15} />
            </Link>

            <Link to="/notifications" className="cng-mobile-link">
              Notifications
              <span>{unreadCount}</span>
            </Link>

            <div className="cng-mobile-languages">
              <Globe size={16} />

              {(['en', 'te', 'hi'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={language === lang ? 'selected' : ''}
                  onClick={() => setLanguage(lang)}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <Link to="/book" className="cng-book-btn mobile-book">
              {t('nav.bookCharge')}
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </header>

      {/* AI CHAT DRAWER - SHARED BY CUSTOMER, DRIVER AND ADMIN */}
      <div
        className={`cng-ai-overlay ${aiOpen ? 'visible' : ''}`}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setAiOpen(false);
          }
        }}
        aria-hidden={!aiOpen}
      >
        <aside
          className={`cng-ai-drawer ${aiOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Charge and Go AI assistant"
        >
          <div className="cng-ai-header">
            <div className="cng-ai-heading">
              <div className="cng-ai-avatar">
                <Bot size={23} />
                <span />
              </div>

              <div>
                <h3>Charge & Go AI</h3>
                <p>
                  <span className="cng-online-dot" />
                  {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}{' '}
                  Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              className="cng-ai-close"
              onClick={() => setAiOpen(false)}
              aria-label="Close AI assistant"
            >
              <X size={21} />
            </button>
          </div>

          <div className="cng-ai-intro">
            <span className="cng-ai-intro-icon">
              <Sparkles size={19} />
            </span>
            <div>
              <strong>How can I help you today?</strong>
              <p>
                Ask me anything about Charge &amp; Go and EV charging.
              </p>
            </div>
          </div>

          {/* FREQUENTLY ASKED QUESTIONS CHIPS AT TOP OF CHAT */}
          <div className="cng-top-faq-chips">
            <div className="cng-faq-chips-scroll">
              {[
                'How does Charge & Go work?',
                'How can I book an EV pickup?',
                'What are the pickup and delivery charges?',
                'How much does EV charging cost?',
                'How can I track my vehicle?',
                'How long does charging take?',
                'How can I cancel my booking?',
                'How do I contact customer support?',
                'Which EV models are supported?',
                'How can I check my booking status?',
              ].map((faq) => (
                <button
                  key={faq}
                  type="button"
                  className="cng-faq-chip-btn"
                  onClick={() => handleSendDirectMessage(faq)}
                  disabled={chatLoading}
                >
                  <Sparkles size={11} className="cng-chip-icon" />
                  <span>{faq}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cng-chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`cng-chat-row ${message.role === 'user' ? 'user-message' : 'bot-message'
                  }`}
              >
                {message.role === 'assistant' && (
                  <div className="cng-message-avatar">
                    <Bot size={16} />
                  </div>
                )}

                <div className="cng-message-bubble">
                  {message.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="cng-chat-row bot-message">
                <div className="cng-message-avatar">
                  <Bot size={16} />
                </div>

                <div className="cng-message-bubble cng-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {chatError && (
              <div className="cng-chat-error">
                {chatError}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="cng-suggestions">
              <span>TRY ASKING</span>

              {[
                'How does Charge & Go work?',
                'What is the booking fee?',
                'How can I book EV charging?',
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSuggestion(question)}
                >
                  <MessageCircle size={14} />
                  {question}
                </button>
              ))}
            </div>
          )}

          <form className="cng-chat-form" onSubmit={handleSendMessage}>
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask me anything..."
              aria-label="Type your question"
              disabled={chatLoading}
            />

            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              aria-label="Send message"
            >
              {chatLoading ? (
                <Loader2 size={19} className="cng-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

          <p className="cng-ai-disclaimer">
            AI responses may need verification. For account-specific support,
            contact our team.
          </p>
        </aside>
      </div>

      {/* NOTIFICATION DRAWER */}
      <NotificationCenterDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* COMPLETE NAVBAR AND CHATBOT STYLES */}
      <style>{`
        .cng-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 82px;
          background: rgba(18,3,24,.88);
          backdrop-filter: blur(22px);
          border-bottom: 1px solid rgba(226,190,235,.10);
          transition: .3s ease;
        }

        .cng-header.is-scrolled {
          height: 72px;
          background: rgba(18,3,24,.97);
          box-shadow: 0 12px 35px rgba(0,0,0,.2);
        }

        .cng-nav-inner {
          width: min(1440px, calc(100% - 64px));
          height: 100%;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .cng-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          flex-shrink: 0;
          color: white;
          text-decoration: none;
        }

        .cng-brand-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(145deg,#FF7A24,#FF5100);
          box-shadow: 0 5px 22px rgba(255,91,10,.3);
        }

        .cng-brand-copy {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .cng-brand-name {
          color: white;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: -1.2px;
          line-height: 1;
          white-space: nowrap;
        }

        .cng-brand-name span {
          color: #DDA8EC;
          margin: 0 2px;
        }

        .cng-brand-tagline {
          color: #C8B4D1;
          font-size: 8px;
          letter-spacing: 1.2px;
          font-weight: 700;
          white-space: nowrap;
        }

        .cng-main-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(14px,1.7vw,27px);
          flex: 1;
        }

        .cng-nav-link {
          position: relative;
          padding: 9px 0;
          color: #D5C5DD;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        .cng-nav-link:hover,
        .cng-nav-link.active {
          color: white;
        }

        .cng-nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #DDA8EC;
          transition: width .25s ease;
        }

        .cng-nav-link:hover::after,
        .cng-nav-link.active::after {
          width: 100%;
        }

        .cng-nav-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }

        .cng-garage,
        .cng-language,
        .cng-icon-btn,
        .cng-profile {
          height: 39px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(224,190,236,.19);
          background: rgba(255,255,255,.055);
          color: white;
        }

        .cng-garage {
          padding: 0 12px;
          gap: 8px;
          border-radius: 999px;
          color: #F5EAF9;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .cng-garage svg,
        .cng-language > svg {
          color: #DDA8EC;
        }

        .cng-garage:hover,
        .cng-garage.active {
          background: rgba(221,168,236,.14);
          border-color: rgba(221,168,236,.55);
        }

        .cng-language {
          gap: 3px;
          padding: 0 5px;
          border-radius: 999px;
        }

        .cng-language button,
        .cng-mobile-languages button {
          height: 26px;
          min-width: 27px;
          padding: 0 6px;
          border: none;
          border-radius: 999px;
          color: #DCCDE4;
          background: transparent;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .cng-language button.selected,
        .cng-mobile-languages button.selected {
          color: #24102B;
          background: #DDA8EC;
        }

        .cng-icon-btn {
          position: relative;
          width: 39px;
          min-width: 39px;
          border-radius: 50%;
          color: #F2DDF9;
          cursor: pointer;
          transition: .2s ease;
        }

        .cng-icon-btn:hover {
          background: rgba(221,168,236,.15);
          border-color: rgba(221,168,236,.55);
          transform: translateY(-2px);
        }

        .cng-notification-count {
          position: absolute;
          top: -5px;
          right: -4px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          display: grid;
          place-items: center;
          border: 2px solid #18051F;
          border-radius: 20px;
          background: #FF650D;
          color: white;
          font-size: 9px;
          font-weight: 900;
        }

        /* AI TRIGGER */

        .cng-ai-trigger {
          position: relative;
          height: 39px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid rgba(221,168,236,.38);
          border-radius: 999px;
          background: linear-gradient(110deg,rgba(221,168,236,.17),rgba(255,101,13,.10));
          color: #F8EAFD;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          transition: .25s ease;
        }

        .cng-ai-trigger:hover,
        .cng-ai-trigger.active {
          transform: translateY(-2px);
          border-color: #DDA8EC;
          background: rgba(221,168,236,.22);
          box-shadow: 0 0 22px rgba(221,168,236,.17);
        }

        .cng-ai-icon {
          display: grid;
          place-items: center;
          color: #E9B9F6;
        }

        .cng-ai-status,
        .cng-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #54D99B;
          box-shadow: 0 0 9px rgba(84,217,155,.7);
        }

        /* PROFILE */

        .cng-profile-wrapper {
          position: relative;
        }

        .cng-profile {
          padding: 3px 10px 3px 4px;
          gap: 8px;
          border-radius: 999px;
          cursor: pointer;
        }

        .cng-profile:hover,
        .cng-profile.active {
          background: rgba(221,168,236,.14);
          border-color: rgba(221,168,236,.48);
        }

        .cng-avatar {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
          background: linear-gradient(135deg,#E6B8F1,#B77DCE);
          color: #24102B;
          font-size: 12px;
          font-weight: 900;
        }

        .cng-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cng-profile-role {
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .cng-profile-chevron {
          color: #BFA9C9;
          transition: transform .2s ease;
        }

        .cng-profile.active .cng-profile-chevron {
          transform: rotate(180deg);
        }

        .cng-dropdown-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1001;
          background: transparent;
          border: 0;
        }

        .cng-profile-dropdown {
          position: absolute;
          z-index: 1002;
          top: calc(100% + 14px);
          right: 0;
          width: 270px;
          padding: 9px;
          border: 1px solid rgba(221,168,236,.23);
          border-radius: 17px;
          background: #1D0B27;
          color: white;
          box-shadow: 0 22px 60px rgba(0,0,0,.42);
          animation: cngDropIn .2s ease both;
        }

        .cng-profile-info,
        .cng-role-section {
          padding: 13px 12px;
          border-bottom: 1px solid rgba(255,255,255,.09);
        }

        .cng-profile-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .cng-profile-info strong {
          font-size: 14px;
        }

        .cng-profile-info span {
          overflow: hidden;
          color: #BDAAC8;
          font-size: 11px;
          text-overflow: ellipsis;
        }

        .cng-dropdown-label {
          display: block;
          margin-bottom: 9px;
          color: #A994B5;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .cng-role-options {
          display: flex;
          gap: 5px;
        }

        .cng-role-options button {
          flex: 1;
          padding: 8px 3px;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 7px;
          background: rgba(255,255,255,.04);
          color: #CDBDD6;
          font-size: 10px;
          font-weight: 700;
          text-transform: capitalize;
          cursor: pointer;
        }

        .cng-role-options button.selected {
          border-color: #DDA8EC;
          background: rgba(221,168,236,.14);
          color: #E9C4F3;
        }

        .cng-dropdown-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 12px;
          border-radius: 8px;
          color: #E5D8EB;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
        }

        .cng-dropdown-link:hover {
          background: rgba(221,168,236,.10);
          color: white;
        }

        .cng-dropdown-link svg {
          color: #DDA8EC;
        }

        .cng-dropdown-link.logout {
          margin-top: 5px;
          border-top: 1px solid rgba(255,255,255,.09);
          color: #FF8A80;
        }

        .cng-dropdown-link.logout svg {
          color: #FF8A80;
        }

        /* BOOKING BUTTON */

        .cng-book-btn {
          min-height: 43px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 999px;
          background: linear-gradient(110deg,#FF7A18,#FF5900);
          color: white;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 5px 20px rgba(255,91,0,.22);
          transition: .22s ease;
        }

        .cng-book-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 9px 28px rgba(255,91,0,.38);
        }

        .cng-mobile-toggle,
        .cng-mobile-menu {
          display: none;
        }

        /* CHAT OVERLAY */

        .cng-ai-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(5,2,9,.55);
          backdrop-filter: blur(3px);
          opacity: 0;
          visibility: hidden;
          transition: opacity .3s ease, visibility .3s ease;
        }

        .cng-ai-overlay.visible {
          opacity: 1;
          visibility: visible;
        }

        .cng-ai-drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: min(440px,100%);
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #16091E;
          border-left: 1px solid rgba(221,168,236,.2);
          box-shadow: -20px 0 70px rgba(0,0,0,.35);
          transform: translateX(105%);
          transition: transform .38s cubic-bezier(.22,1,.36,1);
        }

        .cng-ai-drawer.open {
          transform: translateX(0);
        }

        .cng-ai-header {
          min-height: 78px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(221,168,236,.14);
          background: rgba(255,255,255,.025);
        }

        .cng-ai-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cng-ai-avatar {
          position: relative;
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(221,168,236,.4);
          border-radius: 14px;
          background: linear-gradient(145deg,#42204F,#25112F);
          color: #E9B9F6;
        }

        .cng-ai-avatar span {
          position: absolute;
          right: -3px;
          bottom: -3px;
          width: 11px;
          height: 11px;
          border: 2px solid #16091E;
          border-radius: 50%;
          background: #54D99B;
        }

        .cng-ai-heading h3 {
          margin: 0 0 5px;
          color: #FFF8FF;
          font-size: 16px;
          font-weight: 800;
        }

        .cng-ai-heading p {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #BBA9C4;
          font-size: 11px;
        }

        .cng-online-dot {
          display: inline-block;
        }

        .cng-ai-close {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(221,168,236,.18);
          border-radius: 50%;
          background: rgba(255,255,255,.05);
          color: #EADCF0;
          cursor: pointer;
          transition: .2s ease;
        }

        .cng-ai-close:hover {
          background: rgba(255,101,13,.16);
          color: white;
          transform: rotate(90deg);
        }

        .cng-ai-intro {
          margin: 18px 18px 10px;
          padding: 15px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(221,168,236,.17);
          border-radius: 14px;
          background: linear-gradient(120deg,rgba(221,168,236,.10),rgba(255,101,13,.055));
        }

        .cng-ai-intro-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 10px;
          background: rgba(221,168,236,.15);
          color: #E9B9F6;
        }

        .cng-ai-intro strong {
          color: #FFF6FF;
          font-size: 13px;
        }

        .cng-ai-intro p {
          margin: 5px 0 0;
          color: #BBA9C4;
          font-size: 11px;
          line-height: 1.5;
        }

        .cng-top-faq-chips {
          padding: 8px 16px 12px;
          border-bottom: 1px solid rgba(221,168,236,.12);
          background: rgba(26,10,33,.5);
        }

        .cng-faq-chips-scroll {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
          scrollbar-color: rgba(221,168,236,.25) transparent;
        }

        .cng-faq-chips-scroll::-webkit-scrollbar {
          height: 4px;
        }

        .cng-faq-chips-scroll::-webkit-scrollbar-thumb {
          background: rgba(221,168,236,.25);
          border-radius: 999px;
        }

        .cng-faq-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          border-radius: 999px;
          border: 1px solid rgba(221,168,236,.22);
          background: rgba(221,168,236,.08);
          color: #EBD9F3;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all .18s ease;
          flex-shrink: 0;
        }

        .cng-faq-chip-btn:hover {
          border-color: #FF7A18;
          background: rgba(255,101,13,.15);
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        .cng-chip-icon {
          color: #FF7A18;
          flex-shrink: 0;
        }

        .cng-chat-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 12px 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          scrollbar-width: thin;
          scrollbar-color: #55365F transparent;
        }

        .cng-chat-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: cngMessageIn .25s ease both;
        }

        .cng-chat-row.user-message {
          justify-content: flex-end;
        }

        .cng-message-avatar {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid rgba(221,168,236,.25);
          border-radius: 9px;
          background: #2A1534;
          color: #E9B9F6;
        }

        .cng-message-bubble {
          max-width: 82%;
          padding: 12px 14px;
          border: 1px solid rgba(221,168,236,.14);
          border-radius: 14px 14px 14px 4px;
          background: #24132D;
          color: #F0E5F4;
          font-size: 12px;
          line-height: 1.65;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .user-message .cng-message-bubble {
          border-color: rgba(255,122,24,.28);
          border-radius: 14px 14px 4px 14px;
          background: linear-gradient(130deg,#A94213,#80320F);
          color: white;
        }

        .cng-typing {
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 55px;
          padding: 15px;
        }

        .cng-typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #DDA8EC;
          animation: cngTyping .8s infinite alternate;
        }

        .cng-typing span:nth-child(2) {
          animation-delay: .2s;
        }

        .cng-typing span:nth-child(3) {
          animation-delay: .4s;
        }

        .cng-chat-error {
          margin: 0 0 5px 36px;
          padding: 10px 12px;
          border: 1px solid rgba(255,110,110,.25);
          border-radius: 10px;
          background: rgba(255,80,80,.08);
          color: #FFB6B6;
          font-size: 11px;
          line-height: 1.5;
        }

        .cng-suggestions {
          padding: 8px 18px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cng-suggestions > span {
          color: #927E9C;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .cng-suggestions button {
          width: 100%;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid rgba(221,168,236,.17);
          border-radius: 10px;
          background: rgba(255,255,255,.035);
          color: #E2D4E9;
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          transition: .2s ease;
        }

        .cng-suggestions button:hover {
          border-color: #DDA8EC;
          background: rgba(221,168,236,.1);
        }

        .cng-suggestions button svg {
          color: #DDA8EC;
          flex-shrink: 0;
        }

        .cng-chat-form {
          margin: 0 17px;
          padding: 7px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(221,168,236,.25);
          border-radius: 14px;
          background: #24132D;
          transition: border-color .2s ease;
        }

        .cng-chat-form:focus-within {
          border-color: #DDA8EC;
          box-shadow: 0 0 0 3px rgba(221,168,236,.08);
        }

        .cng-chat-form input {
          flex: 1;
          min-width: 0;
          padding: 10px 8px;
          border: 0;
          outline: 0;
          background: transparent;
          color: white;
          font: inherit;
          font-size: 12px;
        }

        .cng-chat-form input::placeholder {
          color: #927E9C;
        }

        .cng-chat-form button {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(135deg,#FF7A18,#FF5900);
          color: white;
          cursor: pointer;
          transition: .2s ease;
        }

        .cng-chat-form button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255,91,0,.3);
        }

        .cng-chat-form button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .cng-ai-disclaimer {
          margin: 10px 18px 15px;
          color: #806F89;
          font-size: 9px;
          line-height: 1.5;
          text-align: center;
        }

        .cng-spin {
          animation: cngSpin 1s linear infinite;
        }

        @keyframes cngSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes cngTyping {
          to { opacity: .3; transform: translateY(-4px); }
        }

        @keyframes cngMessageIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cngDropIn {
          from { opacity: 0; transform: translateY(-7px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */

        @media (max-width: 1250px) {
          .cng-nav-inner {
            width: calc(100% - 36px);
            gap: 12px;
          }

          .cng-brand-name { font-size: 20px; }
          .cng-brand-tagline { font-size: 7px; }
          .cng-main-nav { gap: 13px; }
          .cng-nav-link { font-size: 12px; }
          .cng-nav-actions { gap: 5px; }
          .cng-garage { padding: 0 9px; }
          .cng-ai-trigger { padding: 0 9px; }
          .cng-book-btn { padding: 0 12px; }
        }

        @media (max-width: 1050px) {
          .cng-main-nav { display: none; }

          .cng-nav-inner {
            width: calc(100% - 40px);
          }

          .cng-nav-actions {
            margin-left: auto;
          }

          .cng-mobile-toggle {
            width: 40px;
            height: 40px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(221,168,236,.2);
            border-radius: 50%;
            background: rgba(255,255,255,.06);
            color: white;
            cursor: pointer;
          }

          .cng-mobile-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 18px 22px 23px;
            border-top: 1px solid rgba(221,168,236,.15);
            background: rgba(24,6,32,.98);
            box-shadow: 0 20px 35px rgba(0,0,0,.25);
          }

          .cng-mobile-dashboard,
          .cng-mobile-ai {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 13px;
            border: 1px solid rgba(221,168,236,.23);
            border-radius: 10px;
            background: rgba(221,168,236,.09);
            color: #E9C4F3;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
          }

          .cng-mobile-ai {
            width: 100%;
            justify-content: flex-start;
            cursor: pointer;
          }

          .cng-mobile-ai svg:last-child {
            margin-left: auto;
          }

          .cng-mobile-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 5px;
            border-bottom: 1px solid rgba(255,255,255,.07);
            color: #E6D8ED;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
          }

          .cng-mobile-languages {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            color: #DDA8EC;
          }

          .mobile-book {
            width: 100%;
            margin-top: 5px;
          }
        }

        @media (max-width: 640px) {
          .cng-header { height: 70px; }
          .cng-header.is-scrolled { height: 66px; }

          .cng-nav-inner {
            width: calc(100% - 26px);
            gap: 7px;
          }

          .cng-brand { gap: 8px; }

          .cng-brand-icon {
            width: 37px;
            height: 37px;
            border-radius: 11px;
          }

          .cng-brand-name { font-size: 18px; }
          .cng-brand-tagline {
            font-size: 6px;
            letter-spacing: .5px;
          }

          .cng-nav-actions { gap: 5px; }

          .cng-garage,
          .cng-language,
          .cng-profile {
            display: none;
          }

          .cng-icon-btn {
            width: 34px;
            min-width: 34px;
            height: 34px;
          }

          .cng-ai-trigger {
            width: 36px;
            height: 36px;
            justify-content: center;
            padding: 0;
          }

          .cng-ai-label,
          .cng-ai-status {
            display: none;
          }

          .cng-book-btn:not(.mobile-book) {
            min-height: 36px;
            padding: 0 9px;
            gap: 5px;
            font-size: 10px;
          }

          .cng-mobile-toggle {
            width: 35px;
            height: 35px;
          }

          .cng-ai-drawer { width: 100%; }
          .cng-ai-header { min-height: 70px; }
        }

        @media (max-width: 390px) {
          .cng-brand-tagline { display: none; }
          .cng-brand-name { font-size: 16px; }

          .cng-book-btn:not(.mobile-book) {
            padding: 0 8px;
            font-size: 9px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cng-header *,
          .cng-ai-overlay *,
          .cng-ai-overlay {
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
