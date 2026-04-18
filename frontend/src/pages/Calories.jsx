import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getCalories, addCalories } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NoCatsFeedback from '../components/NoCatsFeedback';

const Calories = () => {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [inputConsumed, setInputConsumed] = useState('');
  const [inputBurned, setInputBurned] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedCat = cats.find(cat => cat.id.toString() === selectedCatId);

  const calculateBasalMetabolism = (weight) => {
    if (!weight || Number.isNaN(weight)) return 0;
    // RER (Resting Energy Requirement) as practical baseline for cats.
    return Math.round(70 * Math.pow(weight, 0.75));
  };

  const basalMetabolism = calculateBasalMetabolism(
    selectedCat?.currentWeight !== null && selectedCat?.currentWeight !== undefined
      ? selectedCat.currentWeight
      : selectedCat?.idealWeight
  );

  const totalConsumed = calorieHistory.reduce((sum, entry) => sum + Number(entry.consumed || 0), 0);
  const totalActiveBurned = calorieHistory.reduce((sum, entry) => sum + Number(entry.burned || 0), 0);
  const totalBasalBurned = calorieHistory.reduce((sum, entry) => sum + Number(entry.basalBurned ?? basalMetabolism ?? 0), 0);
  const totalNeed = totalBasalBurned + totalActiveBurned;
  const fulfilledNeed = Math.min(totalConsumed, totalNeed);
  const openNeed = Math.max(totalNeed - totalConsumed, 0);
  const netBalance = totalConsumed - totalNeed;
  const fulfillmentPercent = totalNeed > 0 ? Math.min(100, (fulfilledNeed / totalNeed) * 100) : 0;
  const consumedProgress = basalMetabolism > 0 ? Math.min(100, (totalConsumed / basalMetabolism) * 100) : 0;
  const burnedProgress = basalMetabolism > 0 ? Math.min(100, (totalActiveBurned / basalMetabolism) * 100) : 0;

  useEffect(() => {
    getCats()
      .then(data => {
        setErrorMsg('');
        setCats(data);
        if (data.length > 0) setSelectedCatId(data[0].id.toString());
      })
      .catch(() => setErrorMsg('Katzen konnten nicht geladen werden.'));
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getCalories(selectedCatId)
        .then(data => {
          setErrorMsg('');
          setCalorieHistory(data);
        })
        .catch(() => setErrorMsg('Kalorienhistorie konnte nicht geladen werden.'));
    }
  }, [selectedCatId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCatId) return;
    try {
      setErrorMsg('');
      await addCalories({
        catId: selectedCatId,
        consumed: inputConsumed,
        burned: inputBurned,
        basalBurned: basalMetabolism
      });
      const newData = await getCalories(selectedCatId);
      setCalorieHistory(newData);
      setInputConsumed('');
      setInputBurned('');
    } catch {
      setErrorMsg('Kalorien konnten nicht gespeichert werden.');
    }
  };

  return (
    <AnimatedPage>
      {errorMsg && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239, 68, 68, 0.45)', color: 'var(--danger)' }}>
          {errorMsg}
        </div>
      )}
      <button
        type="button"
        onClick={() => navigate('/nutrition')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700 }}
      >
        <ArrowLeft size={18} /> Zurück zur Ernährungsauswahl
      </button>

      <h1>Kalorien-Tracker</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Hier siehst du klar, wie viel deine Katze insgesamt braucht, wie viel davon schon durch Futter erfüllt ist und wie viel noch fehlt.</p>

      {cats.length === 0 ? (
        <NoCatsFeedback />
      ) : (
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Katze auswählen:</h3>
          <select className="input-field" value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} style={{ width: '250px', marginBottom: 0 }}>
            {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          {selectedCat && (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              {selectedCat.name} | Gewicht: {selectedCat.currentWeight !== null && selectedCat.currentWeight !== undefined ? selectedCat.currentWeight : selectedCat.idealWeight} kg | Grundumsatz: {basalMetabolism} kcal/Tag
            </p>
          )}
        </div>
      )}

      {cats.length > 0 && (
        <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gesamtbedarf</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{totalNeed} kcal</div>
          <div style={{ marginTop: '0.75rem', height: '10px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.12)', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--accent-primary)', borderRadius: '999px' }} />
          </div>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Grundumsatz plus Aktivität</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Schon erfüllt</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#22c55e' }}>{fulfilledNeed} kcal</div>
          <div style={{ marginTop: '0.75rem', height: '10px', borderRadius: '999px', background: 'rgba(34, 197, 94, 0.12)', overflow: 'hidden' }}>
            <div style={{ width: `${fulfillmentPercent}%`, height: '100%', background: '#22c55e', borderRadius: '999px' }} />
          </div>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Durch Futter bereits abgedeckt</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Noch offen</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f59e0b' }}>{openNeed} kcal</div>
          <div style={{ marginTop: '0.75rem', height: '10px', borderRadius: '999px', background: 'rgba(245, 158, 11, 0.12)', overflow: 'hidden' }}>
            <div style={{ width: `${totalNeed > 0 ? Math.min(100, (openNeed / totalNeed) * 100) : 0}%`, height: '100%', background: '#f59e0b', borderRadius: '999px' }} />
          </div>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Fehlt noch bis zum Gesamtbedarf</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Grundumsatz</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalBasalBurned} kcal</div>
          <div style={{ marginTop: '0.75rem', height: '10px', borderRadius: '999px', background: 'rgba(99, 102, 241, 0.12)', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: '#6366f1', borderRadius: '999px' }} />
          </div>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ruheenergie aus den Einträgen</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bilanz</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: netBalance >= 0 ? '#f59e0b' : 'var(--accent-primary)' }}>
            {netBalance >= 0 ? '+' : ''}{netBalance} kcal
          </div>
          <div style={{ marginTop: '0.75rem', height: '10px', borderRadius: '999px', background: 'rgba(245, 158, 11, 0.12)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.abs(netBalance) > 0 ? Math.min(Math.abs(netBalance), totalNeed || 1) / Math.max(1, totalNeed || 1) * 100 : 0)}%`, height: '100%', background: '#f59e0b', borderRadius: '999px' }} />
          </div>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Aufnahme minus Gesamtbedarf</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '2rem' }}>
        <div className="card" style={{ height: 'max-content' }}>
          <h3>Neuer Eintrag</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Aufgenommen (z.B. Futter, Leckerli)</label>
              <input type="number" className="input-field" value={inputConsumed} onChange={e => setInputConsumed(e.target.value)} placeholder="in kcal" style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Aktiv verbrannt (z.B. Spielen)</label>
              <input type="number" className="input-field" value={inputBurned} onChange={e => setInputBurned(e.target.value)} placeholder="in kcal" style={{ marginBottom: 0 }} />
            </div>
            <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.8rem 1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automatisch berechneter Grundumsatz</div>
              <div style={{ marginTop: '0.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>~{basalMetabolism} kcal / Tag</div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Eintragen</button>
          </form>
        </div>

        <div className="card" style={{ height: 'max-content' }}>
          <h3>Tagessicht</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
            Die Balken zeigen die aktuelle Energieaufnahme, den Grundumsatz und die zusätzliche Aktivität getrennt an.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gegessen</span>
                <strong>{totalConsumed} kcal</strong>
              </div>
              <div style={{ height: '14px', borderRadius: '999px', background: 'rgba(239, 68, 68, 0.12)', overflow: 'hidden' }}>
                <div style={{ width: `${consumedProgress}%`, height: '100%', background: '#ef4444', borderRadius: '999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Grundumsatz</span>
                <strong>{basalMetabolism} kcal</strong>
              </div>
              <div style={{ height: '14px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.12)', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--accent-primary)', borderRadius: '999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Aktiv verbrannt</span>
                <strong>{totalActiveBurned} kcal</strong>
              </div>
              <div style={{ height: '14px', borderRadius: '999px', background: 'rgba(34, 197, 94, 0.12)', overflow: 'hidden' }}>
                <div style={{ width: `${burnedProgress}%`, height: '100%', background: '#22c55e', borderRadius: '999px' }} />
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Einfache Bilanz</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: netBalance >= 0 ? '#f59e0b' : 'var(--accent-primary)' }}>
                {netBalance >= 0 ? '+' : ''}{netBalance} kcal
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Positiv bedeutet: es wurde mehr gegessen als verbraucht. Negativ bedeutet: die Katze ist im Defizit.
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </AnimatedPage>
  );
};

export default Calories;
