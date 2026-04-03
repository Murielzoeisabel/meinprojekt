import { NavLink } from 'react-router-dom';
import { Home, Cat, Activity, Settings as SettingsIcon, HeartPulse, ChefHat, Flame, BookOpen } from 'lucide-react';
import './Navbar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/cats', label: 'Katzen', icon: <Cat size={20} /> },
  { path: '/stats', label: 'Statistik', icon: <Activity size={20} /> },
  { path: '/fitness', label: 'Fitness', icon: <HeartPulse size={20} /> },
  { path: '/recipes', label: 'Rezepte', icon: <ChefHat size={20} /> },
  { path: '/calories', label: 'Kalorien', icon: <Flame size={20} /> },
  { path: '/health', label: 'Gesundheits-Check', icon: <Activity size={20} /> },
  { path: '/science', label: 'Wissenschaft', icon: <BookOpen size={20} /> },
  { path: '/settings', label: 'Einstellungen', icon: <SettingsIcon size={20} /> },
];

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Cat size={28} color="var(--accent-primary)" />
        <h2>Cat Slim Down</h2>
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
