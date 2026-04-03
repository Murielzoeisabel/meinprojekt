import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MealTemplates = () => {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');

  useEffect(() => {
    getCats().then(data => {
      setCats(data);
      if (data.length > 0) setSelectedCatId(data[0].id.toString());
    });
  }, []);

  const selectedCat = cats.find(cat => cat.id.toString() === selectedCatId);

  // Grundumsatz berechnen (RER = Resting Energy Requirement)
  const calculateBasalMetabolism = (weight) => {
    if (!weight || Number.isNaN(weight)) return 0;
    return Math.round(70 * Math.pow(weight, 0.75));
  };

  const basalMetabolism = calculateBasalMetabolism(selectedCat?.currentWeight || selectedCat?.idealWeight);

  // Futtermengen basierend auf Kalorienzielen berechnen
  // Nassfutter: ~85 kcal per 100g, Trockenfutter: ~380 kcal per 100g
  const calculateFoodAmount = (calorieTarget) => {
    const wetFoodCalPerGram = 0.85; // kcal per gram
    return Math.round(calorieTarget / wetFoodCalPerGram / 100) * 10; // Rund auf 10g
  };

  const phase1Calories = basalMetabolism; // Keine Kürzung
  const phase2Calories = Math.round(basalMetabolism * 0.9); // 10% Defizit

  const morningAmount1 = Math.round(calculateFoodAmount(phase1Calories) * 0.4); // 40% morgens
  const eveningAmount1 = Math.round(calculateFoodAmount(phase1Calories) * 0.4); // 40% abends
  const snackAmount1 = Math.round(calculateFoodAmount(phase1Calories) * 0.2); // 20% Snacks

  const morningAmount2 = Math.round(calculateFoodAmount(phase2Calories) * 0.35); // 35% morgens
  const eveningAmount2 = Math.round(calculateFoodAmount(phase2Calories) * 0.35); // 35% abends
  const snackAmount2 = Math.round(calculateFoodAmount(phase2Calories) * 0.3); // 30% Spiele/Snacks

  return (
    <AnimatedPage>
      <button
        type="button"
        onClick={() => navigate('/nutrition')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700 }}
      >
        <ArrowLeft size={18} /> Zurück zur Ernährungsauswahl
      </button>

      <h1>🍽️ Vorlagen: Ernährungspläne</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Strukturierte Wochendiäten für verschiedene Abnehmphasen – personalisiert für deine Katze.
      </p>

      {/* Cat Selector */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Katze auswählen:</h3>
        <select
          className="input-field"
          style={{ width: '250px', margin: 0 }}
          value={selectedCatId}
          onChange={(e) => setSelectedCatId(e.target.value)}
        >
          {cats.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name} ({cat.currentWeight || cat.idealWeight}kg)</option>
          ))}
        </select>
      </div>

      {/* Nutrition Info */}
      {selectedCat && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <motion.div className="card" whileHover={{ scale: 1.05 }} style={{ textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Gewicht</h4>
            <h2 style={{ margin: '0.5rem 0 0 0' }}>{selectedCat.currentWeight || selectedCat.idealWeight} kg</h2>
          </motion.div>
          <motion.div className="card" whileHover={{ scale: 1.05 }} style={{ textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Grundumsatz</h4>
            <h2 style={{ margin: '0.5rem 0 0 0' }}>{basalMetabolism} kcal</h2>
          </motion.div>
          <motion.div className="card" whileHover={{ scale: 1.05 }} style={{ textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Phase 2 Ziel</h4>
            <h2 style={{ margin: '0.5rem 0 0 0', color: 'var(--accent-primary)' }}>{phase2Calories} kcal</h2>
          </motion.div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ color: 'var(--accent-primary)' }}>Phase 1: Sanfter Einstieg</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Geeignet für die ersten 2-4 Wochen. Erhaltungskalorienanzahl ({phase1Calories} kcal/Tag).
          </p>
          <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid var(--accent-primary)' }}>
            <strong style={{ color: 'var(--accent-primary)' }}>Täglich: {Math.round(calculateFoodAmount(phase1Calories))}g Nassfutter verteilt</strong>
          </div>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Morgens:</strong> {morningAmount1}g hochwertiges Nassfutter (proteinreich)</li>
            <li><strong>Mittags:</strong> Kein Trockenfutter stehen lassen! Jagdspiel mit Angel (10-15 Min)</li>
            <li><strong>Abends:</strong> {eveningAmount1}g Nassfutter + 1 TL lauwarmes Wasser für Sättigungsgefühl</li>
            <li><strong>Optional (Snacks):</strong> {snackAmount1}g verteilt über Fummelbretter oder kleine Treats</li>
          </ul>
        </motion.div>
        
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ color: '#f59e0b' }}>Phase 2: Aktive Gewichtsabnahme</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            10% Kaloriendefizit ({phase2Calories} kcal/Tag). Nur anwenden, wenn Phase 1 etabliert ist.
          </p>
          <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid #f59e0b' }}>
            <strong style={{ color: '#f59e0b' }}>Täglich: {Math.round(calculateFoodAmount(phase2Calories))}g Nassfutter verteilt + Aktivitäten</strong>
          </div>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Morgens:</strong> {morningAmount2}g Nassfutter (getreidefrei)</li>
            <li><strong>Vormittags:</strong> Jagdspiel mit Laser-Pointer (15 Min)</li>
            <li><strong>Mittags:</strong> Kein Futter! Verstecken & Suchen Spiel</li>
            <li><strong>Abends:</strong> {eveningAmount2}g Nassfutter</li>
            <li><strong>Täglich Extras ({snackAmount2}g):</strong> Trockenfleisch-Snacks oder Fummelbrett als Belohnung nach Training</li>
          </ul>
        </motion.div>
      </div>

      {/* Tipps Box */}
      <motion.div
        style={{
          marginTop: '2rem',
          background: 'var(--surface-color)',
          border: '2px solid var(--accent-primary)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'var(--text-secondary)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 style={{ color: 'var(--accent-primary)', marginTop: 0 }}>💡 Fütterungstipps</h3>
        <ul style={{ margin: '1rem 0', paddingLeft: '1.5rem' }}>
          <li>Nutze Fummelbretter, um die Fütterung länger zu gestalten</li>
          <li>Wechsel zwischen Nassfutter und Spielzeiten ab</li>
          <li>Immer frisches Wasser zur Verfügung stellen</li>
          <li>Kombiniere Ernährung mit Fitness-Aktivitäten für beste Ergebnisse</li>
          <li>Wiege die Katze regelmäßig und passe die Portionen entsprechend an</li>
        </ul>
      </motion.div>
    </AnimatedPage>
  );
};

export default MealTemplates;
