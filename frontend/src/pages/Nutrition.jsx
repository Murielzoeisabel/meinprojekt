import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { ChefHat, Flame, FileText, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const Nutrition = () => {
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Ernährungspläne', description: 'Wöchentliche Vorlagen für eine Diät', path: '/meal-templates', icon: <FileText size={40} color="var(--accent-primary)" /> },
    { title: 'Rezepte', description: 'Gesunde Rezepte zum Selberkochen', path: '/recipes', icon: <ChefHat size={40} color="var(--accent-primary)" /> },
    { title: 'Futter-Analyse', description: 'Foto vom Etikett zur KI-Analyse hochladen', path: '/food-analyzer', icon: <Camera size={40} color="var(--accent-primary)" /> },
    { title: 'Kalorientracker', description: 'Tägliche Mahlzeiten eintragen & zählen', path: '/calories', icon: <Flame size={40} color="var(--accent-primary)" /> }
  ];

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyItems: 'center' }}>
        <h1>Ernährung</h1>
        <span className="wink-cat" style={{ fontSize: '2.5rem' }}></span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Alles rund um das gesunde Futter deiner Samtpfote gebündelt an einem Ort.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {menuItems.map((item, index) => (
          <motion.div 
            className="card" 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5, boxShadow: '0 20px 40px rgba(82,102,0,0.12)' }}
            onClick={() => navigate(item.path)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}
          >
            <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '50%', border: '2px solid var(--accent-primary)' }}>
              {item.icon}
            </div>
            <h3 style={{ margin: 0 }}>{item.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{item.description}</p>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};

export default Nutrition;
