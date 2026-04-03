import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CatList from './pages/CatList';
import Stats from './pages/Stats';
import Fitness from './pages/Fitness';
import Recipes from './pages/Recipes';
import Calories from './pages/Calories';
import HealthCheck from './pages/HealthCheck';
import Science from './pages/Science';
import Settings from './pages/Settings';

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cats" element={<CatList />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/calories" element={<Calories />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/science" element={<Science />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
