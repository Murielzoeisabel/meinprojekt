import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { getCurrentUser } from './services/api';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const CatList = lazy(() => import('./pages/CatList'));
const Stats = lazy(() => import('./pages/Stats'));
const Fitness = lazy(() => import('./pages/Fitness'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const HealthCheck = lazy(() => import('./pages/HealthCheck'));
const Profile = lazy(() => import('./pages/Profile'));
const Legal = lazy(() => import('./pages/Legal'));
const Settings = lazy(() => import('./pages/Settings'));
const MealTemplates = lazy(() => import('./pages/MealTemplates'));
const Recipes = lazy(() => import('./pages/Recipes'));
const Calories = lazy(() => import('./pages/Calories'));
const FoodAnalyzer = lazy(() => import('./pages/FoodAnalyzer'));
const Community = lazy(() => import('./pages/Community'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

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
      {!isAuthPage && isAuthenticated && <Navbar />}
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
            />
            <Route path="/" element={<RequireAuth isAuthenticated={isAuthenticated}><Dashboard /></RequireAuth>} />
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
            <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
