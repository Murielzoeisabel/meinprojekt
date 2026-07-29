import { useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../shared/components/AnimatedPage';
import { 
  ArrowRight, 
  Cat, 
  Activity, 
  Utensils, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Award, 
  Scale, 
  Calendar, 
  Flame, 
  CheckCircle2, 
  TrendingDown, 
  Plus 
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  // Calculator State
  const [weight, setWeight] = useState(6.0);
  const [condition, setCondition] = useState('chubby'); // ideal, chubby, obese

  // Feature Tabs State
  const [activeTab, setActiveTab] = useState('profile');

  // Calorie Calculation Logic
  const calculateResults = () => {
    const w = parseFloat(weight) || 0;
    if (w <= 0) return { rer: 0, targetWeight: 0, calories: 0, duration: 0 };

    // RER (Resting Energy Requirement) = 70 * (weight)^0.75
    const rer = Math.round(70 * Math.pow(w, 0.75));
    
    let factor = 1.0;
    let targetMultiplier = 1.0;
    let durationWeeks = 0;

    if (condition === 'chubby') {
      factor = 0.8;          // 20% deficit
      targetMultiplier = 0.9; // 10% weight loss goal
      durationWeeks = 10;
    } else if (condition === 'obese') {
      factor = 0.7;          // 30% deficit
      targetMultiplier = 0.8; // 20% weight loss goal
      durationWeeks = 20;
    } else {
      factor = 1.2;          // Active maintenance
      targetMultiplier = 1.0;
      durationWeeks = 0;
    }

    const calories = Math.round(rer * factor);
    const targetWeight = (w * targetMultiplier).toFixed(1);

    return { rer, targetWeight, calories, duration: durationWeeks };
  };

  const results = calculateResults();

  return (
    <AnimatedPage>
      <div className="landing-container">
        {/* Decorative background blobs */}
        <div className="landing-blob blob-1"></div>
        <div className="landing-blob blob-2"></div>

        {/* Hero Section */}
        <header className="landing-hero-modern">
          <div className="landing-hero-content">
            <div className="landing-badge">
              <Sparkles size={16} />
              <span>Die #1 App für fitte Katzen</span>
            </div>
            <h1 className="hero-gradient-title">Cat Slim Down</h1>
            <h2>Bringe deine Katze spielerisch zurück zum Idealgewicht</h2>
            <p className="hero-description">
              Wissenschaftliche Diätpläne, Aktivitäts-Tracking und ein KI-gestützter Futter-Scanner helfen dir, das Gewicht deines Lieblings gesund zu reduzieren. Einfach zu bedienen, von Tierärzten inspiriert.
            </p>
            <div className="landing-hero-actions">
              <Link to="/register" className="btn-primary landing-btn-hero">
                Jetzt kostenlos starten <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary landing-btn-hero-sec">
                Anmelden
              </Link>
            </div>
          </div>
          
          <div className="landing-hero-visual-modern">
            <div className="hero-image-wrapper">
              <img 
                src="/images/hero-cat.webp" 
                alt="Fit und glückliche Katze" 
                className="hero-cat-image" 
                loading="lazy"
                width="600"
                height="600"
              />
              {/* Floating micro dashboard widgets */}
              <div className="floating-widget widget-weight floating-comic">
                <TrendingDown size={16} className="icon-orange" />
                <div>
                  <span className="widget-label">Gewicht</span>
                  <span className="widget-val">-1.2 kg</span>
                </div>
              </div>
              <div className="floating-widget widget-activity floating-comic-delayed">
                <Flame size={16} className="icon-mint" />
                <div>
                  <span className="widget-label">Verbrannt</span>
                  <span className="widget-val">42 kcal</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Check Calculator Widget */}
        <section className="landing-quick-calc-section">
          <div className="landing-section-title">
            <span className="section-subtitle-badge">Schnell-Check</span>
            <h2>Kalorien- & Gewichts-Rechner</h2>
            <p>Ermittle sofort den ungefähren Energiebedarf und ein gesundes Abnehmziel für deine Katze.</p>
          </div>

          <div className="quick-calc-container card">
            <div className="quick-calc-inputs">
              <div className="input-group-modern">
                <label htmlFor="cat-weight-calc">Aktuelles Gewicht (kg)</label>
                <div className="input-with-icon">
                  <Scale size={18} className="input-icon" />
                  <input 
                    id="cat-weight-calc"
                    type="number" 
                    min="1" 
                    max="20" 
                    step="0.1" 
                    value={weight} 
                    onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="input-field-modern"
                  />
                </div>
              </div>

              <div className="input-group-modern">
                <label htmlFor="cat-condition-calc">Körperzustand</label>
                <select 
                  id="cat-condition-calc"
                  value={condition} 
                  onChange={(e) => setCondition(e.target.value)}
                  className="input-field-modern select-modern"
                >
                  <option value="ideal">Ideal (Gewicht halten)</option>
                  <option value="chubby">Leicht übergewichtig (Leichte Diät)</option>
                  <option value="obese">Übergewichtig bis adipös (Kontrollierte Diät)</option>
                </select>
              </div>
            </div>

            <div className="quick-calc-results">
              <div className="calc-result-card">
                <div className="result-metric">
                  <span className="metric-value">{results.calories} <span className="metric-unit">kcal</span></span>
                  <span className="metric-label">Empfohlene Tagesration</span>
                </div>
              </div>

              <div className="calc-details-grid">
                <div className="calc-detail-item">
                  <div className="detail-header">
                    <Scale size={16} />
                    <span>Zielgewicht</span>
                  </div>
                  <span className="detail-value">{results.targetWeight} kg</span>
                </div>

                <div className="calc-detail-item">
                  <div className="detail-header">
                    <Calendar size={16} />
                    <span>Dauer (ca.)</span>
                  </div>
                  <span className="detail-value">
                    {results.duration > 0 ? `${results.duration} Wochen` : 'Erhaltungsphase'}
                  </span>
                </div>
              </div>

              <div className="calc-cta-box">
                <p>Möchtest du einen genauen Diätplan erstellen und das Gewicht deiner Katze dokumentieren?</p>
                <Link to="/register" className="btn-primary calc-cta-btn">
                  Ergebnisse speichern <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Interactive Showcase */}
        <section className="landing-showcase-section">
          <div className="landing-section-title">
            <span className="section-subtitle-badge">Interaktiver Einblick</span>
            <h2>So funktioniert Cat Slim Down</h2>
            <p>Klicke dich durch die Hauptbereiche und entdecke unsere intelligenten Werkzeuge.</p>
          </div>

          <div className="showcase-tabs-container">
            <div className="showcase-tabs">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`showcase-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                type="button"
              >
                <Cat size={18} />
                <span>Steckbrief & BCS</span>
              </button>
              <button 
                onClick={() => setActiveTab('nutrition')}
                className={`showcase-tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
                type="button"
              >
                <Utensils size={18} />
                <span>Futterrechner</span>
              </button>
              <button 
                onClick={() => setActiveTab('fitness')}
                className={`showcase-tab-btn ${activeTab === 'fitness' ? 'active' : ''}`}
                type="button"
              >
                <Activity size={18} />
                <span>Aktivitäten-Log</span>
              </button>
              <button 
                onClick={() => setActiveTab('analyzer')}
                className={`showcase-tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
                type="button"
              >
                <Sparkles size={18} />
                <span>KI Futter-Scanner</span>
              </button>
            </div>

            <div className="showcase-content card">
              {activeTab === 'profile' && (
                <div className="showcase-pane active-pane">
                  <div className="pane-info">
                    <h3>Individuelle Katzenprofile</h3>
                    <p>
                      Erfasse Alter, Rasse und Gewicht deines Lieblings. Bestimme den Body Condition Score (BCS) visuell anhand unseres interaktiven Ratgebers, um Übergewicht treffsicher zu bestimmen.
                    </p>
                    <ul className="pane-bullets">
                      <li><CheckCircle2 size={16} className="icon-mint" /> Einfache Profilerstellung</li>
                      <li><CheckCircle2 size={16} className="icon-mint" /> BCS-Bestimmung mit Grafiken</li>
                      <li><CheckCircle2 size={16} className="icon-mint" /> Wöchentlicher Reminder fürs Wiegen</li>
                    </ul>
                  </div>
                  <div className="pane-preview">
                    {/* Mockup Card */}
                    <div className="mockup-card-profile">
                      <div className="mockup-header">
                        <div className="mockup-avatar">🐱</div>
                        <div>
                          <h4>Garfield</h4>
                          <p>Britisch Kurzhaar · 5 Jahre</p>
                        </div>
                      </div>
                      <div className="mockup-body">
                        <div className="mockup-stat-row">
                          <span>Gewicht:</span>
                          <strong>6.5 kg</strong>
                        </div>
                        <div className="mockup-bcs-badge warning-badge">
                          <span>BCS: 7 / 9 (Übergewichtig)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="showcase-pane active-pane">
                  <div className="pane-info">
                    <h3>Präziser Diät- & Futterrechner</h3>
                    <p>
                      Schluss mit dem Rätselraten auf der Verpackungsrückseite. Unser Rechner kalkuliert auf Basis des aktuellen Gewichts und des Aktivitätslevels die exakte Portion in Gramm für Nass- und Trockenfutter.
                    </p>
                    <ul className="pane-bullets">
                      <li><CheckCircle2 size={16} className="icon-mint" /> RER/DER-Energieberechnung</li>
                      <li><CheckCircle2 size={16} className="icon-mint" /> Futterrationen-Aufteilung</li>
                      <li><CheckCircle2 size={16} className="icon-mint" /> Rezeptdatenbank & Mahlzeiten-Vorlagen</li>
                    </ul>
                  </div>
                  <div className="pane-preview">
                    <div className="mockup-card-nutrition">
                      <h4>Futterplan für heute</h4>
                      <div className="nutrition-progress-ring">
                        <div className="ring-text">
                          <span className="ring-num">230</span>
                          <span className="ring-lbl">kcal Ziel</span>
                        </div>
                      </div>
                      <div className="nutrition-rations">
                        <div className="ration-item">
                          <span>Nassfutter (Morgens):</span>
                          <strong>120g <span className="ration-cal">(100 kcal)</span></strong>
                        </div>
                        <div className="ration-item">
                          <span>Trockenfutter (Abends):</span>
                          <strong>35g <span className="ration-cal">(130 kcal)</span></strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fitness' && (
                <div className="showcase-pane active-pane">
                  <div className="pane-info">
                    <h3>Aktivitäts-Logbuch</h3>
                    <p>
                      Spielen hält nicht nur den Geist fit, sondern verbrennt wichtige Kalorien. Wähle aus verschiedenen Aktivitäten wie Clickertraining, Angelspielen oder Treppenlauf und tracke die Bewegung deines Stubentigers.
                    </p>
                    <ul className="pane-bullets">
                      <li><CheckCircle2 size={16} className="icon-mint" /> Große Auswahl an Katzenspielen</li>
                      <li><CheckCircle2 size={16} className="icon-mint" /> Automatische Kalorienberechnung</li>
                      <li><CheckCircle2 size={16} className="icon-mint" /> Fitness-Statistiken über die Woche</li>
                    </ul>
                  </div>
                  <div className="pane-preview">
                    <div className="mockup-card-fitness">
                      <div className="mockup-card-title-row">
                        <h4>Aktivitäten</h4>
                        <button className="mockup-btn-add" type="button"><Plus size={14} /></button>
                      </div>
                      <div className="fitness-list">
                        <div className="fitness-list-item">
                          <div className="fitness-item-left">
                            <span className="fitness-emoji">🎣</span>
                            <div>
                              <h5>Federangel-Spiel</h5>
                              <p>20 Minuten</p>
                            </div>
                          </div>
                          <span className="fitness-cal-burn">-42 kcal</span>
                        </div>
                        <div className="fitness-list-item">
                          <div className="fitness-item-left">
                            <span className="fitness-emoji">🧠</span>
                            <div>
                              <h5>Clickertraining</h5>
                              <p>15 Minuten</p>
                            </div>
                          </div>
                          <span className="fitness-cal-burn">-28 kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analyzer' && (
                <div className="showcase-pane active-pane">
                  <div className="pane-info">
                    <h3>KI Futter-Scanner</h3>
                    <p>
                      Schluss mit dem mühsamen Entziffern von Inhaltsstoffen auf der Rückseite der Futterdose. Fotografiere einfach das Etikett – unsere künstliche Intelligenz erkennt sofort, ob das Futter für eine gesunde Diät geeignet ist.
                    </p>
                    <ul className="pane-bullets">
                      <li><CheckCircle2 size={16} className="icon-mint" /> Sekundenschneller Foto-Upload</li>
                      <li><CheckCircle2 size={16} className="icon-mint" /> Sofortige Bewertung für Gewichtsreduktion</li>
                      <li><CheckCircle2 size={16} className="icon-mint" /> Erkennt versteckten Zucker & Getreide</li>
                    </ul>
                  </div>
                  <div className="pane-preview">
                    <div className="mockup-card-analyzer">
                      <div className="mockup-analyzer-header">
                        <Sparkles size={18} className="icon-sparkle" />
                        <h4>Scan-Ergebnis</h4>
                      </div>
                      <div className="mockup-analyzer-verdict danger-alert">
                        <span className="verdict-status">⚠️ Nicht optimal</span>
                        <p>Enthält <strong>Zucker</strong> und <strong>Getreide</strong>. Geringer Fleischanteil (4%). Für eine Gewichtsreduktion ungeeignet.</p>
                      </div>
                      <div className="mockup-analyzer-ingredients">
                        <span className="mockup-tag">Getreide</span>
                        <span className="mockup-tag">Zucker</span>
                        <span className="mockup-tag">Zusatzstoffe</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="landing-features-modern">
          <div className="landing-section-title">
            <span className="section-subtitle-badge">Features</span>
            <h2>Alles für ein gesundes Katzenleben</h2>
            <p>Unsere All-in-One App bietet dir die perfekten Werkzeuge für die Gesundheit deines Stubentigers.</p>
          </div>

          <div className="landing-bento-grid-modern">
            <div className="bento-card-modern gradient-bento-1">
              <div className="bento-icon-wrapper-modern">
                <Cat size={24} />
              </div>
              <h3>Steckbriefe & Profile</h3>
              <p>Behalte alle Daten deiner Katze an einem zentralen Ort im Auge – Alter, Rasse und Entwicklung.</p>
            </div>

            <div className="bento-card-modern gradient-bento-2">
              <div className="bento-icon-wrapper-modern">
                <Activity size={24} />
              </div>
              <h3>Gewichtsverlauf & Charts</h3>
              <p>Visualisiere den Erfolg mit interaktiven Gewichts-Diagrammen. Feiere jeden geschafften Meilenstein.</p>
            </div>

            <div className="bento-card-modern gradient-bento-3">
              <div className="bento-icon-wrapper-modern">
                <Utensils size={24} />
              </div>
              <h3>Maßgeschneiderte Diäten</h3>
              <p>Ermittle präzise Portionsgrößen angepasst an handelsübliches Nass- und Trockenfutter.</p>
            </div>

            <div className="bento-card-modern gradient-bento-4">
              <div className="bento-icon-wrapper-modern">
                <Sparkles size={24} />
              </div>
              <h3>KI Futter-Analyse</h3>
              <p>Scanne Futteretiketten per Foto. Unsere KI entlarvt ungesunde Dickmacher wie Getreide und Zucker in Sekunden.</p>
            </div>
          </div>
        </section>

        {/* Testimonials / Success Stories */}
        <section className="landing-testimonials-section">
          <div className="landing-section-title">
            <span className="section-subtitle-badge">Erfolgsgeschichten</span>
            <h2>Katzeneltern berichten</h2>
            <p>Schau dir an, wie andere Stubentiger wieder agil und lebensfroh geworden sind.</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card card">
              <div className="testimonial-header">
                <span className="cat-avatar">🐈</span>
                <div>
                  <h4>Mimi & Anna</h4>
                  <p>Aus Berlin</p>
                </div>
              </div>
              <p className="testimonial-quote">
                "Mimi hat durch den Futterrechner in 3 Monaten 800g abgenommen. Sie springt jetzt wieder ohne Zögern auf das Sofa und ist viel wacher."
              </p>
              <div className="testimonial-badge-success">
                <span>Erfolg: -800g (Ziel erreicht)</span>
              </div>
            </div>

            <div className="testimonial-card card">
              <div className="testimonial-header">
                <span className="cat-avatar">🐈‍⬛</span>
                <div>
                  <h4>Leo & Thomas</h4>
                  <p>Aus Hamburg</p>
                </div>
              </div>
              <p className="testimonial-quote">
                "Dank der Aktivitätenliste haben wir gelernt, wie wichtig regelmäßige Spielzeiten sind. Leo bewegt sich wieder richtig gerne!"
              </p>
              <div className="testimonial-badge-success">
                <span>Erfolg: -1.2 kg (Aktiv & fit)</span>
              </div>
            </div>

            <div className="testimonial-card card">
              <div className="testimonial-header">
                <span className="cat-avatar">🐱</span>
                <div>
                  <h4>Felix & Sabrina</h4>
                  <p>Aus München</p>
                </div>
              </div>
              <p className="testimonial-quote">
                "Dank der KI-Futteranalyse habe ich erst bemerkt, wie viel versteckten Zucker das alte Futter enthielt. Felix hat mit dem neuen Futter fast 1 kg verloren!"
              </p>
              <div className="testimonial-badge-success">
                <span>Erfolg: -950g (Zuckerfrei & vital)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Weight Matters Info section */}
        <section className="landing-health-modern card no-hover">
          <div className="landing-health-content">
            <div className="health-icon-badge-modern">
              <Award size={20} />
              <span>Gesundheit im Fokus</span>
            </div>
            <h2>Warum ein gesundes Gewicht lebenswichtig ist</h2>
            <p>
              Übergewicht bei Katzen ist kein reines Schönheitsproblem. Bereits 1–2 kg Übergewicht belasten den Katzenkörper massiv und können die Lebensdauer um Jahre verkürzen. Ein wissenschaftlich begleiteter Abnehmweg hilft dabei:
            </p>
            <ul className="health-benefits-list-modern">
              <li>
                <strong>Diabetes-Risiko minimieren:</strong> Übergewicht ist die häufigste Ursache für felinen Diabetes Typ 2.
              </li>
              <li>
                <strong>Gelenke schonen:</strong> Gewichtsreduktion lindert arthrotische Gelenkschmerzen und bringt die Spielfreude zurück.
              </li>
              <li>
                <strong>Fettleber verhindern:</strong> Ein langsames, gesundes Abnehmen beugt einer lebensgefährlichen hepatischen Lipidose vor.
              </li>
            </ul>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="landing-cta-modern">
          <div className="cta-overlay-blobs">
            <div className="cta-blob-1"></div>
            <div className="cta-blob-2"></div>
          </div>
          <div className="cta-content-inner">
            <h2>Mach deine Katze wieder fit und agil!</h2>
            <p>Melde dich heute kostenlos an und starte eure Reise zu mehr Lebensqualität, Gesundheit und Vitalität.</p>
            <div className="landing-cta-actions">
              <Link to="/register" className="btn-primary landing-btn-cta">
                Jetzt registrieren <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary landing-btn-cta-sec">
                Bereits ein Konto? Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AnimatedPage>
  );
};

export default Landing;

