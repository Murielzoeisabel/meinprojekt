import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, getWeights } from '../services/api';
import { Camera } from 'lucide-react';
import NoCatsFeedback from '../components/NoCatsFeedback';

const PROFILE_NAME_KEY = 'cat-slim-down-profile-name';
const PROFILE_IMAGE_KEY = 'cat-slim-down-profile-image';

const HUMAN_AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/personas/svg?seed=Alex&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/personas/svg?seed=Sam&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/personas/svg?seed=Lea&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/personas/svg?seed=Max&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/personas/svg?seed=Noah&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/personas/svg?seed=Mia&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/personas/svg?seed=Lara&backgroundColor=ffe6b3',
  'https://api.dicebear.com/7.x/personas/svg?seed=Finn&backgroundColor=c7f9cc',
  'https://api.dicebear.com/7.x/personas/svg?seed=Emil&backgroundColor=ffd6e0',
  'https://api.dicebear.com/7.x/personas/svg?seed=Jule&backgroundColor=cde7ff',
  'https://api.dicebear.com/7.x/personas/svg?seed=Tom&backgroundColor=f1f5b8',
  'https://api.dicebear.com/7.x/personas/svg?seed=Nina&backgroundColor=f3d1ff',
  'https://api.dicebear.com/7.x/personas/svg?seed=Kai&backgroundColor=d1fae5'
];

const Profile = () => {
  const [name, setName] = useState(() => {
    const storedName = localStorage.getItem(PROFILE_NAME_KEY);
    return storedName && storedName.trim() ? storedName.trim() : 'Katzenfreund';
  });
  const [email, setEmail] = useState('katze@beispiel.de');
  const [profileImage, setProfileImage] = useState(() => {
    const storedProfileImage = localStorage.getItem(PROFILE_IMAGE_KEY);
    return storedProfileImage && storedProfileImage.trim() ? storedProfileImage : HUMAN_AVATAR_PRESETS[0];
  });
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [weights, setWeights] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    getCats().then((data) => {
      const safeCats = Array.isArray(data) ? data : [];
      setCats(safeCats);
      if (safeCats.length > 0) setSelectedCatId(safeCats[0].id.toString());
    }).catch(() => {
      setCats([]);
    });
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      getWeights(selectedCatId).then((data) => setWeights(data)).catch(() => setWeights([]));
    }
  }, [selectedCatId]);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(PROFILE_NAME_KEY, name.trim() || 'Katzenfreund');
    localStorage.setItem(PROFILE_IMAGE_KEY, profileImage);
    window.dispatchEvent(new Event('profile-updated'));
    setSaveMessage('Profil erfolgreich gespeichert!');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const selectedCat = cats.find((cat) => cat.id.toString() === selectedCatId);

  const calculateTrend = () => {
    if (weights.length < 2) return { status: 'stabil' };
    const first = weights[0].weight;
    const last = weights[weights.length - 1].weight;
    const diff = last - first;

    if (diff > 0.1) return { status: 'steigend' };
    if (diff < -0.1) return { status: 'fallend' };
    return { status: 'stabil' };
  };

  const getLongestDailyStreak = () => {
    if (weights.length === 0) return 0;

    const uniqueSortedDates = [...new Set(weights.map((entry) => entry.date))]
      .map((date) => new Date(date))
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

  const trend = calculateTrend();
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const longestDailyStreak = getLongestDailyStreak();
  const goalStreakFromLatest = getGoalStreakFromLatest();

  const badges = [
    {
      id: 'first-entry',
      icon: '🥉',
      title: 'Erste Messung',
      unlocked: weights.length >= 1
    },
    {
      id: 'consistent',
      icon: '📅',
      title: 'Dranbleiber',
      unlocked: weights.length >= 5
    },
    {
      id: 'weight-loss',
      icon: '📉',
      title: 'Auf Zielkurs',
      unlocked: trend.status === 'fallend'
    },
    {
      id: 'near-goal',
      icon: '🎯',
      title: 'Fast am Ziel',
      unlocked: latestWeight !== null && selectedCat?.idealWeight !== null && selectedCat?.idealWeight !== undefined && latestWeight <= selectedCat.idealWeight + 0.2
    },
    {
      id: 'goal-hit',
      icon: '🏆',
      title: 'Ziel erreicht',
      unlocked: latestWeight !== null && selectedCat?.idealWeight !== null && selectedCat?.idealWeight !== undefined && latestWeight <= selectedCat.idealWeight
    },
    {
      id: 'week-streak',
      icon: '💎',
      title: 'Selten: 7-Tage-Serie',
      unlocked: longestDailyStreak >= 7,
      rare: true
    },
    {
      id: 'goal-keeper',
      icon: '👑',
      title: 'Selten: Zielwächter',
      unlocked: goalStreakFromLatest >= 3,
      rare: true
    }
  ];

  const unlockedBadges = badges.filter((badge) => badge.unlocked);

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <img 
          src={profileImage}
          alt="Profile Avatar"
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--accent-primary)' }}
        />
        <div>
          <h1 style={{ marginBottom: '0.2rem' }}>Dein Profil</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Verwalte deine persönlichen Daten.</p>
        </div>
      </div>
      
      <div className="card" style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="profile-image-upload" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Profilbild</label>
            <p style={{ marginTop: '0.25rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Wähle ein Icon oder lade ein eigenes Bild hoch.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
              {HUMAN_AVATAR_PRESETS.map((avatarUrl) => (
                <button
                  key={avatarUrl}
                  type="button"
                  onClick={() => setProfileImage(avatarUrl)}
                  style={{
                    border: profileImage === avatarUrl ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: 'var(--surface-color)',
                    borderRadius: '12px',
                    padding: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  <img src={avatarUrl} alt="Profil-Icon" style={{ width: '48px', height: '48px' }} />
                </button>
              ))}
            </div>

            <input id="profile-image-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="input-field" style={{ marginBottom: '0.6rem' }} />
            {profileImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={profileImage} alt="Aktuelles Profilbild" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Aktuelle Auswahl</span>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="profile-name" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dein Name</label>
            <input id="profile-name" type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 0 }} />
          </div>
          <div>
            <label htmlFor="profile-email" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>E-Mail Adresse</label>
            <input id="profile-email" type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 0 }} />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Speichern</button>
          {saveMessage && (
            <p style={{ margin: 0, color: 'var(--accent-primary)', fontWeight: 600 }}>{saveMessage}</p>
          )}
        </form>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Deine Abzeichen</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Hier siehst du alle bereits freigeschalteten Abzeichen deiner ausgewählten Katze.
        </p>

        {cats.length === 0 ? (
          <NoCatsFeedback compact />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <label htmlFor="profile-cat-select" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Katze:</label>
            <select
              id="profile-cat-select"
              className="input-field"
              style={{ width: '260px', marginBottom: 0 }}
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
            >
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {unlockedBadges.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Noch keine Abzeichen freigeschaltet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                style={{
                  border: `1px solid ${badge.rare ? '#f59e0b' : 'var(--accent-primary)'}`,
                  background: badge.rare ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                  borderRadius: '12px',
                  padding: '0.9rem'
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>{badge.icon}</div>
                <p style={{ margin: '0.4rem 0 0 0', fontWeight: 700 }}>{badge.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};
export default Profile;
