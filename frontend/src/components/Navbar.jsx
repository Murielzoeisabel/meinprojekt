import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Cat, Activity, Settings as SettingsIcon, HeartPulse, User, Shield, Moon, Sun, Utensils, MessageCircle, FileText, ChefHat, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/cats', label: 'Katzen', icon: <Cat size={20} /> },
  { path: '/stats', label: 'Statistik', icon: <Activity size={20} /> },
  { path: '/fitness', label: 'Fitness', icon: <HeartPulse size={20} /> },
  {
    path: '/nutrition',
    label: 'Ernährung',
    icon: <Utensils size={20} />,
    children: [
      { path: '/meal-templates', label: 'Ernährungspläne', icon: <FileText size={16} /> },
      { path: '/recipes', label: 'Rezepte', icon: <ChefHat size={16} /> },
      { path: '/calories', label: 'Kalorientracker', icon: <Flame size={16} /> },
    ],
  },
  { path: '/health', label: 'Gesundheits-Check', icon: <Activity size={20} /> },
  { path: '/community', label: 'Community', icon: <MessageCircle size={20} /> },
  { path: '/profile', label: 'Profil', icon: <User size={20} /> },
  { path: '/legal', label: 'Rechtliches', icon: <Shield size={20} /> },
  { path: '/settings', label: 'Einstellungen', icon: <SettingsIcon size={20} /> },
];

const Navbar = () => {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nutritionRoutes = ['/nutrition', '/meal-templates', '/recipes', '/calories'];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!nutritionRoutes.includes(location.pathname)) {
      setIsNutritionOpen(false);
    }
  }, [location.pathname]);

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
        {navItems.map((item) => {
          const nutritionGroupActive = item.path === '/nutrition'
            && (location.pathname === '/nutrition' || (item.children || []).some((child) => child.path === location.pathname));

          const isNutritionItem = item.path === '/nutrition';

          return (
            <div key={item.path} className="nav-item-group">
              {isNutritionItem ? (
                <button
                  type="button"
                  className={`nav-link nav-parent ${(nutritionGroupActive || isNutritionOpen) ? 'active' : ''}`}
                  onClick={() => {
                    const nextOpen = !isNutritionOpen;
                    setIsNutritionOpen(nextOpen);
                    if (nextOpen) {
                      navigate('/nutrition');
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              )}

              {item.children && (
                <div className={`nav-sub-links ${(isNutritionOpen || nutritionGroupActive) ? 'open' : ''}`}>
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) => `nav-sublink ${isActive ? 'active' : ''}`}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
