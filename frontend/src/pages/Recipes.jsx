import AnimatedPage from '../components/AnimatedPage';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const Recipes = () => {
  const navigate = useNavigate();

  const recipes = [
    { 
      title: 'Hühnchen-Gemüse-Mix', 
      type: 'Hauptmahlzeit', 
      prep: '20 Min', 
      calories: '150 kcal pro Portion',
      yield: 'Ergibt ca. 150g (1 Portion)',
      feedingAdvice: 'Kann als vollständige Hauptmahlzeit (1x täglich) gefüttert werden. Dafür 1 Beutel Nassfutter (ca. 85g) weglassen.',
      ingredients: ['100g Hühnerbrust', '50g Möhrenpüree', '1 Prise Taurin Suppl.'], 
      instructions: 'Hühnerbrust kochen und in feine Stücke zupfen. Mit Möhrenpüree mischen und leicht abkühlen lassen. Das Taurin erst kurz vor dem Servieren einmischen, um Nährstoffe zu erhalten.' 
    },
    { 
      title: 'Thunfisch-Happen', 
      type: 'Snack', 
      prep: '10 Min', 
      calories: '15 kcal pro Kugel',
      yield: 'Ergibt ca. 8-10 Kugeln',
      feedingAdvice: 'Ideal als Belohnung (max. 2-3 Kugeln pro Tag). An diesem Tag reguläre Industrie-Leckerlis oder Pasten komplett weglassen.',
      ingredients: ['50g Thunfisch (im eign. Saft)', '1 Ei', '1 EL Haferflocken'], 
      instructions: 'Thunfisch abtropfen lassen und mit Ei und 1 EL Haferflocken zu einem Brei zerdrücken. Kleine Kugeln rollen und entweder roh servieren oder kurz (5 Min bei 160°C) im Ofen andörren für mehr Biss.' 
    },
    { 
      title: 'Rinder-Power-Topf', 
      type: 'Hauptmahlzeit', 
      prep: '30 Min', 
      calories: '180 kcal pro Portion',
      yield: 'Ergibt ca. 150g (1 große Portion)',
      feedingAdvice: 'Sehr nahrhaft! Wenn diese Mahlzeit verfüttert wird, die Trockenfutter-Ration für denselben Tag halbieren.',
      ingredients: ['120g Rinderhack', '30g Zucchini', '1 TL Lachsöl'], 
      instructions: 'Rinderhack zusammen mit fein geriebener Zucchini in Wasser garen (kein Öl in die Pfanne). Nach dem Auskühlen ein paar Tropfen gesundes Lachsöl darübergießen.' 
    },
    { 
      title: 'Lachs-Schmaus', 
      type: 'Hauptmahlzeit', 
      prep: '15 Min', 
      calories: '160 kcal pro Portion',
      yield: 'Ergibt ca. 100g',
      feedingAdvice: 'Hervorragend als Sonntags-Mahlzeit. Ersetzt eine handelsübliche Dose Nassfutter (100g) vollständig.',
      ingredients: ['80g Lachsfilet (frisch)', '20g Spinat', 'Prise Katzenminze'], 
      instructions: 'Lachs leicht andünsten (Gräten entfernen!). Jungen Spinat hacken und untermengen. Eine kleine Prise Katzenminze darüberstreuen für die Extra-Motivation.' 
    },
    { 
      title: 'Kürbis-Puten-Diät', 
      type: 'Hauptmahlzeit', 
      prep: '25 Min', 
      calories: '120 kcal pro Portion',
      yield: 'Ergibt ca. 140g (1 Portion)',
      feedingAdvice: 'Sehr kalorienarm! Optimal zum Abnehmen. Kann eine Portion Nassfutter ersetzen, ohne dass die Katze hungert.',
      ingredients: ['100g Putenbrust', '40g Kürbispüree', '1 TL Mineralstoff-Zusatz'], 
      instructions: 'Pute in Wasser blanchieren. Ungewürzten Kürbis zu einem feinen Püree stampfen. Die Pute darin wenden und mit Vitamin-/Mineralstoff-Pulver anreichern.' 
    },
    { 
      title: 'Hüttenkäse-Leckerli', 
      type: 'Snack', 
      prep: '5 Min', 
      calories: '45 kcal pro Portion',
      yield: 'Ergibt ca. 2 Esslöffel',
      feedingAdvice: 'Zählt als "Schleck-Snack", als kleines Highlight am Wochenende. Keine weiteren Pasten/Leckerlis an diesem Tag.',
      ingredients: ['1 EL Hüttenkäse', '1 Eigelb', '1 TL Geriebene Karotte'], 
      instructions: 'Rohes Eigelb (Achtung frisch) vom Eiweiß trennen. Mit Hüttenkäse und ein ganz klein wenig feinster Karotte cremig schlagen. Ein perfekter Löffel-Snack für Zwischendurch!' 
    },
    { 
      title: 'Rinderbrühe-Jelly', 
      type: 'Snack (kühlend)', 
      prep: '45 Min', 
      calories: '10 kcal pro Würfel',
      yield: 'Ergibt ca. 10 Jelly-Würfel',
      feedingAdvice: 'Fast kalorienfrei. Dient der Feuchtigkeitszufuhr an heißen Tagen (1-3 Würfel). Kein anderes Futter muss gestrichen werden.',
      ingredients: ['200ml Rinderbrühe (ungewürzt)', '1 Blatt Gelatine', '20g Rindfleischfetzen'], 
      instructions: 'Klare, absolut ungewürzte, selbstgemachte Brühe aufkochen. Gelatine nach Packungsanweisung auflösen. Rindfleischfetzen hineinlegen und im Kühlschrank fest werden lassen. Perfekt für heiße Tage!' 
    }
  ];

  return (
    <AnimatedPage>
      <button
        type="button"
        onClick={() => navigate('/nutrition')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700 }}
      >
        <ArrowLeft size={18} /> Zurück zur Ernährungsauswahl
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyItems: 'center' }}>
        <h1>Gesunde Rezepte</h1>
        <span className="wink-cat" style={{ fontSize: '2.5rem' }}></span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Erweiterte Ernährungspläne und Zubereitungstipps zum Selberkochen. Gut zum Abnehmen!
        <span className="wagging-tail" style={{ marginLeft: '10px', fontSize: '1.2rem' }}>🐈</span>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {recipes.map((rec, i) => (
          <motion.div 
            key={i} 
            className="card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', background: 'var(--accent-primary)', color: '#506300', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                {rec.type}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                🕒 {rec.prep}
              </span>
            </div>
            
            <h3 style={{ marginTop: '0', marginBottom: '0.5rem' }}>{rec.title}</h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-primary)' }}>
                🔥 {rec.calories}
              </span>
              <span style={{ fontSize: '0.8rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-primary)' }}>
                ⚖️ {rec.yield}
              </span>
            </div>
            
            <div style={{ background: 'rgba(214, 240, 13, 0.15)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid var(--accent-primary)' }}>
              <h5 style={{ margin: '0 0 0.4rem 0', color: 'var(--text-secondary)' }}>Fütterungs-Tipp:</h5>
              <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {rec.feedingAdvice}
              </p>
            </div>
            
            <h5 style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Zutaten:</h5>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-primary)', marginTop: '0.2rem', fontSize: '0.90rem' }}>
              {rec.ingredients.map((ing, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{ing}</li>)}
            </ul>

            <h5 style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Zubereitung:</h5>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-color)', padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem', border: '1px solid var(--border-color)' }}>
              {rec.instructions}
            </p>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};
export default Recipes;
