import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CatList from './pages/CatList';
import Stats from './pages/Stats';
import Fitness from './pages/Fitness';
import Nutrition from './pages/Nutrition';
import HealthCheck from './pages/HealthCheck';
import Profile from './pages/Profile';
import Legal from './pages/Legal';
import Settings from './pages/Settings';
import CatManagement from './pages/CatManagement';
import MealTemplates from './pages/MealTemplates';
import Recipes from './pages/Recipes';
import FoodAnalyzer from './pages/FoodAnalyzer';
import Calories from './pages/Calories';
import Community from './pages/Community';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
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
          <Route path="/cat-management" element={<CatManagement />} />
          <Route path="/community" element={<Community />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
