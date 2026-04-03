import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, addCat, updateCat, deleteCat } from '../services/api';
import { motion } from 'framer-motion';
import { Trash2, Plus, Camera } from 'lucide-react';

const BREED_BASE_WEIGHTS = {
  'Europäisch Kurzhaar': 4.2,
  'Britisch Kurzhaar': 5.0,
  'Siam': 3.8,
  'Maine Coon': 6.8,
  'Norwegische Waldkatze': 5.8,
  'Ragdoll': 5.5,
  'Mischling': 4.5
};

const SIZE_OFFSETS = {
  klein: -0.4,
  mittel: 0,
  gross: 0.5
};

const createCatHeadIcon = ({ base, innerEar, stripe, eye = '#1f2937' }) => {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
      <defs>
        <clipPath id='headClip'>
          <circle cx='50' cy='56' r='28'/>
        </clipPath>
      </defs>
      <rect width='100' height='100' fill='#f8fafc'/>
      <polygon points='30,38 20,16 40,28' fill='${base}' stroke='#2b2b2b' stroke-width='1.5'/>
      <polygon points='70,38 80,16 60,28' fill='${base}' stroke='#2b2b2b' stroke-width='1.5'/>
      <polygon points='30,34 24,21 36,28' fill='${innerEar}'/>
      <polygon points='70,34 76,21 64,28' fill='${innerEar}'/>
      <circle cx='50' cy='56' r='28' fill='${base}' stroke='#2b2b2b' stroke-width='2'/>
      <g clip-path='url(#headClip)' opacity='0.55'>
        <path d='M22 48 C34 36, 66 36, 78 48' stroke='${stripe}' stroke-width='4' fill='none'/>
        <path d='M24 58 C36 48, 64 48, 76 58' stroke='${stripe}' stroke-width='3' fill='none'/>
        <path d='M30 68 C40 62, 60 62, 70 68' stroke='${stripe}' stroke-width='2.5' fill='none'/>
      </g>
      <ellipse cx='41' cy='56' rx='4.2' ry='5.2' fill='${eye}'/>
      <ellipse cx='59' cy='56' rx='4.2' ry='5.2' fill='${eye}'/>
      <circle cx='41' cy='54' r='1.2' fill='#fff'/>
      <circle cx='59' cy='54' r='1.2' fill='#fff'/>
      <polygon points='50,62 46,66 54,66' fill='#f97393'/>
      <path d='M50 66 C48 69, 45 70, 43 70' stroke='#2b2b2b' stroke-width='1.4' fill='none'/>
      <path d='M50 66 C52 69, 55 70, 57 70' stroke='#2b2b2b' stroke-width='1.4' fill='none'/>
      <line x1='33' y1='64' x2='18' y2='61' stroke='#2b2b2b' stroke-width='1.2'/>
      <line x1='33' y1='67' x2='17' y2='67' stroke='#2b2b2b' stroke-width='1.2'/>
      <line x1='67' y1='64' x2='82' y2='61' stroke='#2b2b2b' stroke-width='1.2'/>
      <line x1='67' y1='67' x2='83' y2='67' stroke='#2b2b2b' stroke-width='1.2'/>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CAT_ICON_PRESETS = [
  createCatHeadIcon({ base: '#d89b5a', innerEar: '#f7c8bd', stripe: '#8b5a2b' }), // orange tabby
  createCatHeadIcon({ base: '#9ca3af', innerEar: '#e5bfc2', stripe: '#4b5563' }), // gray tabby
  createCatHeadIcon({ base: '#2f2f35', innerEar: '#e5bfc2', stripe: '#111827', eye: '#f9fafb' }), // black cat
  createCatHeadIcon({ base: '#f3e8cc', innerEar: '#f7c8bd', stripe: '#7c5a3a' }), // cream/brown
  createCatHeadIcon({ base: '#c9b39b', innerEar: '#f7c8bd', stripe: '#5b4636' }), // taupe tabby
  createCatHeadIcon({ base: '#efe6da', innerEar: '#f7c8bd', stripe: '#8d8d8d' }) // light silver
];

const CatList = () => {
  const [cats, setCats] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPhotoCatId, setEditingPhotoCatId] = useState(null);
  const [editingPhotoValue, setEditingPhotoValue] = useState('');
  const [newCat, setNewCat] = useState({
    name: '',
    age: '',
    breed: 'Mischling',
    size: 'mittel',
    idealWeight: '',
    photo: CAT_ICON_PRESETS[0]
  });

  const getSuggestedIdealWeight = (breed, size) => {
    const base = BREED_BASE_WEIGHTS[breed] ?? BREED_BASE_WEIGHTS.Mischling;
    const offset = SIZE_OFFSETS[size] ?? 0;
    return Math.max(2.5, parseFloat((base + offset).toFixed(1)));
  };

  const suggestedIdealWeight = getSuggestedIdealWeight(newCat.breed, newCat.size);
  const sizeLabel = { klein: 'klein', mittel: 'mittel', gross: 'groß' };

  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = () => {
    getCats().then(data => setCats(data));
  };

  const handleAddCat = async (e) => {
    e.preventDefault();
    const payload = {
      ...newCat,
      idealWeight: newCat.idealWeight || suggestedIdealWeight
    };
    await addCat(payload);
    setNewCat({ name: '', age: '', breed: 'Mischling', size: 'mittel', idealWeight: '', photo: CAT_ICON_PRESETS[0] });
    setShowAddForm(false);
    loadCats();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNewCat({ ...newCat, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEditingPhotoValue(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const openPhotoEditor = (cat) => {
    setEditingPhotoCatId(cat.id);
    setEditingPhotoValue(cat.photo);
  };

  const cancelPhotoEditor = () => {
    setEditingPhotoCatId(null);
    setEditingPhotoValue('');
  };

  const savePhotoEditor = async (cat) => {
    await updateCat(cat.id, { photo: editingPhotoValue });
    setCats(prevCats => prevCats.map(existingCat => existingCat.id === cat.id ? { ...existingCat, photo: editingPhotoValue } : existingCat));
    cancelPhotoEditor();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Möchtest du diese Katze wirklich löschen?')) {
      await deleteCat(id);
      loadCats();
    }
  };

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Deine Katzen</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Verwalte die Profile deiner Lieblinge.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={20} /> {showAddForm ? 'Abbrechen' : 'Katze hinzufügen'}
        </button>
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="card" 
          style={{ marginBottom: '2rem', overflow: 'hidden' }}
        >
          <h3 style={{ marginBottom: '1.5rem' }}>Neue Katze anlegen</h3>
          <form onSubmit={handleAddCat} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Name</label>
              <input type="text" className="input-field" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} required style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Alter (Jahre)</label>
              <input type="number" className="input-field" value={newCat.age} onChange={e => setNewCat({...newCat, age: e.target.value})} required style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Rasse</label>
              <select className="input-field" value={newCat.breed} onChange={e => setNewCat({...newCat, breed: e.target.value})} style={{ marginBottom: 0 }}>
                {Object.keys(BREED_BASE_WEIGHTS).map((breed) => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Größe</label>
              <select className="input-field" value={newCat.size} onChange={e => setNewCat({...newCat, size: e.target.value})} style={{ marginBottom: 0 }}>
                <option value="klein">Klein</option>
                <option value="mittel">Mittel</option>
                <option value="gross">Groß</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Zielgewicht (kg)</label>
              <input type="number" step="0.1" className="input-field" value={newCat.idealWeight} onChange={e => setNewCat({...newCat, idealWeight: e.target.value})} placeholder={`Vorschlag: ${suggestedIdealWeight} kg`} style={{ marginBottom: 0 }} />
            </div>
            <div style={{ gridColumn: '1 / -1', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Empfohlenes Zielgewicht auf Basis von Rasse und Größe: <strong style={{ color: 'var(--accent-primary)' }}>{suggestedIdealWeight} kg</strong>. Du kannst den Wert manuell anpassen.
              </p>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Hinweis: Das ist eine Orientierung. Bei Unsicherheit oder gesundheitlichen Auffälligkeiten bitte tierärztlich prüfen lassen.
              </p>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Beispiel-Katzen-Icons
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '0.6rem' }}>
                {CAT_ICON_PRESETS.map((iconUrl) => (
                  <button
                    key={iconUrl}
                    type="button"
                    onClick={() => setNewCat({ ...newCat, photo: iconUrl })}
                    style={{
                      border: newCat.photo === iconUrl ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: 'var(--surface-color)',
                      borderRadius: '10px',
                      padding: '0.4rem',
                      cursor: 'pointer'
                    }}
                  >
                    <img src={iconUrl} alt="Katzen-Icon" style={{ width: '48px', height: '48px' }} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Oder eigenes Foto hochladen
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="input-field"
                style={{ marginBottom: '0.5rem' }}
              />
              <p style={{ margin: '0 0 0.6rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Empfohlen: quadratisches Bild, max. 3 MB.
              </p>
              {newCat.photo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img
                    src={newCat.photo}
                    alt="Vorschau Katzenfoto"
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Aktuelle Auswahl</span>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 0' }}>Speichern</button>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {cats.map((cat, index) => (
          <motion.div 
            key={cat.id} 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <img src={cat.photo} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => openPhotoEditor(cat)}
                  style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', padding: '0.45rem 0.7rem', borderRadius: '999px', fontWeight: 600 }}
                >
                  <Camera size={16} /> Foto ändern
                </button>
              </div>
              <button onClick={() => handleDelete(cat.id)} style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                <Trash2 size={18} />
              </button>
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{cat.name}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {cat.age} Jahre • {cat.breed || 'Mischling'} • {sizeLabel[cat.size] || cat.size || 'mittel'} • Ziel: {cat.idealWeight} kg
              </p>
            </div>
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Letztes Gewicht:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                {cat.currentWeight ? `${parseFloat(cat.currentWeight).toFixed(2)} kg` : 'Keine Daten'}
              </div>
            </div>

            {editingPhotoCatId === cat.id && (
              <div style={{ marginTop: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Foto ändern</h4>
                <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Wähle ein Beispiel-Icon oder lade ein eigenes Foto hoch.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  {CAT_ICON_PRESETS.map((iconUrl) => (
                    <button
                      key={iconUrl}
                      type="button"
                      onClick={() => setEditingPhotoValue(iconUrl)}
                      style={{
                        border: editingPhotoValue === iconUrl ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: 'var(--surface-color)',
                        borderRadius: '10px',
                        padding: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      <img src={iconUrl} alt="Katzen-Icon" style={{ width: '42px', height: '42px' }} />
                    </button>
                  ))}
                </div>
                <input type="file" accept="image/*" onChange={handleEditPhotoUpload} className="input-field" style={{ marginBottom: '0.6rem' }} />
                {editingPhotoValue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
                    <img src={editingPhotoValue} alt="Vorschau" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Aktuelle Auswahl</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-primary" onClick={() => savePhotoEditor(cat)} style={{ flex: 1 }}>Speichern</button>
                  <button type="button" onClick={cancelPhotoEditor} style={{ flex: 1, background: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', fontWeight: 600 }}>Abbrechen</button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};

export default CatList;
