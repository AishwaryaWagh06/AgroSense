// Supabase-based authentication
;(function(){
  // Supabase configuration
  const SUPABASE_URL = 'https://usosuikkxfazjerelzel.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzb3N1aWtreGZhemplcmVsemVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjQwNjYsImV4cCI6MjA3NDUwMDA2Nn0.jreWXDGbAjfFHn2XcMuMl897mKQSsWwgbYOYDlIQ3Uc';
  
  // Initialize Supabase client (only if Supabase library is loaded)
  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
  
  // Session management
  const SESSION_KEY = 'AS_SESSION_V1';
  const NOTIF_KEY = 'AS_NOTIFS_V1';
  const EMAIL_KEY = 'AS_EMAIL_V1';

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ 
      user: user, 
      ts: Date.now() 
    }));
  }

  function getSession() {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return null;
      return JSON.parse(session);
    } catch {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    } else {
      alert(message);
    }
  }

  function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      errorDiv.style.color = 'var(--success, #10b981)';
      errorDiv.style.background = 'var(--success-bg, #d1fae5)';
      setTimeout(() => {
        errorDiv.style.display = 'none';
        errorDiv.style.color = 'var(--error)';
        errorDiv.style.background = 'var(--error-bg)';
      }, 5000);
    } else {
      alert(message);
    }
  }

  async function register(email, password, name) {
    showError('Registration is disabled. Please use the provided login credentials.');
  }

  async function login(email, password) {
    if (!email || !password) {
      showError('Please enter email and password.');
      return;
    }

    const FIXED_EMAIL = 'kamankarvinayak1@gmail.com';
    const FIXED_PASSWORD = 'Vinayak123';

    if (email === FIXED_EMAIL && password === FIXED_PASSWORD) {
      setSession({ email: FIXED_EMAIL });
      window.location.href = 'dashboard.html';
      return;
    }

    showError('Invalid email/password');
  }

  async function logout() {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
      window.location.href = 'login.html';
    }
  }

  function requireAuth() {
    const session = getSession();
    if (!session) {
      window.location.replace('login.html');
      return false;
    }
    return true;
  }

  // Check auth state on page load
  async function checkAuthState() {
    // In fixed-credential mode, rely solely on localStorage session
    const s = getSession();
    if (!s) clearSession();
  }

  // Listen for auth state changes (only if Supabase is available)
  if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        clearSession();
      }
    });
  }

  // Simple per-user data namespace helpers (keeping for compatibility)
  function getUserStore(username) {
    const key = `AS_USERDATA_${username}`;
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  }

  function setUserStore(username, obj) {
    const key = `AS_USERDATA_${username}`;
    localStorage.setItem(key, JSON.stringify(obj || {}));
  }

  // Notification bell UI
  function ensureNotifBell() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    if (document.getElementById('notifBell')) return;
    
    const bell = document.createElement('button');
    bell.id = 'notifBell';
    bell.title = 'Notifications';
    bell.textContent = '🔔';
    bell.style.cssText = 'background:transparent;border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:8px;cursor:pointer;margin-left:8px';
    
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.style.cssText = 'background:transparent;border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:8px;cursor:pointer;margin-left:8px';
    logoutBtn.addEventListener('click', logout);

    const rightWrap = document.createElement('div');
    rightWrap.style.display = 'flex';
    rightWrap.style.gap = '8px';
    rightWrap.style.alignItems = 'center';
    
    const theme = document.getElementById('themeToggle');
    if (theme && theme.parentElement) {
      theme.parentElement.replaceChild(theme.cloneNode(true), theme);
    }
    const newTheme = document.getElementById('themeToggle');
    rightWrap.appendChild(newTheme);
    rightWrap.appendChild(bell);
    rightWrap.appendChild(logoutBtn);
    header.appendChild(rightWrap);

    bell.addEventListener('click', () => {
      const list = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      if (!list.length) {
        alert('No notifications');
        return;
      }
      alert(list.map(n => `• ${n.message} (${new Date(n.ts).toLocaleString()})`).join('\n'));
    });
  }

  function pushNotification(message) {
    const list = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
    list.unshift({ message, ts: Date.now() });
    while (list.length > 10) list.pop();
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  }

  // Simple i18n toggle (English/Hindi) for static texts with data-i18n keys
  const STRINGS = {
    en: { rainAlert: 'High chance of rain tomorrow', openAssistant: 'Open Assistant' },
    hi: { rainAlert: 'कल बारिश की उच्च संभावना', openAssistant: 'सहायक खोलें' }
  };

  function setLanguage(lang) {
    localStorage.setItem('AS_LANG', lang);
    document.documentElement.setAttribute('lang', lang === 'hi' ? 'hi' : 'en');
    document.querySelectorAll('[data-i18n]')?.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const pack = STRINGS[lang] || STRINGS.en;
      if (pack[key]) el.textContent = pack[key];
    });
  }

  function initLangToggle() {
    if (document.getElementById('langToggle')) return;
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    const btn = document.createElement('button');
    btn.id = 'langToggle';
    btn.textContent = 'EN/HI';
    btn.style.cssText = 'background:transparent;border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:8px;cursor:pointer;margin-left:8px';
    btn.addEventListener('click', () => {
      const current = localStorage.getItem('AS_LANG') || 'en';
      setLanguage(current === 'en' ? 'hi' : 'en');
    });
    header.appendChild(btn);
    setLanguage(localStorage.getItem('AS_LANG') || 'en');
  }

  // Email notifications via EmailJS (client-side)
  const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID = 'service_demo_agrosense';
  const EMAILJS_TEMPLATE_ID = 'template_hourly_alert';

  async function sendEmailNotification(toEmail, subject, message) {
    if (!toEmail) return;
    
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: { to_email: toEmail, subject, message }
    };
    
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.warn('EmailJS error', await res.text());
      }
    } catch (e) {
      console.warn('Email send failed', e);
    }
  }

  function startHourlyEmailTimer() {
    const defaultEmail = localStorage.getItem(EMAIL_KEY) || 'farmer.demo@example.com';
    const lastSent = Number(localStorage.getItem('AS_LAST_EMAIL_TS') || 0);
    const now = Date.now();
    const message = 'High chance of rain tomorrow. Consider adjusting irrigation schedule.';
    
    if (now - lastSent > 60 * 60 * 1000) {
      sendEmailNotification(defaultEmail, 'AgroSense Alert', message);
      localStorage.setItem('AS_LAST_EMAIL_TS', String(now));
    }
    
    setInterval(() => {
      const ts = Date.now();
      sendEmailNotification(defaultEmail, 'AgroSense Hourly Alert', message);
      localStorage.setItem('AS_LAST_EMAIL_TS', String(ts));
    }, 60 * 60 * 1000);
  }

  async function init() {
    // Check auth state first
    await checkAuthState();
    
    // Attach header controls
    ensureNotifBell();
    initLangToggle();
    
    // Demo: push a rain alert into bell
    pushNotification('High chance of rain tomorrow');
    
    // Start hourly email timer
    startHourlyEmailTimer();
  }

  // Export functions
  window.Auth = { 
    register, 
    login, 
    requireAuth, 
    logout, 
    setLanguage,
    getUserStore,
    setUserStore,
    pushNotification
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();