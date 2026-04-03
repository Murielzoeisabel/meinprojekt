import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const Recipes = () => {
  const recipes = [
    { title: 'Hühnchen-Gemüse-Mix', type: 'Hauptmahlzeit', prep: '20 Min', ingredients: ['Hühnerbrust', 'Möhren', 'Taurin Suppl.'] },
    { title: 'Thunfisch-Happen', type: 'Snack', prep: '10 Min', ingredients: ['Thunfisch (im eign. Saft)', 'Ei', 'Haferflocken'] },
    { title: 'Rinder-Power-Topf', type: 'Hauptmahlzeit', prep: '30 Min', ingredients: ['Rinderhack', 'Zucchini', 'Öl'] }
  ];

  return (
    <AnimatedPage>
      <h1>Gesunde Rezepte</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Ernährungspläne und Rezepte zum Selberkochen.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {recipes.map((rec, i) => (
          <motion.div 
            key={i} 
            className="card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
          >
            <span style={{ fontSize: '0.8rem', background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '8px' }}>{rec.type}</span>
            <h3 style={{ marginTop: '0.8rem' }}>{rec.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Zubereitung: {rec.prep}</p>
            
            <h5 style={{ marginTop: '1rem' }}>Zutaten:</h5>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {rec.ingredients.map((ing, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{ing}</li>)}
            </ul>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};
export default Recipes;
