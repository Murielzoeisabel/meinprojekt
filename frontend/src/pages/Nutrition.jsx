import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { ChefHat, Flame, FileText, Camera, HeartPulse, ShieldAlert, Milk, Bone, Sprout, Fish, PawPrint, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

void motion;

const Nutrition = () => {
  const navigate = useNavigate();
  const catAnimations = [
    { body: '#d89b5a', belly: '#f7d7b8', eye: '#1f2937', stripe: '#8b5a2b' },
    { body: '#9ca3af', belly: '#e5e7eb', eye: '#111827', stripe: '#4b5563' },
    { body: '#2f2f35', belly: '#d1d5db', eye: '#f9fafb', stripe: '#111827' },
    { body: '#f3e8cc', belly: '#fff7ed', eye: '#1f2937', stripe: '#c08457' }
  ];

  const AnimatedCat = ({ colors }) => (
    <motion.svg
      width="84"
      height="84"
      viewBox="0 0 100 100"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="50" cy="66" rx="26" ry="22" fill={colors.body} />
      <circle cx="50" cy="38" r="20" fill={colors.body} />
      <polygon points="33,20 28,4 40,14" fill={colors.body} />
      <polygon points="67,20 72,4 60,14" fill={colors.body} />
      <polygon points="33,18 31,7 38,13" fill={colors.belly} opacity="0.9" />
      <polygon points="67,18 69,7 62,13" fill={colors.belly} opacity="0.9" />
      <motion.path
        d="M 68 70 Q 90 60 80 40"
        stroke={colors.body}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        animate={{ rotate: [-15, 18, -15] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '68px 70px' }}
      />
      <circle cx="42" cy="36" r="3.8" fill={colors.eye} />
      <circle cx="58" cy="36" r="3.8" fill={colors.eye} />
      <path d="M 49 43 L 47 46 L 51 46 Z" fill="#f97393" />
      <path d="M 49 47 Q 46 50 43 50" stroke={colors.eye} strokeWidth="1.4" fill="none" />
      <path d="M 49 47 Q 52 50 55 50" stroke={colors.eye} strokeWidth="1.4" fill="none" />
      <line x1="32" y1="46" x2="18" y2="43" stroke={colors.stripe} strokeWidth="1.2" opacity="0.7" />
      <line x1="32" y1="49" x2="16" y2="49" stroke={colors.stripe} strokeWidth="1.2" opacity="0.7" />
      <line x1="68" y1="46" x2="82" y2="43" stroke={colors.stripe} strokeWidth="1.2" opacity="0.7" />
      <line x1="68" y1="49" x2="84" y2="49" stroke={colors.stripe} strokeWidth="1.2" opacity="0.7" />
    </motion.svg>
  );

  const menuItems = [
    { title: 'Ernährungspläne', description: 'Wöchentliche Vorlagen für eine Diät', path: '/meal-templates', icon: <FileText size={40} color="var(--accent-primary)" /> },
    { title: 'Rezepte', description: 'Gesunde Rezepte zum Selberkochen', path: '/recipes', icon: <ChefHat size={40} color="var(--accent-primary)" /> },
    { title: 'Futter-Analyse', description: 'Foto vom Etikett zur KI-Analyse hochladen', path: '/food-analyzer', icon: <Camera size={40} color="var(--accent-primary)" /> },
    { title: 'Kalorientracker', description: 'Tägliche Mahlzeiten eintragen & zählen', path: '/calories', icon: <Flame size={40} color="var(--accent-primary)" /> }
  ];

  const quickFacts = [
    {
      icon: <HeartPulse size={20} color="var(--accent-primary)" />,
      title: 'Wie viel Fleisch?',
      text: 'Als grobe Orientierung kann eine erwachsene Katze pro Tag etwa 70-100 kcal je kg Körpergewicht benötigen. Das entspricht je nach Energiegehalt oft etwa 150-250 g hochwertigem Nassfutter oder bei selbst zusammengestellter Ration einem großen tierischen Anteil. Nur Fleisch allein ist aber nicht vollwertig.'
    },
    {
      icon: <Flame size={20} color="var(--accent-primary)" />,
      title: 'Ist Trockenfutter gesund?',
      text: 'Trockenfutter ist nicht automatisch schlecht, aber oft energiedichter und weniger feucht als Nassfutter. Für viele Katzen ist Nassfutter vorteilhaft, weil es die Wasseraufnahme unterstützt. Trockenfutter lässt sich gut in einem Futterturm oder Fummelbrett einsetzen, damit die Katze langsamer frisst.'
    },
    {
      icon: <ShieldAlert size={20} color="var(--accent-primary)" />,
      title: 'Was ist giftig?',
      text: 'Giftig oder problematisch sind unter anderem Zwiebeln, Knoblauch, Lauch, Schokolade, Alkohol, Xylit, Trauben/Rosinen und stark gewürzte oder gesalzene Speisen. Auch Knochen können splittern und gefährlich werden.'
    }
  ];

  const healthyFoods = [
    {
      icon: <Fish size={18} color="#0f766e" />,
      title: 'Lachsöl',
      text: 'Kann in kleinen Mengen Omega-3-Fettsäuren liefern. Es ersetzt aber kein ausgewogenes Futter. Zu viel Öl kann Durchfall oder unnötige Kalorien bringen.'
    },
    {
      icon: <Sprout size={18} color="#15803d" />,
      title: 'Bierhefe',
      text: 'Wird oft als Ergänzung genutzt. Sie ist kein Wundermittel, kann aber in kleinen Mengen sinnvoll sein. Wichtig: nicht als Ersatz für ein vollständiges Futter.'
    },
    {
      icon: <Bone size={18} color="#92400e" />,
      title: 'Zusätze für selbstgekochtes Futter',
      text: 'Wenn du selbst kochst, braucht die Katze fast immer Taurin, Calcium und ein passendes Mineralstoff-/Vitaminpräparat. Reines Fleisch ist langfristig nicht ausreichend.'
    },
    {
      icon: <Milk size={18} color="#7c3aed" />,
      title: 'Milch?',
      text: 'Die meisten erwachsenen Katzen vertragen normale Kuhmilch schlecht. Besser ist frisches Wasser oder bei Bedarf speziell für Katzen geeignete Milchprodukte.'
    }
  ];

  const practicalTips = [
    'Mehrere kleine Mahlzeiten statt einer großen Portion helfen vielen Katzen beim Sättigungsgefühl.',
    'Für langsameres Fressen Trockenfutter in Futterspielzeug, Fummelbrettern oder Snackbällen anbieten.',
    'Nassfutter ist oft günstiger für die Wasseraufnahme und für viele Katzen im Alltag sinnvoller.',
    'Regelmäßig wiegen: Kleine Änderungen bei der Menge machen oft den größten Unterschied.',
    'Bei Übergewicht immer langsam abnehmen lassen - zu schnelles Abnehmen ist gefährlich.'
  ];

  const warningItems = [
    'Zwiebeln, Knoblauch, Lauch',
    'Schokolade, Kakao, Koffein',
    'Alkohol, Xylit, Nikotin',
    'Trauben, Rosinen',
    'Roher Hefeteig, stark gewürzte Speisen',
    'Gekochte Knochen und Fischgräten'
  ];

  return (
    <AnimatedPage>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyItems: 'center', flexWrap: 'wrap' }}>
        <h1>Ernährung</h1>
        <span className="wink-cat" style={{ fontSize: '2.5rem' }}></span>
      </div>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 0, maxWidth: '900px' }}>
          Alles rund um das gesunde Futter deiner Samtpfote gebündelt an einem Ort - mit Fokus auf ausgewogene Energie, viel Feuchtigkeit, wenig unnötige Kalorien und sichere Zutaten.
        </p>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(59, 130, 246, 0.08))', border: '1px solid rgba(16, 185, 129, 0.28)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.55rem' }}>
            <PawPrint size={22} color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>Die wichtigsten Grundlagen</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Katzen sind obligate Karnivoren: Sie brauchen vor allem tierisches Eiweiß, Taurin, Fett und ausreichend Wasser. Die beste Fütterung ist die, die zu Gewicht, Alter, Aktivität und Gesundheit deiner Katze passt.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {quickFacts.map((item) => (
          <motion.div
            key={item.title}
            className="card"
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'grid', gap: '0.6rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {item.icon}
              <h3 style={{ margin: 0 }}>{item.title}</h3>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.28)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <h3 style={{ marginTop: 0 }}>Gesunde Zutaten</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <li>Hochwertiges Fleisch oder vollständiges Nassfutter</li>
            <li>Wasserreiche Mahlzeiten</li>
            <li>Kleine Mengen Lachsöl</li>
            <li>Geruchsstarkes, aber ungewürztes Futter</li>
            <li>Ergänzungen nur gezielt und in kleinen Mengen</li>
          </ul>
        </div>

        <div className="card" style={{ border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <h3 style={{ marginTop: 0 }}>Worauf du achten solltest</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <li>Keine scharfen Gewürze oder Salz</li>
            <li>Kein rohes Schweinefleisch</li>
            <li>Keine Essensreste vom Menschen</li>
            <li>Gewicht regelmäßig kontrollieren</li>
            <li>Bei Krankheit oder Spezialbedarf Tierarzt fragen</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.06))', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.65rem' }}>
          <ShieldAlert size={20} color="#b45309" />
          <h3 style={{ margin: 0 }}>Giftig oder ungeeignet</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
          {warningItems.map((item) => (
            <span key={item} style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '999px', padding: '0.3rem 0.65rem', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Praktische Tipps für den Alltag</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem' }}>
          {practicalTips.map((tip, index) => (
            <div key={tip} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', background: 'var(--bg-color)', borderRadius: '12px', padding: '0.85rem', border: '1px solid var(--border-color)' }}>
              <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.14)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {index + 1}
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Wissenschaftlich sinnvoll: so denkst du über Portionen</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Ein pauschaler Grammbedarf ist bei Katzen nur grob sinnvoll, weil Energiegehalt und Wasseranteil stark schwanken. Als Orientierung gilt: Eine erwachsene Wohnungskatze braucht oft ungefähr 180-250 kcal pro Tag, je nach Körpergewicht, Aktivität und Zielgewicht. Bei selbst zusammengestelltem Futter solltest du nicht nur auf Fleischmenge schauen, sondern auf die ganze Ration.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.24)', borderRadius: '12px', padding: '0.85rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>Rohes Muskelfleisch</strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Nur als Teil einer vollwertigen Ration. Als grobe, praktische Orientierung landen viele selbstgekochte Pläne bei einer 4-kg-Katze oft bei etwa 100-150 g Muskelfleisch pro Tag, plus passendem Fett, Calcium, Taurin und Mikronährstoffen. Das ist kein Alleinfutter.
            </p>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.22)', borderRadius: '12px', padding: '0.85rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>Fertigfutter</strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Hochwertiges Alleinfutter ist oft die einfachste und sicherste Lösung, weil Mineralstoffe und Vitamine bereits passend enthalten sind.
            </p>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.09)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '0.85rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>Trockenfutter</strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Kann sinnvoll sein, wenn es in kleinen Mengen, als Beschäftigung oder im Futterturm angeboten wird. Wichtig ist, dass die Katze genug trinkt und die Tagesration kontrolliert bleibt.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.07))', border: '1px solid rgba(16, 185, 129, 0.22)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.6rem' }}>
          <ChevronRight size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0 }}>Für ein langes, gesundes Leben</h3>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Die beste Kombination ist meistens: viel Feuchtigkeit, hochwertige tierische Proteine, kontrollierte Portionen, langsames Abnehmen bei Übergewicht, genug Bewegung und keine unnötigen Snacks. Wenn deine Katze Vorerkrankungen hat oder du selbst kochst, lass den Plan bitte tierärztlich oder ernährungsmedizinisch prüfen.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {menuItems.map((item, index) => (
          <motion.div 
            className="card" 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              scale: 1.05,
              y: -5,
              boxShadow: '0 20px 40px rgba(16,185,129,0.18)',
              backgroundColor: 'rgba(16,185,129,0.08)',
              borderColor: 'rgba(16,185,129,0.35)'
            }}
            onClick={() => navigate(item.path)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', border: '1px solid var(--border-color)', transition: 'background-color 0.2s ease, border-color 0.2s ease' }}
          >
            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '1.5rem', borderRadius: '50%', border: '2px solid var(--accent-primary)' }}>
              {item.icon}
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '96px' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <AnimatedCat colors={catAnimations[index % catAnimations.length]} />
              </motion.div>
            </div>
            <h3 style={{ margin: 0 }}>{item.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{item.description}</p>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};

export default Nutrition;
