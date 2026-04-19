import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { getCats, addCat, updateCat, deleteCat, addWeight } from '../services/api';
import { motion } from 'framer-motion';
import { Trash2, Plus, Camera } from 'lucide-react';

void motion;

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

const encodeSvgToBase64 = (svg) => {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
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
  return `data:image/svg+xml;base64,${encodeSvgToBase64(svg)}`;
};

const CAT_ICON_PRESETS = [
  createCatHeadIcon({ base: '#d89b5a', innerEar: '#f7c8bd', stripe: '#8b5a2b' }), // orange tabby
  createCatHeadIcon({ base: '#9ca3af', innerEar: '#e5bfc2', stripe: '#4b5563' }), // gray tabby
  createCatHeadIcon({ base: '#2f2f35', innerEar: '#e5bfc2', stripe: '#111827', eye: '#f9fafb' }), // black cat
  createCatHeadIcon({ base: '#f3e8cc', innerEar: '#f7c8bd', stripe: '#7c5a3a' }), // cream/brown
  createCatHeadIcon({ base: '#c9b39b', innerEar: '#f7c8bd', stripe: '#5b4636' }), // taupe tabby
  createCatHeadIcon({ base: '#efe6da', innerEar: '#f7c8bd', stripe: '#8d8d8d' }) // light silver
];

const MAX_UPLOAD_SIZE_BYTES = 3 * 1024 * 1024;

const bytesToMb = (bytes) => (bytes / (1024 * 1024)).toFixed(1);

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const loadImageElement = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

const canvasToBlob = (canvas, type, quality) => new Promise((resolve) => {
  canvas.toBlob((blob) => resolve(blob), type, quality);
});

const shrinkImageForUpload = async (file, maxBytes = MAX_UPLOAD_SIZE_BYTES) => {
  const sourceDataUrl = await fileToDataUrl(file);
  const image = await loadImageElement(sourceDataUrl);

  const baseMaxDimension = 1800;
  let scale = Math.min(1, baseMaxDimension / Math.max(image.width, image.height));
  let quality = 0.9;
  let smallestBlob = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context konnte nicht erstellt werden.');
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, 'image/webp', quality);
    if (!blob) break;

    if (!smallestBlob || blob.size < smallestBlob.size) {
      smallestBlob = blob;
    }

    if (blob.size <= maxBytes) {
      return {
        success: true,
        dataUrl: await blobToDataUrl(blob),
        sizeBytes: blob.size
      };
    }

    if (attempt % 2 === 0) {
      quality = Math.max(0.5, quality - 0.12);
    } else {
      scale *= 0.85;
    }
  }

  if (!smallestBlob) {
    return { success: false };
  }

  return {
    success: smallestBlob.size <= maxBytes,
    dataUrl: await blobToDataUrl(smallestBlob),
    sizeBytes: smallestBlob.size
  };
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const apiError = error?.response?.data?.error;
  const code = apiError?.code;

  if (error?.response?.status === 413 || code === 'REQUEST_TOO_LARGE') {
    return 'Das Bild ist zu groß für den Server. Bitte nutze ein kleineres Bild (empfohlen: max. 3 MB).';
  }

  if (code === 'PHOTO_URL_TOO_LONG') {
    return 'Das Bild ist zu groß. Bitte wähle ein kleineres Bild (max. 3 MB).';
  }

  if (code === 'INVALID_PHOTO_URL') {
    return 'Das Bildformat konnte nicht verarbeitet werden. Bitte nutze JPG, PNG oder WEBP.';
  }

  if (typeof apiError?.message === 'string' && apiError.message.trim()) {
    return apiError.message;
  }

  return fallbackMessage;
};

