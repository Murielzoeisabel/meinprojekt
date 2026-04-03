import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { ChefHat, Flame, FileText, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const Nutrition = () => {
  const navigate = useNavigate();
  const catAnimations = [
    { body: '#d89b5a', belly: '#f7d7b8', eye: '#1f2937', stripe: '#8b5a2b' },
    { body: '#9ca3af', belly: '#e5e7eb', eye: '#111827', stripe: '#4b5563' },
    { body: '#2f2f35', belly: '#d1d5db', eye: '#f9fafb', stripe: '#111827' },
    { body: '#f3e8cc', belly: '#fff7ed', eye: '#1f2937', stripe: '#c08457' }
  ];

  const AnimatedCat = ({ colors }) => (
    <motion.svg
      width="84"
      height="84"
      viewBox="0 0 100 100"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="50" cy="66" rx="26" ry="22" fill={colors.body} />
      <circle cx="50" cy="38" r="20" fill={colors.body} />
      <polygon points="33,20 28,4 40,14" fill={colors.body} />
      <polygon points="67,20 72,4 60,14" fill={colors.body} />
      <polygon points="33,18 31,7 38,13" fill={colors.belly} opacity="0.9" />
      <polygon points="67,18 69,7 62,13" fill={colors.belly} opacity="0.9" />
      <motion.path
        d="M 68 70 Q 90 60 80 40"
        stroke={colors.body}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        animate={{ rotate: [-15, 18, -15] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '68px 70px' }}
      />
      <circle cx="42" cy="36" r="3.8" fill={colors.eye} />
      <circle cx="58" cy="36" r="3.8" fill={colors.eye} />
      <path d="M 49 43 L 47 46 L 51 46 Z" fill="#f97393" />
      <path d="M 49 47 Q 46 50 43 50" stroke={colors.eye} strokeWidth="1.4" fill="none" />
      <path d="M 49 47 Q 52 50 55 50" stroke={colors.eye} strokeWidth="1.4" fill="none" />
      <line x1="32" y1="46" x2="18" y2="43" stroke={colors.stripe} strokeWidth="1.2" opacity="0.7" />
      <line x1="32" y1="49" x2="16" y2="49" stroke={colors.stripe} strokeWidth="1.2" opacity="0.7" />
      <line x1="68" y1="46" x2="82" y2="43" stroke={colors.stripe} strokeWidth="1.2" opacity="0.7" />
      <line x1="68" y1="49" x2="84" y2="49" stroke={colors.stripe} strokeWidth="1.2" opacity="0.7" />
    </motion.svg>
  );

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
            whileHover={{
              scale: 1.05,
              y: -5,
              boxShadow: '0 20px 40px rgba(16,185,129,0.18)',
              backgroundColor: 'rgba(16,185,129,0.08)',
              borderColor: 'rgba(16,185,129,0.35)'
            }}
            onClick={() => navigate(item.path)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', border: '1px solid var(--border-color)', transition: 'background-color 0.2s ease, border-color 0.2s ease' }}
          >
            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '1.5rem', borderRadius: '50%', border: '2px solid var(--accent-primary)' }}>
              {item.icon}
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '96px' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <AnimatedCat colors={catAnimations[index % catAnimations.length]} />
              </motion.div>
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
