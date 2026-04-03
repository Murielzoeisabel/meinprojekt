import { NavLink } from 'react-router-dom';
import { Home, Cat, Activity, Settings as SettingsIcon, HeartPulse, User, Shield, Moon, Sun, Utensils, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/cats', label: 'Katzen', icon: <Cat size={20} /> },
  { path: '/stats', label: 'Statistik', icon: <Activity size={20} /> },
  { path: '/fitness', label: 'Fitness', icon: <HeartPulse size={20} /> },
  { path: '/nutrition', label: 'Ernährung', icon: <Utensils size={20} /> },
  { path: '/health', label: 'Gesundheits-Check', icon: <Activity size={20} /> },
  { path: '/community', label: 'Community', icon: <MessageCircle size={20} /> },
  { path: '/profile', label: 'Profil', icon: <User size={20} /> },
  { path: '/legal', label: 'Rechtliches', icon: <Shield size={20} /> },
  { path: '/settings', label: 'Einstellungen', icon: <SettingsIcon size={20} /> },
];

const Navbar = () => {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <nav className="navbar" style={{ overflowY: 'auto' }}>
      <div className="navbar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cat size={28} color="var(--accent-primary)" className="floating-comic" />
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Cat Slim Down</h2>
        </div>
        <button 
          onClick={toggleTheme} 
          style={{ background: 'var(--surface-color)', padding: '8px', borderRadius: '50%', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
          title={theme === 'light' ? "Zum Dark Mode wechseln" : "Zum Light Mode wechseln"}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
      <div className="nav-links">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
