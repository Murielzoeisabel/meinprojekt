import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { ChefHat, Flame, FileText, Camera, HeartPulse, ShieldAlert, Droplets, Scale, Clock3, Sparkles, ChevronRight, PawPrint, CheckCircle2, Search, AlertTriangle, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { recognize } from 'tesseract.js';
import './Nutrition.css';

const Nutrition = () => {
  const navigate = useNavigate();
  const [labelInput, setLabelInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState('');

  const menuItems = [
    { title: 'Ernährungspläne', description: 'Wöchentliche Struktur für gesundes Abnehmen', path: '/meal-templates', icon: <FileText size={20} /> },
    { title: 'Rezepte', description: 'Herzliche, einfache Ideen für den Napf', path: '/recipes', icon: <ChefHat size={20} /> },
    { title: 'Kalorientracker', description: 'Portionen sauber dokumentieren', path: '/calories', icon: <Flame size={20} /> },
  ];

  const keyPrinciples = [
    {
      icon: <HeartPulse size={20} color="var(--accent-primary)" />,
      title: 'Protein zuerst',
      text: 'Katzen brauchen hochwertiges tierisches Eiweiß als Basis. Ein Alleinfutter mit klarem Fleischanteil ist für den Alltag meist die sicherste Option.'
    },
    {
      icon: <Droplets size={20} color="var(--accent-primary)" />,
      title: 'Feuchtigkeit schützt',
      text: 'Nassfutter hilft vielen Katzen, genug Flüssigkeit aufzunehmen. Das unterstützt Harnwege und sättigt oft besser bei weniger Kalorien.'
    },
    {
      icon: <Scale size={20} color="var(--accent-primary)" />,
      title: 'Portionen mit Plan',
      text: 'Abnehmen klappt am besten mit kleinen, konstanten Schritten. Wiege 1x pro Woche und passe die Ration nur fein an.'
    },
    {
      icon: <Clock3 size={20} color="var(--accent-primary)" />,
      title: 'Rhythmus beruhigt',
      text: 'Mehrere kleine Mahlzeiten sind für viele Katzen ruhiger als eine große Portion. Das stabilisiert Hunger und Aktivität im Alltag.'
    }
  ];

  const qualityChecks = [
    'Auf der Verpackung sollte klar „Alleinfuttermittel“ stehen (nicht nur „Ergänzungsfuttermittel“).',
    'Die Zutatenliste sollte nachvollziehbar sein, z. B. konkret benanntes Fleisch statt sehr vager Sammelbegriffe.',
    'Ein hoher tierischer Proteinanteil ist bei Katzen wichtiger als viele pflanzliche Füllstoffe.',
    'Zuckerzusätze haben in Katzenfutter keinen ernährungsphysiologischen Mehrwert und sind eher ein Warnsignal.',
    'Getreidefrei ist nicht automatisch besser, kann aber bei empfindlichen Katzen sinnvoll sein. Entscheidend ist die Gesamtqualität.',
  ];

  const labelHints = [
    'Achte auf klare Deklaration statt Marketing-Begriffe wie „Premium“ oder „natürlich“ ohne genaue Inhaltsangaben.',
    'Prüfe, ob Taurin ergänzt ist und ob das Produkt als vollwertiges Futter für den Alltag gedacht ist.',
    'Bei sensiblen Katzen sind kurze Zutatenlisten oft leichter zu beurteilen.',
    'Die KI-Futteranalyse kann Etiketten schnell vorstrukturieren, ersetzt aber keine tierärztliche Diagnose.',
  ];

  const stages = [
    { stage: 'Kitten (bis 12 Monate)', focus: 'Wachstum', energy: 'ca. 90-120 kcal/kg', note: 'Energie- und nährstoffdicht, mehrere kleine Mahlzeiten.' },
    { stage: 'Erwachsen', focus: 'Gewicht halten', energy: 'ca. 60-80 kcal/kg', note: 'Konstante Routine, viel Wasser, Portionskontrolle.' },
    { stage: 'Senior', focus: 'Muskeln erhalten', energy: 'ca. 55-75 kcal/kg', note: 'Gut verdauliches Protein, regelmäßige Checks beim Tierarzt.' },
    { stage: 'Übergewicht', focus: 'Schonend abnehmen', energy: 'individuell reduzieren', note: 'Langsam reduzieren, Aktivität erhöhen, Verlauf dokumentieren.' },
  ];

  const transitionSteps = [
    'Tag 1-2: 75% bisheriges Futter + 25% neues Futter',
    'Tag 3-4: 50% bisheriges Futter + 50% neues Futter',
    'Tag 5-6: 25% bisheriges Futter + 75% neues Futter',
    'Ab Tag 7: 100% neues Futter, wenn gut vertragen',
  ];

  const warningItems = [
    'Zwiebeln, Knoblauch, Lauch',
    'Schokolade, Kakao, Koffein',
    'Alkohol, Xylit, Nikotin',
    'Trauben, Rosinen',
    'Roher Hefeteig, stark gewürzte Speisen',
    'Gekochte Knochen und Fischgräten',
  ];

  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  const buildAnalysis = (rawText) => {
    const text = rawText.trim().toLowerCase();
    if (!text) {
      return null;
    }

    const ingredientRiskWords = ['zucker', 'karamell', 'sirup', 'melasse', 'getreide', 'weizen', 'mais', 'nebenerzeugnisse'];
    const parsedIngredients = rawText
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({
        name: item,
        flagged: ingredientRiskWords.some((word) => item.toLowerCase().includes(word)),
      }));

    let score = 55;
    const positives = [];
    const warnings = [];

    const hasAny = (list) => list.some((word) => text.includes(word));

    if (text.includes('alleinfuttermittel')) {
      score += 18;
      positives.push('Als Alleinfuttermittel gekennzeichnet.');
    } else {
      warnings.push('Nicht klar als Alleinfuttermittel erkennbar.');
    }

    if (hasAny(['taurin'])) {
      score += 10;
      positives.push('Taurin ist explizit genannt.');
    } else {
      warnings.push('Taurin wird nicht klar genannt.');
    }

    if (hasAny(['huhn', 'pute', 'truthahn', 'rind', 'lachs', 'fleisch'])) {
      score += 10;
      positives.push('Tierische Proteinquellen sind erkennbar.');
    }

    if (hasAny(['zucker', 'karamell', 'sirup', 'melasse'])) {
      score -= 24;
      warnings.push('Enthält Zucker oder zuckerähnliche Zusätze.');
    }

    if (hasAny(['getreide', 'weizen', 'mais'])) {
      score -= 10;
      warnings.push('Getreide enthalten: nicht automatisch schlecht, aber bei empfindlichen Katzen prüfen.');
    }

    if (hasAny(['nebenerzeugnisse']) && !hasAny(['hühnernebenerzeugnisse', 'rindernebenerzeugnisse'])) {
      score -= 12;
      warnings.push('Sehr allgemeine Deklaration von Nebenerzeugnissen.');
    }

    if (hasAny(['ohne zucker', 'zuckerfrei'])) {
      score += 6;
      positives.push('Zuckerfrei deklariert.');
    }

    score = Math.max(0, Math.min(100, score));

    let verdict = 'Verbesserungsfähig';
    let tone = 'warn';
    if (score >= 75) {
      verdict = 'Sehr solide Auswahl';
      tone = 'good';
    } else if (score >= 55) {
      verdict = 'In Ordnung mit Blick auf Details';
      tone = 'ok';
    }

    return { score, positives, warnings, verdict, tone, ingredients: parsedIngredients };
  };

  const runLabelAnalysis = () => {
    setAnalysis(buildAnalysis(labelInput));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setOcrError('Bitte eine Bilddatei hochladen (z. B. JPG oder PNG).');
      return;
    }

    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setUploadedImageUrl(nextUrl);
    setOcrError('');
    setOcrLoading(true);
    setOcrProgress(0);

    try {
      const result = await recognize(file, 'deu+eng', {
        logger: (message) => {
          if (message.status === 'recognizing text' && typeof message.progress === 'number') {
            setOcrProgress(Math.round(message.progress * 100));
          }
        },
      });

      const extracted = result.data.text.replace(/\s+/g, ' ').trim();
      if (!extracted) {
        setOcrError('Kein lesbarer Text erkannt. Bitte Foto schärfer aufnehmen oder manuell einfügen.');
        setAnalysis(null);
        return;
      }

      setLabelInput(extracted);
      setAnalysis(buildAnalysis(extracted));
    } catch {
      setOcrError('Die Texterkennung ist fehlgeschlagen. Du kannst die Inhaltsstoffe weiterhin manuell einfügen.');
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="nutrition-hero">
        <div>
          <h1>Ernährung mit Herz</h1>
          <p>
            Damit deine Samtpfote gesund, satt und zufrieden bleibt: hier findest du klare Grundlagen,
            alltagstaugliche Orientierung und liebevolle Hilfe für jeden Napf-Moment.
          </p>
        </div>
        <span className="wink-cat nutrition-wink" />
      </div>

      <div className="card nutrition-quicknav">
        <div className="nutrition-quicknav-head">
          <Sparkles size={18} />
          <h3>Direkt weiter zu den Tools</h3>
        </div>
        <div className="nutrition-tool-grid">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.path}
              type="button"
              className="nutrition-tool"
              onClick={() => navigate(item.path)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -3 }}
            >
              <span>{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="card nutrition-love-note">
        <div>
          <PawPrint size={20} color="var(--accent-primary)" />
          <h3>Ein liebevoller Grundsatz</h3>
        </div>
        <p>
          Die beste Ernährung ist nicht perfekt, sondern passend: zu Alter, Aktivität, Gesundheit und Vorlieben deiner Katze.
          Kleine, konstante Schritte sind wichtiger als harte Umstellungen.
        </p>
      </div>

      <div className="card nutrition-quality">
        <div className="nutrition-quality-head">
          <Search size={18} color="var(--accent-primary)" />
          <h3>Woran erkennt man gutes Katzenfutter?</h3>
        </div>
        <p>
          Kurz gesagt: auf Deklaration, Proteinqualität und unnötige Zusätze achten. Zuckerzusätze sind kein Pluspunkt,
          und „getreidefrei“ ist nur dann sinnvoll, wenn die Gesamtzusammensetzung stimmt.
        </p>
        <div className="nutrition-quality-grid">
          <div className="nutrition-quality-list">
            {qualityChecks.map((point) => (
              <div key={point}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>{point}</span>
              </div>
            ))}
          </div>
          <div className="nutrition-quality-list">
            {labelHints.map((point) => (
              <div key={point}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="nutrition-analyzer">
          <p className="nutrition-upload-hint">
            <Sparkles size={16} />
            <span>Hier kannst du dein Katzenfutter testen: Foto hochladen oder Zutaten unten einfügen.</span>
          </p>

          <div className="nutrition-upload-row">
            <label htmlFor="label-photo" className="nutrition-upload-btn">
              <Camera size={16} />
              Foto vom Etikett hochladen
            </label>
            <input
              id="label-photo"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {ocrLoading && (
              <span className="nutrition-upload-status">Texterkennung läuft: {ocrProgress}%</span>
            )}
          </div>

          {uploadedImageUrl && (
            <div className="nutrition-upload-preview-wrap">
              <img src={uploadedImageUrl} alt="Hochgeladenes Futteretikett" className="nutrition-upload-preview" />
            </div>
          )}

          {ocrError && <p className="nutrition-ocr-error">{ocrError}</p>}

          <label htmlFor="label-input">Zutaten oder Etikett-Text einfügen</label>
          <textarea
            id="label-input"
            value={labelInput}
            onChange={(event) => setLabelInput(event.target.value)}
            placeholder="Beispiel: Alleinfuttermittel, Huhn 65%, Brühe, Taurin, Mineralstoffe"
          />

          <div className="nutrition-analyzer-actions">
            <button
              type="button"
              className="nutrition-analyzer-btn"
              onClick={runLabelAnalysis}
            >
              Absenden
            </button>
          </div>

          {analysis && (
            <div className={`nutrition-analyzer-result nutrition-analyzer-${analysis.tone}`}>
              <div className="nutrition-analyzer-head">
                {analysis.tone === 'good' ? <BadgeCheck size={18} /> : <AlertTriangle size={18} />}
                <strong>{analysis.verdict}</strong>
                <span className={`nutrition-ampel nutrition-ampel-${analysis.tone}`}>
                  Ampel: {analysis.tone === 'good' ? 'Grün' : analysis.tone === 'ok' ? 'Gelb' : 'Rot'}
                </span>
                <span>Score: {analysis.score}/100</span>
              </div>

              <div className="nutrition-analyzer-columns">
                <div>
                  <h4>Positiv</h4>
                  <ul>
                    {analysis.positives.length > 0 ? analysis.positives.map((item) => <li key={item}>{item}</li>) : <li>Keine klaren Pluspunkte erkannt.</li>}
                  </ul>
                </div>
                <div>
                  <h4>Bitte prüfen</h4>
                  <ul>
                    {analysis.warnings.length > 0 ? analysis.warnings.map((item) => <li key={item}>{item}</li>) : <li>Keine offensichtlichen Warnsignale erkannt.</li>}
                  </ul>
                </div>
              </div>

              {analysis.ingredients.length > 0 && (
                <div className="nutrition-ingredient-list">
                  <h4>Erkannte Zutatenliste</h4>
                  <div>
                    {analysis.ingredients.map((ingredient) => (
                      <span key={ingredient.name} className={ingredient.flagged ? 'ingredient-flagged' : 'ingredient-ok'}>
                        {ingredient.name}
                      </span>
                    ))}
                  </div>
                  <small>Rot markiert = bitte besonders prüfen (z. B. Zucker, Getreide, unklare Nebenerzeugnisse).</small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="nutrition-cook-vs-buy">
        <div className="card nutrition-compare-card">
          <h3>Gekauftes oder selbstgekochtes Futter?</h3>
          <p>
            Für die meisten Haushalte ist hochwertiges Alleinfutter die stabilste Basis, weil Nährstoffe bereits ausgewogen enthalten sind.
            Selbstgekochtes kann eine tolle Ergänzung sein, braucht aber eine genaue Planung.
          </p>
          <div className="nutrition-compare-grid">
            <div>
              <h4>Gekauftes Alleinfutter</h4>
              <ul>
                <li>Im Alltag meist am sichersten und am einfachsten.</li>
                <li>Nährstoffprofil ist in der Regel vollständig.</li>
                <li>Gut für konstante Gewichtssteuerung und Routine.</li>
              </ul>
            </div>
            <div>
              <h4>Selbstgekocht</h4>
              <ul>
                <li>Gut bei speziellen Bedürfnissen oder hoher Akzeptanz.</li>
                <li>Nur sinnvoll mit vollständigem Supplement-Plan.</li>
                <li>Ohne Ergänzungen langfristig riskant.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card nutrition-combo-card">
          <h3>Sinnvolle Kombination im Alltag</h3>
          <ul>
            <li>Als sichere Basis oft 80-90% hochwertiges Alleinfutter.</li>
            <li>Optional 10-20% selbstgekochte Mahlzeiten als Ergänzung, wenn sauber bilanziert.</li>
            <li>Eine feste „1x pro Woche selbstgekocht“-Routine ist okay, wenn diese Mahlzeit korrekt ergänzt wird.</li>
          </ul>
          <p>
            Wenn du nur selbstgekocht fütterst, sind Ergänzungen wie Taurin, Calcium, Jod sowie passende Vitamin- und Mineralstoffmischungen in der Regel Pflicht.
            Die genaue Dosierung sollte tierärztlich oder ernährungsmedizinisch berechnet werden.
          </p>
        </div>
      </div>

      <div className="nutrition-principles">
        {keyPrinciples.map((item) => (
          <motion.div
            key={item.title}
            className="card"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'grid', gap: '0.6rem', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {item.icon}
              <h3 style={{ margin: 0 }}>{item.title}</h3>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="card nutrition-stage-table">
        <h3>Orientierung nach Lebensphase</h3>
        <p>
          Die Angaben sind Richtwerte und ersetzen keine individuelle tierärztliche Beratung.
        </p>
        <div className="nutrition-stage-grid">
          {stages.map((row) => (
            <div key={row.stage} className="nutrition-stage-row">
              <strong>{row.stage}</strong>
              <span>{row.focus}</span>
              <span>{row.energy}</span>
              <span>{row.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nutrition-duo">
        <div className="card">
          <h3>Futterumstellung ohne Stress</h3>
          <ul>
            {transitionSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="card nutrition-formula">
          <h3>Abnehmen in sicherem Tempo</h3>
          <p>
            Als praktische Leitlinie gilt oft ein Gewichtsverlust von etwa 0,5-2% pro Woche.
            Schneller ist bei Katzen riskant.
          </p>
          <div>
            <span>Ziel pro Woche</span>
            <strong>aktuelles Gewicht x 0,005 bis 0,02</strong>
          </div>
        </div>
      </div>

      <div className="card nutrition-warning">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.65rem' }}>
          <ShieldAlert size={20} color="#b45309" />
          <h3 style={{ margin: 0 }}>Giftig oder ungeeignet</h3>
        </div>
        <div className="nutrition-warning-chips">
          {warningItems.map((item) => (
            <span key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="card nutrition-closing">
        <div>
          <ChevronRight size={18} color="var(--accent-primary)" />
          <h3>Für ein langes, gesundes Katzenleben</h3>
        </div>
        <p>
          Du machst schon viel richtig, wenn du regelmäßig beobachtest, dokumentierst und bei Unsicherheit früh nachfragst.
          Mit einem liebevollen, klaren Plan wird Ernährung für euch beide einfacher.
        </p>
      </div>
    </AnimatedPage>
  );
};

export default Nutrition;
