import AnimatedPage from '../components/AnimatedPage';

const MealTemplates = () => {
  return (
    <AnimatedPage>
      <h1>Vorlagen: Ernährungspläne</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Strukturierte Wochendiäten für verschiedene Abnehmphasen.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--accent-primary)' }}>Phase 1: Sanfter Einstieg</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Geeignet für die ersten 2-4 Wochen. Keine drastische Kalorienkürzung.</p>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Morgens:</strong> 40g hochwertiges Nassfutter (proteinreich)</li>
            <li><strong>Mittags:</strong> Kein Trockenfutter stehen lassen! Ein kleiner Geflügel-Snack (5g) im Fummelbrett.</li>
            <li><strong>Abends:</strong> 40g Nassfutter + 1 TL lauwarmes Wasser für Sättigungsgefühl.</li>
          </ul>
        </div>
        
        <div className="card">
          <h3 style={{ color: '#f59e0b' }}>Phase 2: Aktive Gewichtsabnahme</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Die Erhaltungsphase. Nur anwenden, wenn Phase 1 etabliert ist.</p>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Morgens:</strong> 35g Nassfutter (getreidefrei)</li>
            <li><strong>Nachmittags:</strong> Jagdspiel mit der Angel (15 Min). Als Belohnung 2 Stück Trockenfleisch.</li>
            <li><strong>Abends:</strong> 35g Nassfutter.</li>
          </ul>
        </div>
      </div>
    </AnimatedPage>
  );
};
export default MealTemplates;
