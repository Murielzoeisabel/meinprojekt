import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const Recipes = () => {
  const recipes = [
    { title: 'Hühnchen-Gemüse-Mix', type: 'Hauptmahlzeit', prep: '20 Min', ingredients: ['100g Hühnerbrust', 'Möhrenpüree', 'Taurin Suppl.'] },
    { title: 'Thunfisch-Happen', type: 'Snack', prep: '10 Min', ingredients: ['Thunfisch (im eign. Saft)', '1 Ei', 'Haferflocken'] },
    { title: 'Rinder-Power-Topf', type: 'Hauptmahlzeit', prep: '30 Min', ingredients: ['Rinderhack', 'Zucchini', 'Lachsöl'] },
    { title: 'Lachs-Schmaus', type: 'Hauptmahlzeit', prep: '15 Min', ingredients: ['Lachsfilet (frisch)', 'Spinat', 'Prise Katzenminze'] },
    { title: 'Kürbis-Puten-Diät', type: 'Hauptmahlzeit', prep: '25 Min', ingredients: ['Putenbrust', 'Kürbispüree', 'Mineralstoff-Zusatz'] },
    { title: 'Hüttenkäse-Leckerli', type: 'Snack', prep: '5 Min', ingredients: ['1 EL Hüttenkäse', 'Eigelb', 'Geriebene Karotte'] },
    { title: 'Rinderbrühe-Jelly', type: 'Snack (kühlend)', prep: '45 Min', ingredients: ['Ungewürzte Rinderbrühe', 'Tierische Gelatine', 'Rindfleischfetzen'] }
  ];

  return (
    <AnimatedPage>
      <h1>Gesunde Rezepte</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Erweiterte Ernährungspläne und Rezepte zum Selberkochen. Gut zum Abnehmen!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {recipes.map((rec, i) => (
          <motion.div 
            key={i} 
            className="card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <span style={{ fontSize: '0.8rem', background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '8px' }}>{rec.type}</span>
            <h3 style={{ marginTop: '0.8rem' }}>{rec.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Zubereitung: {rec.prep}</p>
            
            <h5 style={{ marginTop: '1rem' }}>Zutaten:</h5>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {rec.ingredients.map((ing, idx) => <li key={idx} style={{ marginBottom: '4px', fontSize: '0.95rem' }}>{ing}</li>)}
            </ul>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};
export default Recipes;
