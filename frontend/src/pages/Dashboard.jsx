import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getWeights } from '../services/api';
import { motion } from 'framer-motion';
import NoCatsFeedback from '../components/NoCatsFeedback';
import './DashboardStats.css';

void motion;

const DrawnCatAnimation = () => (
  <motion.svg
    width="280"
    height="170"
    viewBox="0 0 280 170"
    role="img"
    aria-label="Gezeichnete, animierte Katze"
    style={{ display: 'block' }}
  >
    <motion.g
      animate={{ scaleX: [0.98, 1.02, 0.98] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '140px 145px' }}
    >
      <ellipse
        cx="140"
        cy="145"
        rx="88"
        ry="12"
        fill="rgba(63, 77, 46, 0.16)"
      />
    </motion.g>

    <motion.g
      animate={{ y: [0, -1.2, 0], x: [0, 1.2, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.path
        d="M206 98 C244 83, 250 52, 226 38"
        stroke="#8F683F"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        animate={{ rotate: [-5, 6, -5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '205px 98px' }}
      />

      <ellipse cx="146" cy="102" rx="70" ry="38" fill="#C79257" stroke="#2F2B28" strokeWidth="2" />
      <ellipse cx="146" cy="95" rx="52" ry="24" fill="#B77A41" opacity="0.88" />

      <motion.g
        animate={{ y: [0, -0.8, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '88px 78px' }}
      >
        <circle cx="88" cy="78" r="28" fill="#C79257" stroke="#2F2B28" strokeWidth="2" />
        <polygon points="69,60 62,35 80,52" fill="#C79257" stroke="#2F2B28" strokeWidth="2" />
        <polygon points="104,60 111,35 93,52" fill="#C79257" stroke="#2F2B28" strokeWidth="2" />
        <polygon points="70,56 66,43 76,51" fill="#F6C7B8" />
        <polygon points="103,56 107,43 97,51" fill="#F6C7B8" />
        <ellipse cx="80" cy="77" rx="3" ry="5" fill="#2F2B28" />
        <ellipse cx="95" cy="77" rx="3" ry="5" fill="#2F2B28" />
        <path d="M84 86 Q88 89 92 86" stroke="#2F2B28" strokeWidth="2" fill="none" strokeLinecap="round" />
        <polygon points="86,82 88,85 90,82" fill="#F5A4B6" stroke="#2F2B28" strokeWidth="0.8" />
      </motion.g>

      <motion.g
        animate={{ rotate: [-9, 9, -9] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '110px 126px' }}
      >
        <path d="M110 126 C106 136, 106 144, 112 152" stroke="#8F683F" strokeWidth="10" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g
        animate={{ rotate: [9, -9, 9] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '136px 127px' }}
      >
        <path d="M136 127 C132 137, 132 145, 138 153" stroke="#8F683F" strokeWidth="10" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g
        animate={{ rotate: [8, -8, 8] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        style={{ transformOrigin: '160px 127px' }}
      >
        <path d="M160 127 C156 137, 156 145, 162 153" stroke="#8F683F" strokeWidth="10" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        style={{ transformOrigin: '184px 126px' }}
      >
        <path d="M184 126 C180 136, 180 144, 186 152" stroke="#8F683F" strokeWidth="10" strokeLinecap="round" fill="none" />
      </motion.g>
    </motion.g>
  </motion.svg>
);

const Dashboard = () => {
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getCats()
      .then(data => {
        setErrorMsg('');
        setCats(data);
        if (data.length > 0) {
          setSelectedCatId(data[0].id.toString());
        }
      })
      .catch(() => setErrorMsg('Katzen konnten nicht geladen werden.'));
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getWeights(selectedCatId)
        .then(data => {
          setErrorMsg('');
          setWeightHistory(data);
        })
        .catch(() => setErrorMsg('Gewichtsdaten konnten nicht geladen werden.'));
    }
  }, [selectedCatId]);

  const selectedCat = cats.find(c => c.id.toString() === selectedCatId);
  const currentWeight = selectedCat?.currentWeight !== null && selectedCat?.currentWeight !== undefined
    ? selectedCat.currentWeight.toFixed(2)
    : '-';
  const targetWeight = selectedCat?.idealWeight !== null && selectedCat?.idealWeight !== undefined
    ? selectedCat.idealWeight.toFixed(2)
    : '-';
  
  const avgWeight = weightHistory.length > 0 
    ? (weightHistory.reduce((acc, curr) => acc + curr.weight, 0) / weightHistory.length).toFixed(2)
    : '-';

  const moodPool = [
    { mood: 'Verspielt', icon: '😻', hint: '5 Minuten Extra-Spielzeit mit Federangel.' },
    { mood: 'Kuschelmodus', icon: '😺', hint: 'Ruhige Streicheleinheit und danach ein Mini-Spiel.' },
    { mood: 'Jagdlaune', icon: '🐯', hint: 'Heute passen Suchspiele mit Snacks perfekt.' },
    { mood: 'Zen-Katze', icon: '🐈', hint: 'Sanfte Aktivierung mit langsamen Bewegungsreizen.' },
  ];

  const moodToday = moodPool[new Date().getDay() % moodPool.length];

  const sortedWeightHistory = [...weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const weightTrendTip = (() => {
    if (sortedWeightHistory.length < 2) return null;

    const latest = sortedWeightHistory.at(-1);
    const previous = sortedWeightHistory.at(-2);
    const latestWeight = Number(latest?.weight);
    const previousWeight = Number(previous?.weight);

    if (Number.isNaN(latestWeight) || Number.isNaN(previousWeight)) return null;

    const gainKg = latestWeight - previousWeight;
    if (gainKg <= 0) return null;

    const gainedGrams = Math.round(gainKg * 1000);
    const latestDate = new Date(latest.date);
    const previousDate = new Date(previous.date);
    const diffInDays = Math.max(1, Math.round((latestDate - previousDate) / (1000 * 60 * 60 * 24)));

    const shortWindowDays = 7;
    const smallGainThresholdGrams = 120;
    const fluctuationRange = 'ca. 1-3%';
    const fluctuationExample = 'etwa 40-120 g bei einer 4-kg-Katze';

    const thirdLatest = sortedWeightHistory.at(-3);
    const hasConsistentRise = thirdLatest
      ? latestWeight > previousWeight && previousWeight > Number(thirdLatest.weight)
      : false;

    if (diffInDays <= shortWindowDays && gainedGrams <= smallGainThresholdGrams) {
      return {
        variant: 'analysis-neutral',
        title: 'Kleine Zunahme - erstmal ruhig bleiben',
        text: `In einer Woche und bei nur ${gainedGrams} g Plus kann das noch normal sein. Das Gewicht schwankt im Tagesverlauf durch Futter, Wasser und Verdauung oft um ${fluctuationRange} (${fluctuationExample}). Am besten immer auf derselben Waage und zur gleichen Uhrzeit einmal pro Woche wiegen und den Verlauf 1-2 Wochen weiter beobachten.`
      };
    }

    if (hasConsistentRise) {
      return {
        variant: 'analysis-warning',
        title: 'Gewicht steigt gerade kontinuierlich',
        text: `Es gab zuletzt wiederholt Zunahmen (aktuell +${gainedGrams} g). Bitte einmal pro Woche zur gleichen Uhrzeit wiegen, Futterportionen und Leckerlis prüfen und mehr Aktivität einbauen. Wenn der Trend anhält, tierärztlich abklären lassen.`
      };
    }

    return {
      variant: 'analysis-warning',
      title: 'Leichte Gewichtszunahme erkannt',
      text: `Zuletzt ging das Gewicht um ${gainedGrams} g nach oben. Das kann kurzfristig noch im normalen Tagesbereich liegen, deshalb am besten einmal pro Woche und möglichst immer zur gleichen Uhrzeit wiegen. Wenn die Kurve weiter steigt, Futtermenge anpassen und bei Bedarf tierärztlich Rücksprache halten.`
    };
  })();

  return (
    <AnimatedPage>
      {errorMsg && (
        <div className="card alert-error">
          {errorMsg}
        </div>
      )}
      <div className="card dashboard-hero">
        <div>
          <h1 className="dashboard-title">
            Cat Slim Down <span className="floating-comic">👋</span>
          </h1>
          <p className="dashboard-subtitle">Willkommen zurück! Bereit für ein bisschen Training?</p>
        </div>
        <div className="dashboard-hero-illustration">
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <DrawnCatAnimation />
          </motion.div>
        </div>
      </div>

      {cats.length === 0 ? (
        <NoCatsFeedback />
      ) : (
        <div className="card selector-card">
          <div className="selector-profile-preview" aria-hidden={!selectedCat?.photo}>
            {selectedCat?.photo ? (
              <img
                src={selectedCat.photo}
                alt={selectedCat.name ? `Profilbild von ${selectedCat.name}` : 'Profilbild der ausgewählten Katze'}
                className="selector-profile-image"
              />
            ) : (
              <div className="selector-profile-placeholder">🐱</div>
            )}
          </div>

          <div className="selector-controls">
            <h3>Katze auswählen:</h3>
            <select 
              className="input-field selector-input"
              value={selectedCatId} 
              onChange={(e) => setSelectedCatId(e.target.value)}
            >
              {cats.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {cats.length > 0 && (
        <>
          {selectedCat && (
            <div className="kpi-grid">
              <motion.div className="card card-hover-lift kpi-card" whileHover={{ scale: 1.015 }}>
                <h4>Aktuelles Gewicht</h4>
                <h2>{currentWeight} kg</h2>
              </motion.div>
              <motion.div className="card card-hover-lift kpi-card" whileHover={{ scale: 1.015 }}>
                <h4>Zielgewicht</h4>
                <h2>{targetWeight} kg</h2>
              </motion.div>
              <motion.div className="card card-hover-lift kpi-card" whileHover={{ scale: 1.015 }}>
                <h4>Durchschnitts-Gewicht</h4>
                <h2>{avgWeight} kg</h2>
              </motion.div>
            </div>
          )}

          <div className="card mood-card card-hover-lift">
            <div className="mood-head">
              <h3>Mood-Miau</h3>
              <span className="mood-icon" aria-hidden="true">{moodToday.icon}</span>
            </div>
            <p className="mood-value">{moodToday.mood}</p>
            <p className="mood-hint">{moodToday.hint}</p>
          </div>

          {weightTrendTip && (
            <div className={`card analysis-card ${weightTrendTip.variant}`}>
              <h3>{weightTrendTip.title}</h3>
              <p>{weightTrendTip.text}</p>
            </div>
          )}

          <div className="paw-separator" aria-hidden="true">🐾 🐾 🐾</div>

          <div className="card form-card">
            <Link to="/stats" className="btn-primary btn-block">Zur Statistik & Gewicht eintragen</Link>
          </div>
        </>
      )}
    </AnimatedPage>
  );
};

export default Dashboard;
