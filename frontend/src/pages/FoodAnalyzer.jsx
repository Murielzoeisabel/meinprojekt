import { useState } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { Camera, UploadCloud, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

void motion;

const FoodAnalyzer = () => {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = () => {
    setAnalyzing(true);
    setResult(null);

    // Mock Analyse Dauert
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        healthy: false,
        ingredients: ['Getreide', 'Zucker', 'Fleischnebenerzeugnisse (4%)', 'Karamell'],
        verdict: "Aufgrund des enthaltenen Zuckers und des geringen Fleischanteils ist dieses Futter nicht für eine Gewichtsreduktion empfehlenswert."
      });
    }, 2500);
  };

  return (
    <AnimatedPage>
      <button
        type="button"
        onClick={() => navigate('/nutrition')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700 }}
      >
        <ArrowLeft size={18} /> Zurück zur Ernährungsauswahl
      </button>

      <h1>Futter-Scanner</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Fotografiere die Inhaltsstoffe einer Dose und lass sie von der KI analysieren.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', border: '2px dashed var(--border-color)' }}>
          <UploadCloud size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Foto hochladen</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Lade ein Bild der Zusammensetzungs-Liste hoch.
          </p>
          <button className="btn-primary" onClick={handleUpload} disabled={analyzing}>
            <Camera size={20} /> {analyzing ? 'Analysiert...' : 'Etikett analysieren'}
          </button>
        </div>

        <div className="card" style={{ minHeight: '300px' }}>
          <h3>Analyse-Ergebnis</h3>
          {analyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ marginBottom: '1rem' }}>
                <Camera size={40} color="var(--accent-primary)" />
              </motion.div>
              <p>KI verarbeitet das Bild...</p>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem', color: result.healthy ? 'var(--accent-primary)' : 'var(--danger)' }}>
                {result.healthy ? <CheckCircle /> : <AlertTriangle />} 
                <strong style={{ fontSize: '1.2rem' }}>{result.healthy ? 'Empfehlenswert' : 'Nicht optimal'}</strong>
              </div>
              
              <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Erkannte Inhaltsstoffe:</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.ingredients.map((ing, i) => (
                  <span key={i} style={{ background: 'var(--bg-color)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>{ing}</span>
                ))}
              </div>

              <p style={{ marginTop: '1.5rem', lineHeight: '1.5', padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
                {result.verdict}
              </p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--text-secondary)' }}>
              Lade ein Bild hoch, um das Ergebnis hier zu sehen.
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};
export default FoodAnalyzer;
