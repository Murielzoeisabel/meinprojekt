# CatSlimDown - Katzengewichtstracker

**CatSlimDown** ist eine digitale Begleitung für ein gesundes Katzengewicht. Mit dieser Anwendung können Katzenbesitzer das Gewicht, die Entwicklung und die Gewohnheiten ihrer Katzen einfach dokumentieren und nachvollziehen, um Fortschritte zu erkennen und Fütterung, Bewegung sowie Gesundheit optimal zu steuern.

---

## 🚀 Features

* **Interaktives Dashboard:** Gewichtsverlauf übersichtlich als Diagramm visualisieren.
* **Katzenverwaltung:** Profile für mehrere Katzen mit Rasse, Alter, Fotos und Zielgewicht anlegen.
* **Kalorien- & Aktivitäts-Tracker:** Futtermenge und verbrannte Energie dokumentieren.
* **Community-Forum & Chat:** Austausch mit anderen Katzenbesitzern und gegenseitige Motivation.
* **Fitness- & Ernährungs-Tipps:** Personalisierte Empfehlungen für eine gesunde Katze.

---

## 🛠️ Technologie-Stack

* **Frontend:** React, Vite, CSS (Vanilla)
* **Backend:** Node.js, Express
* **Datenbank & ORM:** SQLite, Prisma ORM
* **Testing:** Vitest (Unit- & Integrationstests), Cypress (End-to-End-Tests)

---

## 📂 Projektstruktur

```text
meinprojekt/
├── backend/            # Express Server, Prisma Schema & Seed-Daten
├── frontend/           # React Single Page Application (Vite)
├── screenshots/        # Belege für Tests und API-Aufrufe
├── DOKUMENTATION.md    # Ausführliche Architekturdokumentation (User Stories, API-Design, Schemas)
├── PROMPTS.md          # Dokumentation der verwendeten LLM-Prompts & Iterationsschritte
└── README.md           # Dieser Quickstart-Guide
```

---

## 💻 Installation & Setup

### Voraussetzungen
Stelle sicher, dass **Node.js** (v18+) und **npm** installiert sind.

### 1. Repository klonen & vorbereiten
Installiere die Abhängigkeiten für das Backend und das Frontend:

```bash
# Backend-Abhängigkeiten installieren
cd backend
npm install

# Frontend-Abhängigkeiten installieren
cd ../frontend
npm install
```

### 2. Datenbank initialisieren (Backend)
Erstelle die lokale SQLite-Datenbank und führe die Migrationen sowie den Seed aus:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Entwicklungsserver starten

#### Backend starten:
```bash
cd backend
npm run dev
# Der Server läuft standardmäßig auf http://localhost:3001
```

#### Frontend starten:
```bash
cd frontend
npm run dev
# Die App läuft standardmäßig auf http://localhost:5173
```

---

## 🧪 Tests ausführen

### Unit- & Integrationstests (Vitest)
```bash
cd backend
npm run test
```

### End-to-End-Tests (Cypress)
Stelle sicher, dass sowohl Frontend als auch Backend laufen, und starte dann Cypress:
```bash
cd frontend
npx cypress open
```

---

## 📚 Weiterführende Dokumentation

* **Architektur & Entscheidungen:** Detaillierte Beschreibungen der Datenstrukturen, APIs und OWASP-Audits findest du in der [Architekturdokumentation (DOKUMENTATION.md)](file:///C:/Users/murie/Documents/Studium/4.Semester/Web-Architecture/meinprojekt/DOKUMENTATION.md).
* **LLM-Prompts:** Die exakten Prompts und Iterationsschritte zur Generierung der Features und Tests sind in der [Prompt-Dokumentation (PROMPTS.md)](file:///C:/Users/murie/Documents/Studium/4.Semester/Web-Architecture/meinprojekt/PROMPTS.md) festgehalten.