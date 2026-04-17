import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getWeights } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Stats = () => {
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [weights, setWeights] = useState([]);

  useEffect(() => {
    getCats().then(data => {
      const safeCats = Array.isArray(data) ? data : [];
      setCats(safeCats);
      if (safeCats.length > 0) setSelectedCatId(safeCats[0].id.toString());
    }).catch(() => {
      setCats([]);
    });
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getWeights(selectedCatId).then(data => setWeights(data)).catch(() => setWeights([]));
    }
  }, [selectedCatId]);

  const calculateTrend = () => {
    if (weights.length < 2) return { status: 'stabil', diff: 0, direction: '' };
    const first = weights[0].weight;
    const last = weights[weights.length - 1].weight;
    const diff = last - first;
    
    if (diff > 0.1) return { status: 'steigend', diff: diff.toFixed(2), direction: '+' };
    if (diff < -0.1) return { status: 'fallend', diff: Math.abs(diff).toFixed(2), direction: '-' };
    return { status: 'stabil', diff: 0, direction: '' };
  };

  const trend = calculateTrend();
  const selectedCat = cats.find(cat => cat.id.toString() === selectedCatId);
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;

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
    if (weights.length === 0) return 0;

    const uniqueSortedDates = [...new Set(weights.map(entry => entry.date))]
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
    if (selectedCat?.idealWeight === null || selectedCat?.idealWeight === undefined || weights.length === 0) return 0;

    let streak = 0;
    for (let i = weights.length - 1; i >= 0; i -= 1) {
      if (weights[i].weight <= selectedCat.idealWeight + 0.1) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  };

  const longestDailyStreak = getLongestDailyStreak();
  const goalStreakFromLatest = getGoalStreakFromLatest();

  const badges = [
    {
      id: 'first-entry',
      icon: '🥉',
      title: 'Erste Messung',
      description: 'Mindestens 1 Gewichtseintrag erfasst.',
      unlocked: weights.length >= 1
    },
    {
      id: 'consistent',
      icon: '📅',
      title: 'Dranbleiber',
      description: 'Mindestens 5 Gewichtseinträge erfasst.',
      unlocked: weights.length >= 5
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
      <h1>Statistiken & Analyse</h1>
      <p className="page-subtitle">
        Detaillierte Einblicke in die Gewichtsentwicklung.
      </p>

      <select 
        className="input-field" 
        style={{ width: '250px', marginBottom: '2rem' }}
        value={selectedCatId} 
        onChange={(e) => setSelectedCatId(e.target.value)}
      >
        {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </select>

      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          border:
            weightAnalysisHint.tone === 'success'
              ? '1px solid rgba(16, 185, 129, 0.38)'
              : weightAnalysisHint.tone === 'warning'
                ? '1px solid rgba(245, 158, 11, 0.42)'
                : '1px solid var(--border-color)',
          background:
            weightAnalysisHint.tone === 'success'
              ? 'rgba(16, 185, 129, 0.09)'
              : weightAnalysisHint.tone === 'warning'
                ? 'rgba(245, 158, 11, 0.12)'
                : 'var(--surface-color)'
        }}
      >
        <h3 style={{ margin: '0 0 0.45rem 0' }}>{weightAnalysisHint.title}</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{weightAnalysisHint.text}</p>
      </div>

      <div className="two-col-layout stats-layout">
        <div className="card" style={{ height: '450px' }}>
          <h3>Langzeittrend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weights} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
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
              <Area type="monotone" dataKey="weight" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorWeight)" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Allgemeiner Trend</h4>
            <h2 style={{ fontSize: '1.5rem', color: trend.status === 'fallend' ? 'var(--accent-primary)' : (trend.status === 'steigend' ? 'var(--danger)' : 'var(--text-primary)') }}>
              {trend.status.toUpperCase()}
            </h2>
          </div>
          
          <div className="card">
            <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>Gesamtveränderung</h4>
            <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0 0 0' }}>{trend.direction}{trend.diff} kg</h2>
          </div>

          <div className="card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Einträge gesamt</h4>
            <h2 style={{ margin: 0 }}>{weights.length}</h2>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Abzeichen</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Schalte Abzeichen frei, indem du regelmäßig Einträge machst und das Zielgewicht erreichst.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {badges.map((badge) => (
            <div
              key={badge.id}
              style={{
                border: `1px solid ${badge.rare ? '#f59e0b' : (badge.unlocked ? 'var(--accent-primary)' : 'var(--border-color)')}`,
                background: badge.unlocked
                  ? (badge.rare ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.08)')
                  : 'var(--surface-color)',
                borderRadius: '12px',
                padding: '1rem',
                opacity: badge.unlocked ? 1 : 0.65
              }}
            >
              {badge.rare && (
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>
                  SELTEN
                </p>
              )}
              <div style={{ fontSize: '1.5rem' }}>{badge.icon}</div>
              <h4 style={{ margin: '0.5rem 0 0.3rem 0' }}>{badge.title}</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{badge.description}</p>
              <p style={{ margin: '0.6rem 0 0 0', fontWeight: 700, color: badge.unlocked ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                {badge.unlocked ? 'Freigeschaltet' : 'Noch gesperrt'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Stats;
