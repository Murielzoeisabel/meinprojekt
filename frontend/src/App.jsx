import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';

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
const FoodAnalyzer = lazy(() => import('./pages/FoodAnalyzer'));
const Calories = lazy(() => import('./pages/Calories'));
const Community = lazy(() => import('./pages/Community'));

const PageLoader = () => (
  <div style={{ padding: '2rem 0', color: 'var(--text-secondary)', fontWeight: 600 }}>
    Seite wird geladen...
  </div>
);

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cats" element={<CatList />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/meal-templates" element={<MealTemplates />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/food-analyzer" element={<FoodAnalyzer />} />
            <Route path="/calories" element={<Calories />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/cat-management" element={<Navigate to="/cats" replace />} />
            <Route path="/community" element={<Community />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
