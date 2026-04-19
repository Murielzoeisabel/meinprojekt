import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getWeights, addWeight } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import NoCatsFeedback from '../components/NoCatsFeedback';
import './DashboardStats.css';

const Stats = () => {
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [weights, setWeights] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingEntryDate, setEditingEntryDate] = useState('');
  const [editingEntryWeight, setEditingEntryWeight] = useState('');
  const sortedWeights = [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));

  useEffect(() => {
    getCats().then(data => {
      const safeCats = Array.isArray(data) ? data : [];
      setCats(safeCats);
      if (safeCats.length > 0) setSelectedCatId(safeCats[0].id.toString());
    }).catch(() => {
      setErrorMsg('Katzen konnten nicht geladen werden.');
      setCats([]);
    });
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getWeights(selectedCatId)
        .then(data => {
          setErrorMsg('');
          setWeights(data);
        })
        .catch(() => {
          setErrorMsg('Gewichtsdaten konnten nicht geladen werden.');
          setWeights([]);
        });
    }
  }, [selectedCatId]);

  const formatDate = (value) => {
    if (!value) return '-';
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(parsedDate);
  };

  const beginEditWeightEntry = (entry) => {
    if (!entry?.date) return;
    setEditingEntryDate(entry.date);
    setEditingEntryWeight(String(entry.weight));
    setErrorMsg('');
  };

  const cancelEditWeightEntry = () => {
    setEditingEntryDate('');
    setEditingEntryWeight('');
  };

  const refreshWeights = async () => {
    const updated = await getWeights(selectedCatId);
    setWeights(updated);
    return updated;
  };

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!newWeight || !selectedCatId || !newWeightDate) return;

    try {
      setErrorMsg('');
      await addWeight({ catId: selectedCatId, weight: newWeight, date: newWeightDate });
      await refreshWeights();
      setNewWeight('');
      setSuccessMsg('Gewicht erfolgreich gespeichert!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Gewicht konnte nicht gespeichert werden.');
    }
  };

  const saveEditedWeightEntry = async () => {
    if (!selectedCatId || !editingEntryDate) return;
    const parsedWeight = Number(editingEntryWeight);
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      setErrorMsg('Bitte ein gültiges Gewicht größer als 0 eingeben.');
      return;
    }

    try {
      setErrorMsg('');
      await addWeight({ catId: selectedCatId, weight: parsedWeight, date: editingEntryDate });
      await refreshWeights();
      setSuccessMsg(`Gewichtseintrag vom ${formatDate(editingEntryDate)} wurde aktualisiert.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      cancelEditWeightEntry();
    } catch {
      setErrorMsg('Gewichtseintrag konnte nicht aktualisiert werden.');
    }
  };

  const calculateTrend = () => {
    if (sortedWeights.length < 2) return { status: 'stabil', diff: 0, direction: '' };
    const first = sortedWeights[0].weight;
    const last = sortedWeights[sortedWeights.length - 1].weight;
    const diff = last - first;
    
    if (diff > 0.1) return { status: 'steigend', diff: diff.toFixed(2), direction: '+' };
    if (diff < -0.1) return { status: 'fallend', diff: Math.abs(diff).toFixed(2), direction: '-' };
    return { status: 'stabil', diff: 0, direction: '' };
  };

  const trend = calculateTrend();
  const selectedCat = cats.find(cat => cat.id.toString() === selectedCatId);
  const latestWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : null;

  const getWeightAnalysisHint = () => {
    if (!selectedCat || latestWeight === null || selectedCat.idealWeight === undefined || selectedCat.idealWeight === null) {
      return {
        title: 'Analyse-Hinweis',
        text: 'Sobald aktuelles Gewicht und Zielgewicht vorliegen, bekommst du hier eine kurze Analyse.',
        tone: 'neutral'
      };
    }

    const delta = Number((latestWeight - selectedCat.idealWeight).toFixed(2));

    if (delta <= 0.15 && delta >= -0.35) {
      return {
        title: 'Sehr gut gemacht',
        text: `Es sieht so aus, als ob ${selectedCat.name} bereits im idealen Gewichtsbereich liegt. Halte den aktuellen Kurs!`,
        tone: 'success'
      };
    }

    if (delta > 0.15) {
      const remaining = Number(delta.toFixed(1));
      if (remaining <= 1) {
        return {
          title: 'Fast geschafft',
          text: `Nur noch etwa ${remaining} kg bis zum Zielgewicht. Du schaffst das!`,
          tone: 'motivation'
        };
      }

      return {
        title: 'Weiter so',
        text: `Noch etwa ${remaining} kg bis zum Zielgewicht. Mit konstanten Einträgen bleibt ihr auf Kurs.`,
        tone: 'motivation'
      };
    }

    return {
      title: 'Unter dem Zielgewicht',
      text: `${selectedCat.name} liegt aktuell etwa ${Math.abs(delta).toFixed(1)} kg unter dem Zielgewicht. Bitte Werte beobachten und bei Unsicherheit tierärztlich abklären.`,
      tone: 'warning'
    };
  };

  const weightAnalysisHint = getWeightAnalysisHint();

  const getLongestDailyStreak = () => {
    if (sortedWeights.length === 0) return 0;

    const uniqueSortedDates = [...new Set(sortedWeights.map(entry => entry.date))]
      .map(date => new Date(date))
      .sort((a, b) => a - b);

    let longest = 1;
    let current = 1;

    for (let i = 1; i < uniqueSortedDates.length; i += 1) {
      const prev = uniqueSortedDates[i - 1];
      const curr = uniqueSortedDates[i];
      const diffInDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffInDays === 1) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  };

  const getGoalStreakFromLatest = () => {
    if (selectedCat?.idealWeight === null || selectedCat?.idealWeight === undefined || sortedWeights.length === 0) return 0;

    let streak = 0;
    for (let i = sortedWeights.length - 1; i >= 0; i -= 1) {
      if (sortedWeights[i].weight <= selectedCat.idealWeight + 0.1) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  };

  const longestDailyStreak = getLongestDailyStreak();
  const goalStreakFromLatest = getGoalStreakFromLatest();
  const isEditingFromChart = Boolean(editingEntryDate);
  const recentWeights = [...sortedWeights].reverse().slice(0, 8);

  const badges = [
    {
      id: 'first-entry',
      icon: '🥉',
      title: 'Erste Messung',
      description: 'Mindestens 1 Gewichtseintrag erfasst.',
      unlocked: sortedWeights.length >= 1
    },
    {
      id: 'consistent',
      icon: '📅',
      title: 'Dranbleiber',
      description: 'Mindestens 5 Gewichtseinträge erfasst.',
      unlocked: sortedWeights.length >= 5
    },
    {
      id: 'weight-loss',
      icon: '📉',
      title: 'Auf Zielkurs',
      description: 'Der Trend zeigt eine Gewichtsabnahme.',
      unlocked: trend.status === 'fallend'
    },
    {
      id: 'near-goal',
      icon: '🎯',
      title: 'Fast am Ziel',
      description: 'Aktuelles Gewicht liegt maximal 0.2 kg über dem Zielgewicht.',
      unlocked: latestWeight !== null && selectedCat?.idealWeight !== null && selectedCat?.idealWeight !== undefined && latestWeight <= selectedCat.idealWeight + 0.2
    },
    {
      id: 'goal-hit',
      icon: '🏆',
      title: 'Ziel erreicht',
      description: 'Aktuelles Gewicht ist kleiner/gleich Zielgewicht.',
      unlocked: latestWeight !== null && selectedCat?.idealWeight !== null && selectedCat?.idealWeight !== undefined && latestWeight <= selectedCat.idealWeight
    },
    {
      id: 'week-streak',
      icon: '💎',
      title: 'Selten: 7-Tage-Serie',
      description: '7 Tage in Folge dokumentiert.',
      unlocked: longestDailyStreak >= 7,
      rare: true
    },
    {
      id: 'goal-keeper',
      icon: '👑',
      title: 'Selten: Zielwächter',
      description: '3 Einträge in Folge im Zielbereich (<= Ziel + 0.1 kg).',
      unlocked: goalStreakFromLatest >= 3,
      rare: true
    }
  ];

  const formatDateDDMMYYYY = (dateValue) => {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return dateValue;
    }

    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <AnimatedPage>
      {errorMsg && (
        <div className="card alert-error">
          {errorMsg}
        </div>
      )}

      <div className="cat-page-hero">
        <div>
          <h1>Statistiken & Analyse</h1>
          <p className="page-subtitle">Detaillierte Einblicke in die Gewichtsentwicklung.</p>
        </div>
        <div className="cat-page-hero-art" aria-hidden="true">😸📈</div>
      </div>

      {cats.length === 0 ? (
        <NoCatsFeedback />
      ) : (
        <div className="card filter-card">
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
            <select 
              className="input-field"
              value={selectedCatId} 
              onChange={(e) => setSelectedCatId(e.target.value)}
            >
              {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {cats.length > 0 && (
        <>
          <div
            className={`card analysis-card ${
              weightAnalysisHint.tone === 'success'
                ? 'analysis-success'
                : weightAnalysisHint.tone === 'warning'
                  ? 'analysis-warning'
                  : 'analysis-neutral'
            }`}
          >
            <h3>{weightAnalysisHint.title}</h3>
            <p>{weightAnalysisHint.text}</p>
          </div>

          <div className="paw-separator" aria-hidden="true">🐾 🐾 🐾</div>

          <div className="two-col-layout stats-layout">
            <div className="stats-main-column">
              <div className="card chart-card stats-chart-card">
                <h3 className="chart-title">Langzeittrend</h3>
                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                  <AreaChart data={sortedWeights} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="var(--text-secondary)" tickFormatter={formatDateDDMMYYYY} />
                    <YAxis stroke="var(--text-secondary)" domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <Tooltip labelFormatter={formatDateDDMMYYYY} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--card-shadow)' }} />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--accent-primary)"
                      fillOpacity={1}
                      fill="url(#colorWeight)"
                      animationDuration={2000}
                      activeDot={{ r: 8 }}
                      dot={({ cx, cy, payload }) => (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill="var(--accent-primary)"
                          stroke="#fff"
                          strokeWidth={1.5}
                          style={{ cursor: 'pointer' }}
                          onClick={() => beginEditWeightEntry(payload)}
                        />
                      )}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="stats-mini-row">
                <div className="card stats-mini">
                  <h4>Allgemeiner Trend</h4>
                  <h2 style={{ color: trend.status === 'fallend' ? 'var(--accent-primary)' : (trend.status === 'steigend' ? 'var(--danger)' : 'var(--text-primary)') }}>
                    {trend.status.toUpperCase()}
                  </h2>
                </div>

                <div className="card stats-mini">
                  <h4>Gesamtveränderung</h4>
                  <h2>{trend.direction}{trend.diff} kg</h2>
                </div>

                <div className="card stats-mini">
                  <h4>Einträge gesamt</h4>
                  <h2>{sortedWeights.length}</h2>
                </div>
              </div>
            </div>

            <div className="stats-panel">
              <div className="card form-card">
                <h3>Gewicht eintragen</h3>
                <form onSubmit={handleWeightSubmit}>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="Gewicht in kg, z.B. 4.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    required
                  />
                  <input
                    type="date"
                    className="input-field"
                    value={newWeightDate}
                    onChange={(e) => setNewWeightDate(e.target.value)}
                    required
                  />
                  <p className="form-note">
                    Hinweis: Rückdatierte Einträge sind erlaubt.
                  </p>
                  <button type="submit" className="btn-primary btn-block">Gewicht speichern</button>
                </form>
                {successMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="success-message"
                  >
                    {successMsg}
                  </motion.p>
                )}

                <div className="weight-entry-section">
                  <h4 className="weight-entry-title">Gewichtseintrag bearbeiten</h4>
                  {isEditingFromChart ? (
                    <div className="weight-entry-row">
                      <span className="weight-entry-date">{formatDate(editingEntryDate)}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="input-field weight-entry-input"
                        value={editingEntryWeight}
                        onChange={(e) => setEditingEntryWeight(e.target.value)}
                      />
                      <div className="weight-entry-actions">
                        <button type="button" className="btn-secondary" onClick={saveEditedWeightEntry}>Speichern</button>
                        <button type="button" className="btn-secondary" onClick={cancelEditWeightEntry}>Abbrechen</button>
                      </div>
                    </div>
                  ) : (
                    <p className="weight-entry-empty">Klicke auf einen Punkt im Diagramm, um den Eintrag zu bearbeiten.</p>
                  )}

                  <p className="weight-entry-order">Neueste Einträge zuerst</p>
                  <div className="weight-entry-list" style={{ marginTop: '0.65rem' }}>
                    {recentWeights.map((entry) => (
                      <div
                        key={entry.date}
                        className={`weight-entry-row ${editingEntryDate === entry.date ? 'weight-entry-row-active' : ''}`}
                      >
                        <span className="weight-entry-date">{formatDate(entry.date)}</span>
                        <span className="weight-entry-value">{entry.weight} kg</span>
                        <div className="weight-entry-actions">
                          <button
                            type="button"
                            className="btn-secondary weight-entry-edit-btn"
                            onClick={() => beginEditWeightEntry(entry)}
                            aria-label={`Eintrag vom ${formatDate(entry.date)} bearbeiten`}
                            title="Eintrag bearbeiten"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="paw-separator" aria-hidden="true">🐾 🐾 🐾</div>

          <div className="card badges-card">
            <h3>Abzeichen</h3>
            <p className="badges-intro">
              Schalte Abzeichen frei, indem du regelmäßig Einträge machst und das Zielgewicht erreichst.
            </p>
            <div className="badge-grid">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`badge-card ${badge.rare ? 'rare' : ''} ${badge.unlocked ? 'unlocked' : 'locked'}`}
                >
                  {badge.rare && (
                    <p className="badge-rare-label">
                      SELTEN
                    </p>
                  )}
                  <div className="badge-icon">{badge.icon}</div>
                  <h4>{badge.title}</h4>
                  <p className="badge-desc">{badge.description}</p>
                  <p className="badge-status">
                    {badge.unlocked ? 'Freigeschaltet' : 'Noch gesperrt'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AnimatedPage>
  );
};

export default Stats;
