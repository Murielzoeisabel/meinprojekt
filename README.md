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
* **Datenbank & ORM:** MySQL/MariaDB (Produktion) / SQLite (Entwicklung), Prisma ORM
* **Testing:** Vitest (Unit- & Integrationstests), Cypress (End-to-End-Tests)

---

## 💻 Lokales Setup & Ausführung

Die Anwendung kann entweder über Docker (empfohlen) oder direkt mit Node.js gestartet werden.

### Option A: Starten mit Docker Compose (Ein-Befehl-Start)
Dies baut das Frontend und startet die gesamte Anwendung inklusive einer lokalen MySQL-Datenbank automatisch.

1. Stelle sicher, dass Docker und Docker Compose auf deinem System installiert sind und laufen.
2. Starte die Anwendung aus dem Hauptverzeichnis:
   ```bash
   docker compose up --build
   ```
3. Die App ist anschließend unter `http://localhost:3000` im Browser erreichbar.

---

### Option B: Manueller Start (Lokale Entwicklung)
Stelle sicher, dass du eine `.env` Datei im Ordner `backend/` basierend auf `backend/.env.example` erstellt hast (standardmäßig für SQLite konfiguriert).

1. **Abhängigkeiten installieren:**
   ```bash
   npm run install:all
   ```
2. **Datenbank-Migrationen ausführen:**
   ```bash
   npm run db:migrate --prefix backend
   ```
3. **Entwicklungsserver starten (Frontend + Backend parallel):**
   ```bash
   npm run dev
   ```
4. Die App läuft auf `http://localhost:5173` (Vite Frontend) und leitet API-Anfragen an den Express-Server auf `http://localhost:3000` weiter.

---

## 🧪 Tests ausführen

* **Unit- und Integrationstests (Vitest + Coverage-Report):**
  ```bash
  npm test
  ```
  Dieser Befehl führt alle Backend-Tests aus und generiert den HTML-Coverage-Report im Verzeichnis `backend/coverage/index.html`.

* **End-to-End-Tests (Cypress):**
  1. Stelle sicher, dass die App im Entwicklungsmodus läuft (`npm run dev`).
  2. Starte die Cypress-Tests:
     ```bash
     npm run test:e2e
     ```