const CatList = () => {
  const [cats, setCats] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPhotoCatId, setEditingPhotoCatId] = useState(null);
  const [editingPhotoValue, setEditingPhotoValue] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [saveRewardCatId, setSaveRewardCatId] = useState(null);
  const [editingCatDraft, setEditingCatDraft] = useState({
    name: '',
    age: '',
    breed: 'Mischling',
    size: 'mittel',
    idealWeight: '',
    currentWeight: ''
  });
  const [newCat, setNewCat] = useState({
    name: '',
    age: '',
    breed: 'Mischling',
    size: 'mittel',
    idealWeight: '',
    photo: CAT_ICON_PRESETS[0]
  });
  const [newCatCurrentWeight, setNewCatCurrentWeight] = useState('');
  const [newCatBcs, setNewCatBcs] = useState('5');
  const [showBcsQuickHelp, setShowBcsQuickHelp] = useState(false);
  const [addFormFeedback, setAddFormFeedback] = useState(null);
  const [catEditorFeedback, setCatEditorFeedback] = useState(null);
  const [photoEditorFeedback, setPhotoEditorFeedback] = useState(null);
  const [globalFeedback, setGlobalFeedback] = useState(null);
  const [isAddSaving, setIsAddSaving] = useState(false);
  const [savingCatId, setSavingCatId] = useState(null);
  const [savingPhotoCatId, setSavingPhotoCatId] = useState(null);
  const [pendingAutoResizeAddFile, setPendingAutoResizeAddFile] = useState(null);
  const [pendingAutoResizePhotoFile, setPendingAutoResizePhotoFile] = useState(null);
  const [isAutoResizingAdd, setIsAutoResizingAdd] = useState(false);
  const [autoResizingPhotoCatId, setAutoResizingPhotoCatId] = useState(null);

  const getSuggestedIdealWeight = (breed, size) => {
    const base = BREED_BASE_WEIGHTS[breed] ?? BREED_BASE_WEIGHTS.Mischling;
    const offset = SIZE_OFFSETS[size] ?? 0;
    return Math.max(2.5, parseFloat((base + offset).toFixed(1)));
  };

  const suggestedIdealWeight = getSuggestedIdealWeight(newCat.breed, newCat.size);
  const suggestedRangeMin = Math.max(2.5, Number((suggestedIdealWeight - 0.4).toFixed(1)));
  const suggestedRangeMax = Number((suggestedIdealWeight + 0.4).toFixed(1));
  const parsedCurrentWeight = Number(newCatCurrentWeight);
  const hasCurrentWeight = !Number.isNaN(parsedCurrentWeight) && parsedCurrentWeight > 0;
  const parsedBcs = Number(newCatBcs);
  const hasValidBcs = Number.isInteger(parsedBcs) && parsedBcs >= 1 && parsedBcs <= 9;

  const getBcsBasedRange = (currentWeight, bcsValue) => {
    const stepsFromIdeal = bcsValue - 5;
    const delta = stepsFromIdeal * 0.1;
    const denominator = 1 + delta;
    if (denominator <= 0.2) return null;

    const estimatedIdeal = currentWeight / denominator;
    const min = Math.max(2.5, Number((estimatedIdeal * 0.95).toFixed(1)));
    const max = Math.max(min + 0.1, Number((estimatedIdeal * 1.05).toFixed(1)));
    return { min, max, center: Number(estimatedIdeal.toFixed(1)) };
  };

  const bcsRange = hasCurrentWeight && hasValidBcs ? getBcsBasedRange(parsedCurrentWeight, parsedBcs) : null;
  const activeSuggestedRange = bcsRange || { min: suggestedRangeMin, max: suggestedRangeMax, center: suggestedIdealWeight };
  const sizeLabel = { klein: 'klein', mittel: 'mittel', gross: 'groß' };

  const loadCats = async () => {
    try {
      const data = await getCats();
      setCats(Array.isArray(data) ? data : []);
    } catch {
      setGlobalFeedback({ type: 'error', message: 'Katzen konnten nicht geladen werden.' });
    }
  };

  useEffect(() => {
    loadCats();
  }, []);

  const handleAddCat = async (e) => {
    e.preventDefault();
    setAddFormFeedback(null);
    setGlobalFeedback(null);
    setIsAddSaving(true);

    try {
      const payload = {
        ...newCat,
        idealWeight: newCat.idealWeight !== '' && newCat.idealWeight !== null && newCat.idealWeight !== undefined
          ? newCat.idealWeight
          : activeSuggestedRange.center
      };

      const createdCat = await addCat(payload);
      let initialWeightSaved = false;

      // If a current weight is provided at creation time, store it as first weight entry.
      if (hasCurrentWeight) {
        try {
          await addWeight({ catId: createdCat.id, weight: parsedCurrentWeight });
          initialWeightSaved = true;
        } catch {
          initialWeightSaved = false;
        }
      }

      setNewCat({ name: '', age: '', breed: 'Mischling', size: 'mittel', idealWeight: '', photo: CAT_ICON_PRESETS[0] });
      setNewCatCurrentWeight('');
      setNewCatBcs('5');
      setShowBcsQuickHelp(false);
      setPendingAutoResizeAddFile(null);
      setShowAddForm(false);
      setGlobalFeedback({
        type: initialWeightSaved || !hasCurrentWeight ? 'success' : 'error',
        message: initialWeightSaved
          ? 'Katze erfolgreich gespeichert. Das aktuelle Gewicht wurde als letzter Gewichtseintrag übernommen.'
          : hasCurrentWeight
            ? 'Katze wurde gespeichert, aber das aktuelle Gewicht konnte nicht als letzter Eintrag gespeichert werden.'
            : 'Katze erfolgreich gespeichert.'
      });
      await loadCats();
    } catch (error) {
      setAddFormFeedback({ type: 'error', message: getApiErrorMessage(error, 'Speichern fehlgeschlagen. Bitte prüfe die Eingaben und versuche es erneut.') });
    } finally {
      setIsAddSaving(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setPendingAutoResizeAddFile(file);
      setAddFormFeedback({
        type: 'error',
        message: `Das Bild ist zu groß (${bytesToMb(file.size)} MB). Bitte nutze max. 3 MB oder klicke auf Bild automatisch verkleinern.`,
        canAutoResize: true
      });
      e.target.value = '';
      return;
    }

    setPendingAutoResizeAddFile(null);
    setAddFormFeedback(null);

    fileToDataUrl(file).then((dataUrl) => {
      setNewCat((prev) => ({ ...prev, photo: dataUrl }));
    });
  };

  const handleAutoResizeAddPhoto = async () => {
    if (!pendingAutoResizeAddFile) return;

    setIsAutoResizingAdd(true);
    try {
      const resized = await shrinkImageForUpload(pendingAutoResizeAddFile, MAX_UPLOAD_SIZE_BYTES);
      if (!resized.success || !resized.dataUrl) {
        setAddFormFeedback({ type: 'error', message: 'Automatische Verkleinerung hat nicht ausgereicht. Bitte wähle ein kleineres Bild.' });
        return;
      }

      setNewCat((prev) => ({ ...prev, photo: resized.dataUrl }));
      setPendingAutoResizeAddFile(null);
      setAddFormFeedback({ type: 'success', message: `Bild automatisch verkleinert (${bytesToMb(resized.sizeBytes)} MB). Du kannst jetzt speichern.` });
    } catch {
      setAddFormFeedback({ type: 'error', message: 'Bild konnte nicht automatisch verkleinert werden. Bitte anderes Bild versuchen.' });
    } finally {
      setIsAutoResizingAdd(false);
    }
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setPendingAutoResizePhotoFile({ catId: editingPhotoCatId, file });
      setPhotoEditorFeedback({
        catId: editingPhotoCatId,
        type: 'error',
        message: `Das Bild ist zu groß (${bytesToMb(file.size)} MB). Bitte nutze max. 3 MB oder klicke auf Bild automatisch verkleinern.`,
        canAutoResize: true
      });
      e.target.value = '';
      return;
    }

    setPendingAutoResizePhotoFile(null);
    setPhotoEditorFeedback(null);

    fileToDataUrl(file).then((dataUrl) => {
      setEditingPhotoValue(dataUrl);
    });
  };

  const handleAutoResizeEditPhoto = async (catId) => {
    if (!pendingAutoResizePhotoFile || pendingAutoResizePhotoFile.catId !== catId) return;

    setAutoResizingPhotoCatId(catId);
    try {
      const resized = await shrinkImageForUpload(pendingAutoResizePhotoFile.file, MAX_UPLOAD_SIZE_BYTES);
      if (!resized.success || !resized.dataUrl) {
        setPhotoEditorFeedback({ catId, type: 'error', message: 'Automatische Verkleinerung hat nicht ausgereicht. Bitte wähle ein kleineres Bild.' });
        return;
      }

      setEditingPhotoValue(resized.dataUrl);
      setPendingAutoResizePhotoFile(null);
      setPhotoEditorFeedback({ catId, type: 'success', message: `Bild automatisch verkleinert (${bytesToMb(resized.sizeBytes)} MB). Du kannst jetzt speichern.` });
    } catch {
      setPhotoEditorFeedback({ catId, type: 'error', message: 'Bild konnte nicht automatisch verkleinert werden. Bitte anderes Bild versuchen.' });
    } finally {
      setAutoResizingPhotoCatId(null);
    }
  };

  const openPhotoEditor = (cat) => {
    setEditingPhotoCatId(cat.id);
    setEditingPhotoValue(cat.photo);
    setPendingAutoResizePhotoFile(null);
    setPhotoEditorFeedback(null);
  };

  const cancelPhotoEditor = () => {
    setEditingPhotoCatId(null);
    setEditingPhotoValue('');
    setPendingAutoResizePhotoFile(null);
    setPhotoEditorFeedback(null);
  };

  const savePhotoEditor = async (cat) => {
    setPhotoEditorFeedback(null);
    setGlobalFeedback(null);
    setSavingPhotoCatId(cat.id);

    try {
      await updateCat(cat.id, { photo: editingPhotoValue });
      setCats(prevCats => prevCats.map(existingCat => existingCat.id === cat.id ? { ...existingCat, photo: editingPhotoValue } : existingCat));
      setGlobalFeedback({ type: 'success', message: `Foto von ${cat.name} wurde gespeichert.` });
      cancelPhotoEditor();
    } catch (error) {
      setPhotoEditorFeedback({ catId: cat.id, type: 'error', message: getApiErrorMessage(error, 'Foto konnte nicht gespeichert werden.') });
    } finally {
      setSavingPhotoCatId(null);
    }
  };

  const openCatEditor = (cat) => {
    setEditingCatId(cat.id);
    setCatEditorFeedback(null);
    setEditingCatDraft({
      name: cat.name ?? '',
      age: String(cat.age ?? ''),
      breed: cat.breed ?? 'Mischling',
      size: cat.size ?? 'mittel',
      idealWeight: String(cat.idealWeight ?? ''),
      currentWeight: cat.currentWeight !== null && cat.currentWeight !== undefined ? String(parseFloat(cat.currentWeight).toFixed(2)) : ''
    });
  };

  const cancelCatEditor = () => {
    setEditingCatId(null);
    setCatEditorFeedback(null);
    setEditingCatDraft({ name: '', age: '', breed: 'Mischling', size: 'mittel', idealWeight: '', currentWeight: '' });
  };

  const saveCatEditor = async (cat) => {
    const nextAge = parseInt(editingCatDraft.age, 10);
    const nextIdealWeight = parseFloat(editingCatDraft.idealWeight);
    const nextCurrentWeight = parseFloat(editingCatDraft.currentWeight);

    if (!editingCatDraft.name.trim()) {
      setCatEditorFeedback({ catId: cat.id, type: 'error', message: 'Bitte gib einen Namen ein.' });
      return;
    }
    if (Number.isNaN(nextAge) || nextAge < 0) {
      setCatEditorFeedback({ catId: cat.id, type: 'error', message: 'Bitte gib ein gültiges Alter ein.' });
      return;
    }
    if (Number.isNaN(nextIdealWeight) || nextIdealWeight <= 0) {
      setCatEditorFeedback({ catId: cat.id, type: 'error', message: 'Bitte gib ein gültiges Zielgewicht ein.' });
      return;
    }

    setCatEditorFeedback(null);
    setGlobalFeedback(null);
    setSavingCatId(cat.id);

    try {
      await updateCat(cat.id, {
        name: editingCatDraft.name.trim(),
        age: nextAge,
        breed: editingCatDraft.breed,
        size: editingCatDraft.size,
        idealWeight: nextIdealWeight
      });

      let updatedCurrentWeight = cat.currentWeight;
      if (!Number.isNaN(nextCurrentWeight) && nextCurrentWeight > 0) {
        const oldWeight = cat.currentWeight !== null && cat.currentWeight !== undefined ? parseFloat(cat.currentWeight) : null;
        if (oldWeight === null || Math.abs(oldWeight - nextCurrentWeight) > 0.0001) {
          await addWeight({ catId: cat.id, weight: nextCurrentWeight });
        }
        updatedCurrentWeight = nextCurrentWeight;
      }

      setCats(prevCats => prevCats.map(existingCat => (
        existingCat.id === cat.id
          ? {
              ...existingCat,
              name: editingCatDraft.name.trim(),
              age: nextAge,
              breed: editingCatDraft.breed,
              size: editingCatDraft.size,
              idealWeight: nextIdealWeight,
              currentWeight: updatedCurrentWeight
            }
          : existingCat
      )));
      setSaveRewardCatId(cat.id);
      setTimeout(() => setSaveRewardCatId(null), 2200);
      setGlobalFeedback({ type: 'success', message: `Profil von ${cat.name} wurde gespeichert.` });
      cancelCatEditor();
    } catch (error) {
      setCatEditorFeedback({ catId: cat.id, type: 'error', message: getApiErrorMessage(error, 'Profil konnte nicht gespeichert werden.') });
    } finally {
      setSavingCatId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Möchtest du diese Katze wirklich löschen?')) {
      try {
        await deleteCat(id);
        await loadCats();
      } catch {
        setGlobalFeedback({ type: 'error', message: 'Katze konnte nicht gelöscht werden.' });
      }
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

      {globalFeedback && (
        <div
          className="card"
          style={{
            marginBottom: '1.2rem',
            border: globalFeedback.type === 'error' ? '1px solid rgba(239, 68, 68, 0.42)' : '1px solid rgba(16, 185, 129, 0.38)',
            background: globalFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.09)' : 'rgba(16, 185, 129, 0.09)'
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{globalFeedback.message}</p>
        </div>
      )}

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="card" 
          style={{ marginBottom: '2rem', overflow: 'hidden' }}
        >
          <h3 style={{ marginBottom: '1.5rem' }}>Neue Katze anlegen</h3>
          <form onSubmit={handleAddCat} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div
              style={{
                gridColumn: '1 / -1',
                marginTop: '-0.4rem',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(14, 165, 233, 0.05))',
                border: '1px solid rgba(14, 165, 233, 0.32)',
                borderRadius: '10px',
                padding: '0.75rem 0.95rem'
              }}
            >
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                <strong>Größenhilfe:</strong> Beurteile lieber den Körperbau statt des Gewichts.
                <strong> Klein</strong> = zierlich, schmale Brust und feine Knochen.
                <strong> Mittel</strong> = durchschnittlicher Körperbau, normale Proportionen.
                <strong> Groß</strong> = kräftiger Rahmen, breitere Brust und längerer Körper.
              </p>
            </div>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aktuelles Gewicht (optional)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={newCatCurrentWeight}
                onChange={(e) => setNewCatCurrentWeight(e.target.value)}
                placeholder="z. B. 6.2"
                style={{ marginBottom: 0 }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ marginBottom: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Body Condition Score (1-9)</label>
                <button
                  type="button"
                  onClick={() => setShowBcsQuickHelp(prev => !prev)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#1d4ed8',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    borderRadius: '999px',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  aria-expanded={showBcsQuickHelp}
                  aria-controls="bcs-quick-help"
                >
                  {showBcsQuickHelp ? 'Info ausblenden' : 'Was bedeutet das?'}
                </button>
              </div>
              <select className="input-field" value={newCatBcs} onChange={(e) => setNewCatBcs(e.target.value)} style={{ marginBottom: 0 }}>
                <option value="3">3 - eher schlank</option>
                <option value="4">4 - leicht schlank</option>
                <option value="5">5 - ideal</option>
                <option value="6">6 - leicht übergewichtig</option>
                <option value="7">7 - übergewichtig</option>
                <option value="8">8 - stark übergewichtig</option>
                <option value="9">9 - adipös</option>
              </select>
              {showBcsQuickHelp && (
                <div
                  id="bcs-quick-help"
                  style={{ marginTop: '0.55rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '0.55rem 0.65rem' }}
                >
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    BCS 1-3: eher zu schlank, BCS 4-5: meist ideal, BCS 6-9: zunehmend übergewichtig.
                    Der Score ergänzt die Waage, weil auch Körperform und Fettverteilung wichtig sind.
                  </p>
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Zielgewicht (kg)</label>
              <input type="number" step="0.1" className="input-field" value={newCat.idealWeight} onChange={e => setNewCat({...newCat, idealWeight: e.target.value})} placeholder={`Schätzung: ${activeSuggestedRange.min} - ${activeSuggestedRange.max} kg`} style={{ marginBottom: 0 }} />
            </div>
            <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.16), rgba(251, 191, 36, 0.06))', border: '1px solid rgba(251, 191, 36, 0.35)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                <strong>Zielgewichts-Hinweis:</strong> Das vorgeschlagene Zielgewicht ist nur eine grobe Schätzung und nicht wissenschaftlich exakt.
                Nutze das Zielgewicht als Startpunkt, nicht als feste Diagnose.
              </p>
              <p style={{ margin: '0.45rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                {bcsRange ? (
                  <>
                    BCS-basierter Orientierungsbereich: <strong style={{ color: 'var(--accent-primary)' }}>{bcsRange.min} bis {bcsRange.max} kg</strong>
                    {' '}bei aktuellem Gewicht {parsedCurrentWeight.toFixed(1)} kg und BCS {parsedBcs}.
                  </>
                ) : (
                  <>
                    Basis-Orientierungsbereich: <strong style={{ color: 'var(--accent-primary)' }}>{suggestedRangeMin} bis {suggestedRangeMax} kg</strong>
                    {' '}aus Rasse + Größe.
                  </>
                )}
                {' '}Den Zielwert bitte mit Tierarzt abstimmen.
              </p>
            </div>

            <div style={{ gridColumn: '1 / -1', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.28)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
              <img
                src="/images/cat-bcs-guide.svg?v=24"
                alt="Body Condition Score für Katzen in Bereichen 1 bis 2, 3 bis 4, 5, 6 bis 7 und 8 bis 9"
                style={{ width: '100%', height: 'auto', marginTop: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#ffffff' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.28)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                <strong>Woran erkenne ich Idealgewicht?</strong>
              </p>
              <p style={{ margin: '0.45rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Rippen sind leicht tastbar, aber nicht sichtbar. Von oben ist eine leichte Taille erkennbar. Von der Seite wirkt der Bauch leicht aufgezogen und nicht hängend.
              </p>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Bei Unsicherheit, Vorerkrankungen oder sehr großem/kleinem Körperbau bitte tierärztlich prüfen lassen.
              </p>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Katzen-Icons
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

            {addFormFeedback && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: addFormFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: addFormFeedback.type === 'error' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.38)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem'
                }}
              >
                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.87rem' }}>{addFormFeedback.message}</p>
                {addFormFeedback.canAutoResize && (
                  <button
                    type="button"
                    onClick={handleAutoResizeAddPhoto}
                    disabled={isAutoResizingAdd}
                    style={{
                      marginTop: '0.55rem',
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#1d4ed8',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      borderRadius: '999px',
                      padding: '0.32rem 0.7rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isAutoResizingAdd ? 'Verkleinert...' : 'Bild automatisch verkleinern'}
                  </button>
                )}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 0' }} disabled={isAddSaving}>
              {isAddSaving ? 'Speichert...' : 'Speichern'}
            </button>
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
            whileHover={{ y: -10, scale: 1.015, boxShadow: '0 18px 36px rgba(90, 120, 30, 0.18)' }}
            transition={{ delay: index * 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'box-shadow 0.2s ease' }}
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
              <button
                onClick={() => handleDelete(cat.id)}
                title="Katze löschen"
                aria-label="Katze löschen"
                style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '50%' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{cat.name}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {cat.breed || 'Mischling'} • {sizeLabel[cat.size] || cat.size || 'mittel'} • Ziel: {cat.idealWeight} kg
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>Alter: <strong style={{ color: 'var(--text-primary)' }}>{cat.age} Jahre</strong></span>
                {editingCatId !== cat.id && (
                  <button
                    type="button"
                    onClick={() => openCatEditor(cat)}
                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', padding: '0.35rem 0.65rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem' }}
                  >
                    Profil bearbeiten
                  </button>
                )}
              </div>

              {editingCatId === cat.id && (
                <div style={{ marginTop: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)', padding: '0.8rem' }}>
                  <div
                    style={{
                      marginBottom: '0.65rem',
                      background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(14, 165, 233, 0.05))',
                      border: '1px solid rgba(14, 165, 233, 0.32)',
                      borderRadius: '10px',
                      padding: '0.62rem 0.78rem'
                    }}
                  >
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                      <strong>Größenhilfe:</strong> Klein = zierlich und feine Knochen, Mittel = normaler Körperbau, Groß = kräftiger Rahmen und breitere Brust.
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: '0.55rem' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={editingCatDraft.name}
                      onChange={(e) => setEditingCatDraft(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                      style={{ marginBottom: 0 }}
                    />
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      value={editingCatDraft.age}
                      onChange={(e) => setEditingCatDraft(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Alter"
                      style={{ marginBottom: 0 }}
                    />
                    <select
                      className="input-field"
                      value={editingCatDraft.breed}
                      onChange={(e) => setEditingCatDraft(prev => ({ ...prev, breed: e.target.value }))}
                      style={{ marginBottom: 0 }}
                    >
                      {Object.keys(BREED_BASE_WEIGHTS).map((breed) => (
                        <option key={breed} value={breed}>{breed}</option>
                      ))}
                    </select>
                    <select
                      className="input-field"
                      value={editingCatDraft.size}
                      onChange={(e) => setEditingCatDraft(prev => ({ ...prev, size: e.target.value }))}
                      style={{ marginBottom: 0 }}
                    >
                      <option value="klein">Klein</option>
                      <option value="mittel">Mittel</option>
                      <option value="gross">Groß</option>
                    </select>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Zielgewicht (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-field"
                        value={editingCatDraft.idealWeight}
                        onChange={(e) => setEditingCatDraft(prev => ({ ...prev, idealWeight: e.target.value }))}
                        style={{ marginBottom: 0 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Letztes Gewicht (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={editingCatDraft.currentWeight}
                        onChange={(e) => setEditingCatDraft(prev => ({ ...prev, currentWeight: e.target.value }))}
                        style={{ marginBottom: 0 }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn-primary" onClick={() => saveCatEditor(cat)} style={{ flex: 1 }} disabled={savingCatId === cat.id}>
                      {savingCatId === cat.id ? 'Speichert...' : 'Speichern'}
                    </button>
                    <button type="button" onClick={cancelCatEditor} style={{ flex: 1, background: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '10px', fontWeight: 600 }}>
                      Abbrechen
                    </button>
                  </div>
                  {catEditorFeedback?.catId === cat.id && (
                    <p style={{ marginTop: '0.6rem', marginBottom: 0, color: 'var(--danger)', fontWeight: 600, textAlign: 'center', fontSize: '0.84rem' }}>
                      {catEditorFeedback.message}
                    </p>
                  )}
                  {saveRewardCatId === cat.id && (
                    <p style={{ marginTop: '0.6rem', marginBottom: 0, color: 'var(--accent-primary)', fontWeight: 700, textAlign: 'center' }}>
                      Gespeichert! 😺
                    </p>
                  )}
                </div>
              )}
            </div>
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Letztes Gewicht:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                {cat.currentWeight !== null && cat.currentWeight !== undefined
                  ? `${parseFloat(cat.currentWeight).toFixed(2)} kg`
                  : 'Keine Daten'}
              </div>
            </div>

            {editingPhotoCatId === cat.id && (
              <div style={{ marginTop: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Foto ändern</h4>
                <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Wähle ein Icon oder lade ein eigenes Foto hoch.</p>
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
                  <button type="button" className="btn-primary" onClick={() => savePhotoEditor(cat)} style={{ flex: 1 }} disabled={savingPhotoCatId === cat.id}>
                    {savingPhotoCatId === cat.id ? 'Speichert...' : 'Speichern'}
                  </button>
                  <button type="button" onClick={cancelPhotoEditor} style={{ flex: 1, background: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', fontWeight: 600 }}>Abbrechen</button>
                </div>
                {photoEditorFeedback?.catId === cat.id && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <p style={{ margin: 0, color: photoEditorFeedback.type === 'error' ? 'var(--danger)' : 'var(--accent-primary)', fontWeight: 600, textAlign: 'center', fontSize: '0.84rem' }}>
                      {photoEditorFeedback.message}
                    </p>
                    {photoEditorFeedback.canAutoResize && (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleAutoResizeEditPhoto(cat.id)}
                          disabled={autoResizingPhotoCatId === cat.id}
                          style={{
                            marginTop: '0.5rem',
                            background: 'rgba(59, 130, 246, 0.12)',
                            color: '#1d4ed8',
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            borderRadius: '999px',
                            padding: '0.32rem 0.7rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {autoResizingPhotoCatId === cat.id ? 'Verkleinert...' : 'Bild automatisch verkleinern'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};

export default CatList;
