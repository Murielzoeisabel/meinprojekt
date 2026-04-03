import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';
import { getCats, addCalories } from '../services/api';

const Fitness = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [quickAddMessage, setQuickAddMessage] = useState('');

  useEffect(() => {
    getCats().then(data => {
      setCats(data);
      if (data.length > 0) setSelectedCatId(data[0].id.toString());
    });
  }, []);

  const selectedCat = cats.find(cat => cat.id.toString() === selectedCatId);
  
  // Kalorienbasis für 4kg Katze - angepasst after Katzengewicht
  const adjustCalories = (baseCals) => {
    if (!selectedCat || !selectedCat.currentWeight) return baseCals;
    const catWeight = selectedCat.currentWeight || selectedCat.idealWeight;
    const baseWeight = 4;
    const adjustment = (catWeight / baseWeight);
    return Math.round(baseCals * adjustment);
  };

  const handleQuickAddCalories = async (exercise) => {
    if (!selectedCatId) return;

    const burned = adjustCalories(exercise.cals);
    await addCalories({ catId: selectedCatId, burned });
    setQuickAddMessage(`-${burned} kcal für ${exercise.title} hinzugefügt.`);
    setTimeout(() => setQuickAddMessage(''), 2200);
  };

  const exercises = [
    { 
      id: 'laser',
      title: 'Laser Pointer Jagd', 
      mins: 15, 
      cals: 45, 
      desc: 'Fördert intensive Sprints und schnelle Richtungswechsel.',
      tips: 'Tipp: Variiere die Geschwindigkeit, lass die Katze immer wieder "gewinnen"!'
    },
    { 
      id: 'feather',
      title: 'Spielen mit der Angel', 
      mins: 20, 
      cals: 55, 
      desc: 'Perfekt für Sprünge und Koordination, simuliert echte Jagd.',
      tips: 'Tipp: Nutze unterschiedliche Bewegungsmuster, um maximale Aktivität zu fördern.'
    },
    { 
      id: 'ball',
      title: 'Ballspiele', 
      mins: 10, 
      cals: 25, 
      desc: 'Mit Bällen oder Papierknäuel werfen und holen lassen.',
      tips: 'Tipp: Leichte Bälle nutzen und auf Bodenebene spielen.'
    },
    { 
      id: 'search',
      title: 'Verstecken & Suchen', 
      mins: 25, 
      cals: 40, 
      desc: 'Verstecke Leckerlies oder Spielzeug zum Aufspüren.',
      tips: 'Tipp: Trainiert den Verstand und die Nase – perfekt für mentale Auslastung!'
    },
    { 
      id: 'clicker',
      title: 'Clicker-Training', 
      mins: 10, 
      cals: 15, 
      desc: 'Mentale Auslastung und leichte Bewegung mit Trick-Training.',
      tips: 'Tipp: Kurze Sessions (5-10 min), dafür öfter trainieren.'
    },
    { 
      id: 'stairs',
      title: 'Treppenlaufen', 
      mins: 8, 
      cals: 35, 
      desc: 'Auf und ab laufen fördert Kraft und Ausdauer.',
      tips: 'Tipp: Mit Spielzeug oben locken, damit die Katze hochjagt!'
    },
    { 
      id: 'featherwand',
      title: 'Feather Wand Sessions', 
      mins: 15, 
      cals: 50, 
      desc: 'Mit Federn spielen – sehr effektiv bei Sprungtraining.',
      tips: 'Tipp: Realistische Flugbewegungen nachahmen, mehrere Pausen machen.'
    },
    { 
      id: 'toys',
      title: 'Interactive Toys', 
      mins: 12, 
      cals: 30, 
      desc: 'Automatische oder interaktive Spielzeuge für selbstständiges Spiel.',
      tips: 'Tipp: Mit Bewegungsmelder große Effekte bei geringem Aufwand!'
    }
  ];

  // Laser Pointer: Katze folgt rotem Punkt
  const LaserAnimation = ({ isHovered }) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Laser dot - large and glowing */}
      <motion.div
        style={{
          position: 'absolute',
          width: '14px',
          height: '14px',
          background: 'var(--accent-secondary)',
          borderRadius: '50%',
          boxShadow: '0 0 16px rgba(159, 203, 69, 0.55), 0 0 28px rgba(214, 236, 170, 0.55)',
          zIndex: 2
        }}
        animate={{ x: isHovered ? [0, 40, -40, 30, -30, 0] : [0, 20, -20, 0], y: isHovered ? [0, 30, -30, 20, -20, 0] : [0, 15, -15, 0] }}
        transition={{ duration: isHovered ? 3 : 4, repeat: Infinity }}
      />

      {/* Laser beam trail effect */}
      <motion.div
        style={{
          position: 'absolute',
          width: '20px',
          height: '20px',
          border: '2px solid rgba(159, 203, 69, 0.35)',
          borderRadius: '50%',
          zIndex: 1
        }}
        animate={{ x: isHovered ? [0, 40, -40, 30, -30, 0] : [0, 20, -20, 0], y: isHovered ? [0, 30, -30, 20, -20, 0] : [0, 15, -15, 0] }}
        transition={{ duration: isHovered ? 3 : 4, repeat: Infinity, delay: 0.1 }}
      />

      {/* Cat head following laser */}
      <motion.svg
        width="70"
        height="70"
        viewBox="0 0 100 100"
        animate={{
          x: isHovered ? [0, 40, -40, 30, -30, 0] : [0, 20, -20, 0],
          y: isHovered ? [10, 40, -20, 25, -15, 10] : [10, 25, -10, 10]
        }}
        transition={{ duration: isHovered ? 3 : 4, repeat: Infinity }}
      >
        <ellipse cx="50" cy="65" rx="28" ry="25" fill="var(--accent-primary)" />
        <circle cx="50" cy="40" r="20" fill="var(--accent-primary)" />
        <polygon points="35,20 30,5 40,15" fill="var(--accent-primary)" />
        <polygon points="65,20 70,5 60,15" fill="var(--accent-primary)" />
        <circle cx="42" cy="38" r="3" fill="var(--text-primary)" />
        <circle cx="58" cy="38" r="3" fill="var(--text-primary)" />
      </motion.svg>
    </div>
  );

  // Angel: Katze springt nach Federn
  const FeatherAnimation = ({ isHovered }) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Fishing rod/wand */}
      <motion.svg
        width="40"
        height="60"
        viewBox="0 0 40 60"
        style={{ position: 'absolute', top: '-15px', left: '-10px' }}
        animate={{ rotate: isHovered ? [-10, 20, 10, -10] : [-5, 10, 5, -5] }}
        transition={{ duration: isHovered ? 1.8 : 2.2, repeat: Infinity }}
      >
        {/* Rod */}
        <line x1="20" y1="0" x2="20" y2="40" stroke="var(--text-secondary)" strokeWidth="2" />
        {/* String */}
        <line x1="20" y1="40" x2="30" y2="55" stroke="var(--text-secondary)" strokeWidth="1" />
        {/* Feather decoration */}
        <text x="28" y="56" fontSize="12">🪶</text>
      </motion.svg>

      {/* Feather dangling */}
      <motion.div
        style={{ position: 'absolute', fontSize: '1.8rem' }}
        animate={{
          y: isHovered ? [-35, 10, -35] : [-25, 5, -25],
          x: isHovered ? [20, 35, 20] : [15, 25, 15],
          rotate: isHovered ? [0, 10, -10, 0] : [0, 5, -5, 0]
        }}
        transition={{ duration: isHovered ? 1.8 : 2.2, repeat: Infinity }}
      >
        🪶
      </motion.div>

      {/* Cat jumping */}
      <motion.svg width="70" height="70" viewBox="0 0 100 100" animate={{ y: isHovered ? [-25, 10, -25] : [-15, 5, -15] }} transition={{ duration: isHovered ? 1.8 : 2.2, repeat: Infinity }}>
        <ellipse cx="50" cy="65" rx="28" ry="25" fill="var(--accent-primary)" />
        <circle cx="50" cy="35" r="20" fill="var(--accent-primary)" />
        <polygon points="32,18 28,2 38,12" fill="var(--accent-primary)" />
        <polygon points="68,18 72,2 62,12" fill="var(--accent-primary)" />
        <circle cx="42" cy="33" r="3" fill="var(--text-primary)" />
        <circle cx="58" cy="33" r="3" fill="var(--text-primary)" />
      </motion.svg>
    </div>
  );

  // Ball: Katze springt nach Ball
  const BallAnimation = ({ isHovered }) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Ball - visible in front and bouncing */}
      <motion.div
        style={{ position: 'absolute', fontSize: '1.5rem', zIndex: 3 }}
        animate={{
          y: isHovered ? [-40, 5, -40] : [-30, 0, -30],
          x: isHovered ? [0, 25, -25, 0] : [0, 18, -18, 0]
        }}
        transition={{ duration: isHovered ? 1.8 : 2.5, repeat: Infinity }}
      >
        🔵
      </motion.div>

      {/* Cat jumping to catch ball */}
      <motion.svg width="70" height="70" viewBox="0 0 100 100" animate={{ y: isHovered ? [-20, 10, -20] : [-12, 5, -12] }} transition={{ duration: isHovered ? 1.8 : 2.5, repeat: Infinity }}>
        <ellipse cx="50" cy="65" rx="28" ry="25" fill="var(--accent-primary)" />
        <circle cx="50" cy="35" r="20" fill="var(--accent-primary)" />
        <polygon points="32,18 28,2 38,12" fill="var(--accent-primary)" />
        <polygon points="68,18 72,2 62,12" fill="var(--accent-primary)" />
        <circle cx="42" cy="30" r="4" fill="var(--text-primary)" />
        <circle cx="58" cy="30" r="4" fill="var(--text-primary)" />
      </motion.svg>
    </div>
  );

  // Search: Katze schnüffelt nach Leckerli unter Karton
  const SearchAnimation = ({ isHovered }) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Treasure/treat visible peeking */}
      <motion.div style={{ position: 'absolute', bottom: '35px', fontSize: '1rem' }} animate={{ opacity: isHovered ? [0.3, 1, 0.3] : [0.2, 0.8, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }}>
        🍖
      </motion.div>

      {/* Box covering treasure */}
      <motion.svg width="50" height="40" viewBox="0 0 50 40" style={{ position: 'absolute', bottom: '20px', zIndex: 2 }}>
        <rect x="5" y="10" width="40" height="25" rx="4" fill="rgba(159, 203, 69, 0.18)" stroke="var(--accent-primary)" strokeWidth="1.5" />
        {/* Box lines/details */}
        <line x1="5" y1="20" x2="45" y2="20" stroke="var(--accent-secondary)" strokeWidth="1" opacity="0.75" />
      </motion.svg>

      {/* Cat sniffing and bending down */}
      <motion.svg width="70" height="70" viewBox="0 0 100 100" animate={{ y: isHovered ? [0, 8, 0] : [0, 5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
        <ellipse cx="50" cy="65" rx="28" ry="25" fill="var(--accent-primary)" />
        <motion.circle cx="50" cy="38" r="20" fill="var(--accent-primary)" animate={{ y: isHovered ? [5, 12, 5] : [3, 7, 3] }} transition={{ duration: 1.2, repeat: Infinity }} />
        <polygon points="32,20 28,5 38,13" fill="var(--accent-primary)" />
        <polygon points="68,20 72,5 62,13" fill="var(--accent-primary)" />
        <circle cx="42" cy="35" r="3" fill="var(--text-primary)" />
        <circle cx="58" cy="35" r="3" fill="var(--text-primary)" />
        {/* Sniffing nose */}
        <motion.circle cx="50" cy="48" r="4" fill="var(--text-primary)" animate={{ scaleX: isHovered ? [1, 1.3, 1] : [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
      </motion.svg>
    </div>
  );

  // Clicker: Hand klickt einen Trainingsclicker neben der Katze
  const ClickerAnimation = ({ isHovered }) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Human hand with clicker */}
      <motion.svg
        width="84"
        height="84"
        viewBox="0 0 100 100"
        style={{ position: 'absolute', left: '2px', top: '2px' }}
        animate={{ rotate: isHovered ? [-4, 8, -4] : [-2, 4, -2] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* color glow */}
        <motion.circle
          cx="62"
          cy="52"
          r="16"
          fill="var(--accent-secondary)"
          opacity="0.18"
          animate={{ scale: isHovered ? [0.95, 1.12, 0.95] : [0.9, 1.05, 0.9] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        {/* arm */}
        <rect x="18" y="44" width="26" height="12" rx="6" fill="var(--accent-secondary)" opacity="0.9" transform="rotate(-18 18 44)" />
        {/* hand */}
        <path d="M40 45 C46 40, 55 39, 61 43 L67 47 C69 48, 69 51, 67 52 L61 56 C55 60, 46 59, 40 54 Z" fill="var(--accent-primary)" opacity="0.9" />
        {/* finger pressing */}
        <path d="M55 43 L62 36 C64 34, 67 35, 68 38 C69 40, 68 43, 66 45 L60 50" fill="none" stroke="var(--accent-secondary)" strokeWidth="8" strokeLinecap="round" />
        {/* clicker base */}
        <rect x="58" y="49" width="14" height="10" rx="4" fill="var(--accent-primary)" />
        <rect x="60" y="51" width="10" height="2.5" rx="1.25" fill="rgba(255,255,255,0.45)" />
        <circle cx="65" cy="54" r="2.2" fill="var(--surface-color)" opacity="0.85" />
        {/* click sound lines */}
        <motion.path d="M72 47 L80 42" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" animate={{ opacity: isHovered ? [0.3, 1, 0.3] : [0.2, 0.8, 0.2] }} transition={{ duration: 0.6, repeat: Infinity }} />
        <motion.path d="M73 53 L82 53" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" animate={{ opacity: isHovered ? [0.3, 1, 0.3] : [0.2, 0.8, 0.2] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} />
      </motion.svg>

      {/* Cat sitting alert */}
      <motion.svg width="70" height="70" viewBox="0 0 100 100">
        <ellipse cx="50" cy="70" rx="25" ry="20" fill="var(--accent-primary)" />
        <circle cx="50" cy="38" r="20" fill="var(--accent-primary)" />
        
        {/* Ears perked up */}
        <motion.polygon points="32,18 28,0 38,12" fill="var(--accent-primary)" animate={{ rotate: isHovered ? [-10, 10, -10] : [-5, 5, -5] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ transformOrigin: '32px 18px' }} />
        <motion.polygon points="68,18 72,0 62,12" fill="var(--accent-primary)" animate={{ rotate: isHovered ? [10, -10, 10] : [5, -5, 5] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ transformOrigin: '68px 18px' }} />
        
        <circle cx="42" cy="36" r="3" fill="var(--text-primary)" />
        <circle cx="58" cy="36" r="3" fill="var(--text-primary)" />
        <path d="M 50 42 L 48 45 L 52 45" stroke="var(--text-primary)" strokeWidth="1.5" fill="none" />
      </motion.svg>
    </div>
  );

  // Stairs: Katze läuft die Treppe hoch
  const StairsAnimation = ({ isHovered }) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', paddingBottom: '10px', paddingLeft: '15px' }}>
      {/* Full Staircase */}
      <div style={{ position: 'absolute', bottom: '10px', left: '15px', display: 'flex', gap: '0px' }}>
        {[0, 1, 2, 3].map((i) => {
          const width = 12;
          const height = 12 + i * 10;
          return (
            <div
              key={i}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                background: 'rgba(16, 185, 129, 0.4)',
                border: '1px solid var(--accent-primary)',
                borderTop: 'none'
              }}
            />
          );
        })}
      </div>

      {/* Cat climbing stairs with trophy at top */}
      <motion.div style={{ position: 'absolute', bottom: '55px', left: '65px', fontSize: '1.2rem' }} animate={{ opacity: isHovered ? 1 : 0.7 }}>
        🏆
      </motion.div>

      {/* Cat jumping up stairs */}
      <motion.svg
        width="60"
        height="60"
        viewBox="0 0 100 100"
        animate={{
          x: isHovered ? [0, 12, 24, 36, 0] : [0, 8, 16, 24, 0],
          y: isHovered ? [25, 10, -5, -20, 25] : [15, 5, -5, -15, 15]
        }}
        transition={{ duration: isHovered ? 2 : 2.8, repeat: Infinity }}
      >
        <ellipse cx="50" cy="65" rx="25" ry="20" fill="var(--accent-primary)" />
        <circle cx="50" cy="38" r="18" fill="var(--accent-primary)" />
        <polygon points="35,20 31,5 41,13" fill="var(--accent-primary)" />
        <polygon points="65,20 69,5 59,13" fill="var(--accent-primary)" />
      </motion.svg>
    </div>
  );

  // Feather Wand: Federn an Wand, Katze springt dran
  const FeatherWandAnimation = ({ isHovered }) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Wall with feathers */}
      <div
        style={{
          position: 'absolute',
          right: '10px',
          top: 0,
          bottom: 0,
          width: '15px',
          background: 'rgba(100, 100, 100, 0.2)',
          borderLeft: '2px solid rgba(100, 100, 100, 0.4)'
        }}
      />

      {/* Feathers on wall */}
      <motion.div
        style={{ position: 'absolute', right: '12px', top: '15px', fontSize: '1.2rem' }}
        animate={{ x: isHovered ? [0, 2, -2, 0] : [0, 1, -1, 0], rotateZ: isHovered ? [0, 5, -5, 0] : [0, 3, -3, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      >
        🪶
      </motion.div>
      <motion.div
        style={{ position: 'absolute', right: '12px', top: '45px', fontSize: '1.2rem' }}
        animate={{ x: isHovered ? [0, -2, 2, 0] : [0, -1, 1, 0], rotateZ: isHovered ? [0, -5, 5, 0] : [0, -3, 3, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        🪶
      </motion.div>
      <motion.div
        style={{ position: 'absolute', right: '12px', top: '75px', fontSize: '1.2rem' }}
        animate={{ x: isHovered ? [0, 2, -2, 0] : [0, 1, -1, 0], rotateZ: isHovered ? [0, 5, -5, 0] : [0, 3, -3, 0] }}
        transition={{ duration: 0.7, repeat: Infinity }}
      >
        🪶
      </motion.div>

      {/* Cat jumping and reaching for feathers */}
      <motion.svg
        width="70"
        height="70"
        viewBox="0 0 100 100"
        animate={{
          x: isHovered ? [-15, 10, -15] : [-10, 5, -10],
          y: isHovered ? [0, -20, 0] : [0, -12, 0]
        }}
        transition={{ duration: isHovered ? 2 : 2.5, repeat: Infinity }}
      >
        <ellipse cx="50" cy="65" rx="28" ry="25" fill="var(--accent-primary)" />
        <circle cx="50" cy="35" r="20" fill="var(--accent-primary)" />
        <polygon points="32,18 28,2 38,12" fill="var(--accent-primary)" />
        <polygon points="68,18 72,2 62,12" fill="var(--accent-primary)" />
        <circle cx="42" cy="33" r="3" fill="var(--text-primary)" />
        <circle cx="58" cy="33" r="3" fill="var(--text-primary)" />
      </motion.svg>
    </div>
  );

  // Interactive Toys: Automatisches Spielzeug
  const ToysAnimation = ({ isHovered }) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Interactive Toy Device - Wand with motion sensor */}
      <motion.svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        style={{ position: 'absolute', top: '10px' }}
        animate={{ rotate: isHovered ? [0, 10, -10, 0] : [0, 5, -5, 0] }}
        transition={{ duration: isHovered ? 1.2 : 1.8, repeat: Infinity }}
      >
        {/* Base */}
        <rect x="18" y="30" width="14" height="12" rx="3" fill="rgba(159, 203, 69, 0.2)" stroke="var(--accent-primary)" strokeWidth="1" />
        {/* Rod */}
        <line x1="25" y1="30" x2="25" y2="5" stroke="var(--accent-secondary)" strokeWidth="2" />
        {/* Toy ball at end */}
        <circle cx="25" cy="5" r="6" fill="var(--accent-primary)" />
        {/* Motion lines */}
        <motion.line x1="20" y1="5" x2="10" y2="5" stroke="var(--accent-primary)" strokeWidth="1" opacity="0.45" animate={{ x: isHovered ? [0, -5] : [0, -3] }} transition={{ duration: isHovered ? 1.2 : 1.8, repeat: Infinity }} />
        <motion.line x1="30" y1="5" x2="40" y2="5" stroke="var(--accent-secondary)" strokeWidth="1" opacity="0.45" animate={{ x: isHovered ? [0, 5] : [0, 3] }} transition={{ duration: isHovered ? 1.2 : 1.8, repeat: Infinity }} />
      </motion.svg>

      {/* Cat playing with toy */}
      <motion.svg
        width="70"
        height="70"
        viewBox="0 0 100 100"
        animate={{
          x: isHovered ? [-20, 20, -20] : [-12, 12, -12],
          y: isHovered ? [5, -15, 5] : [3, -10, 3]
        }}
        transition={{ duration: isHovered ? 1.5 : 2.2, repeat: Infinity }}
      >
        <ellipse cx="50" cy="65" rx="28" ry="25" fill="var(--accent-primary)" />
        <circle cx="50" cy="35" r="20" fill="var(--accent-primary)" />
        <polygon points="32,18 28,2 38,12" fill="var(--accent-primary)" />
        <polygon points="68,18 72,2 62,12" fill="var(--accent-primary)" />
        <motion.circle cx="42" cy="33" r="4" fill="var(--text-primary)" animate={{ scale: isHovered ? [1, 1.3, 1] : [1, 1.2, 1] }} transition={{ duration: 0.4, repeat: Infinity }} />
        <motion.circle cx="58" cy="33" r="4" fill="var(--text-primary)" animate={{ scale: isHovered ? [1, 1.3, 1] : [1, 1.2, 1] }} transition={{ duration: 0.4, repeat: Infinity }} />
      </motion.svg>
    </div>
  );

  const getExerciseAnimation = (id, isHovered) => {
    switch (id) {
      case 'laser':
        return <LaserAnimation isHovered={isHovered} />;
      case 'feather':
        return <FeatherAnimation isHovered={isHovered} />;
      case 'ball':
        return <BallAnimation isHovered={isHovered} />;
      case 'search':
        return <SearchAnimation isHovered={isHovered} />;
      case 'clicker':
        return <ClickerAnimation isHovered={isHovered} />;
      case 'stairs':
        return <StairsAnimation isHovered={isHovered} />;
      case 'featherwand':
        return <FeatherWandAnimation isHovered={isHovered} />;
      case 'toys':
        return <ToysAnimation isHovered={isHovered} />;
      default:
        return null;
    }
  };

  return (
    <AnimatedPage>
      <h1>🎾 Fitness & Übungen</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Entdecke verschiedene Übungen, um deine Katze fit und gesund zu halten. Hover über eine Karte um die Übung animiert zu sehen!
      </p>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Katze auswählen:</h3>
        <select
          className="input-field"
          style={{ width: '250px', margin: 0 }}
          value={selectedCatId}
          onChange={(e) => setSelectedCatId(e.target.value)}
        >
          {cats.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name} ({cat.currentWeight || cat.idealWeight}kg)</option>
          ))}
        </select>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Wähle deine Katze aus, um den exakten Kalorienverbrauch pro Übung zu sehen.
        </p>
      </div>
      {quickAddMessage && (
        <p style={{ marginTop: '-1rem', marginBottom: '1.2rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          {quickAddMessage}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {exercises.map((ex, i) => (
          <motion.div
            key={i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              scale: 1.08,
              boxShadow: '0 20px 50px rgba(159, 203, 69, 0.18)',
              y: -10
            }}
            className="card"
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Animated background gradient */}
            {hoveredCard === i && (
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(159, 203, 69, 0.16) 0%, rgba(214, 236, 170, 0.08) 100%)',
                  pointerEvents: 'none'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}

            <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{ex.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                {ex.desc}
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                <span>⏱ {ex.mins} Min</span>
                <span>🔥 ~{adjustCalories(ex.cals)} kcal</span>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => handleQuickAddCalories(ex)}
                disabled={!selectedCatId}
                style={{ marginBottom: '1rem', width: '100%' }}
              >
                Schnell hinzufügen: -{adjustCalories(ex.cals)} kcal
              </button>

              <p
                style={{
                  fontSize: '0.85rem',
                  background: 'var(--bg-color)',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  marginBottom: '1.5rem',
                  fontStyle: 'italic',
                  borderLeft: '3px solid var(--accent-primary)'
                }}
              >
                {ex.tips}
              </p>

              {/* Exercise-specific Animation */}
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--surface-color) 0%, rgba(214, 236, 170, 0.2) 100%)',
                  height: '120px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid ' + (hoveredCard === i ? 'var(--accent-primary)' : 'var(--border-color)'),
                  overflow: 'hidden',
                  boxShadow: hoveredCard === i ? '0 0 20px rgba(159, 203, 69, 0.24)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {getExerciseAnimation(ex.id, hoveredCard === i)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <motion.div
        style={{
          marginTop: '3rem',
          background: 'var(--surface-color)',
          border: '2px solid var(--accent-primary)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'var(--text-secondary)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 style={{ color: 'var(--accent-primary)', marginTop: 0 }}>💡 Fitness-Tipps für Katzen</h3>
        <ul style={{ margin: '1rem 0', paddingLeft: '1.5rem' }}>
          <li>Starte mit 3-4 Trainingseinheiten pro Woche</li>
          <li>Kombiniere verschiedene Übungen für maximale Abwechslung</li>
          <li>Trainiere am besten morgens oder abends (natürliche Aktivitätszeiten)</li>
          <li>Achte auf ausreichend Wasser und Ruhepausen</li>
          <li>Nutze das Fitness-Tracking, um Fortschritte zu verfolgen 📊</li>
        </ul>
      </motion.div>
    </AnimatedPage>
  );
};

export default Fitness;
