import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const Fitness = () => {
  const exercises = [
    { title: 'Laser Pointer Jagd', mins: 15, cals: 30, desc: 'Fördert Sprints und schnelle Richtungswechsel.' },
    { title: 'Spielen mit der Angel', mins: 20, cals: 45, desc: 'Perfekt für Sprünge und Koordination.' },
    { title: 'Clicker-Training', mins: 10, cals: 15, desc: 'Mentale Auslastung und leichte Bewegung.' }
  ];

  return (
    <AnimatedPage>
      <h1>Fitness & Übungen</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Animierte Fitness-Routinen für eine aktive Katze.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {exercises.map((ex, i) => (
          <motion.div 
            key={i} 
            className="card"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <h3>{ex.title}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{ex.desc}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
              <span>⏱ {ex.mins} Min.</span>
              <span>🔥 ~{ex.cals} kcal</span>
            </div>
            
            {/* Animated Demo Box */}
            <div style={{ marginTop: '1.5rem', background: 'var(--bg-color)', height: '100px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <motion.div 
                animate={{ x: [-60, 60, -60], y: [0, -30, 0] }} 
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ width: '20px', height: '20px', background: 'var(--accent-primary)', borderRadius: '50%' }} 
              />
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};
export default Fitness;
