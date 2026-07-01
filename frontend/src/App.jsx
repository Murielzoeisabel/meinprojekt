import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './shared/components/Navbar';
import { getCurrentUser, logoutUser } from './features/auth/auth.api';
import { Moon, Sun } from 'lucide-react';
import { checkAndTriggerReminder } from './utils/reminder';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const CatList = lazy(() => import('./features/cats/CatList'));
const Stats = lazy(() => import('./pages/Stats'));
const Fitness = lazy(() => import('./pages/Fitness'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const HealthCheck = lazy(() => import('./features/cats/HealthCheck'));
const Profile = lazy(() => import('./pages/Profile'));
const Legal = lazy(() => import('./pages/Legal'));
const Settings = lazy(() => import('./pages/Settings'));
const MealTemplates = lazy(() => import('./pages/MealTemplates'));
const Recipes = lazy(() => import('./pages/Recipes'));
const Calories = lazy(() => import('./pages/Calories'));
const FoodAnalyzer = lazy(() => import('./pages/FoodAnalyzer'));
const Community = lazy(() => import('./features/community/Community'));
const Login = lazy(() => import('./features/auth/Login'));
const Register = lazy(() => import('./features/auth/Register'));
const Landing = lazy(() => import('./pages/Landing'));

const PageLoader = () => (
  <div style={{ padding: '2rem 0', color: 'var(--text-secondary)', fontWeight: 600 }}>
    Seite wird geladen...
  </div>
);

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
};

const RequireAuth = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCheckLoading, setIsAuthCheckLoading] = useState(true);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAndTriggerReminder();
    const interval = setInterval(() => {
      checkAndTriggerReminder();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cat-slim-down-theme') || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('cat-slim-down-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setTheme(newTheme);
    window.dispatchEvent(new Event('theme-changed'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('cat-slim-down-theme') || 'light');
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      import('./utils/pushRegister').then(({ registerPushNotifications }) => {
        registerPushNotifications();
      }).catch(err => console.error('Failed to register push:', err));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        await getCurrentUser();
        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsAuthCheckLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isAuthCheckLoading) {
    return (
      <div className="app-container">
        <main id="main-content" className="main-content" tabIndex={-1}>
          <PageLoader />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">Zum Inhalt springen</a>
      <ScrollToTop />
      {!isAuthPage && isAuthenticated && <Navbar onLogout={handleLogout} />}
      {!isAuthenticated && (
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            type="button"
            title={theme === 'light' ? 'Zum Dunkelmodus wechseln' : 'Zum Hellmodus wechseln'}
            aria-label={theme === 'light' ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      )}
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
            />
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
            />
            <Route
              path="/dashboard"
              element={<RequireAuth isAuthenticated={isAuthenticated}><Dashboard /></RequireAuth>}
            />
            <Route path="/cats" element={<RequireAuth isAuthenticated={isAuthenticated}><CatList /></RequireAuth>} />
            <Route path="/stats" element={<RequireAuth isAuthenticated={isAuthenticated}><Stats /></RequireAuth>} />
            <Route path="/fitness" element={<RequireAuth isAuthenticated={isAuthenticated}><Fitness /></RequireAuth>} />
            <Route path="/nutrition" element={<RequireAuth isAuthenticated={isAuthenticated}><Nutrition /></RequireAuth>} />
            <Route path="/meal-templates" element={<RequireAuth isAuthenticated={isAuthenticated}><MealTemplates /></RequireAuth>} />
            <Route path="/recipes" element={<RequireAuth isAuthenticated={isAuthenticated}><Recipes /></RequireAuth>} />
            <Route path="/food-analyzer" element={<RequireAuth isAuthenticated={isAuthenticated}><FoodAnalyzer /></RequireAuth>} />
            <Route path="/calories" element={<RequireAuth isAuthenticated={isAuthenticated}><Calories /></RequireAuth>} />
            <Route path="/health" element={<RequireAuth isAuthenticated={isAuthenticated}><HealthCheck /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth isAuthenticated={isAuthenticated}><Profile /></RequireAuth>} />
            <Route path="/legal" element={<RequireAuth isAuthenticated={isAuthenticated}><Legal /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth isAuthenticated={isAuthenticated}><Settings /></RequireAuth>} />
            <Route path="/cat-management" element={<Navigate to="/cats" replace />} />
            <Route path="/community" element={<RequireAuth isAuthenticated={isAuthenticated}><Community /></RequireAuth>} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
