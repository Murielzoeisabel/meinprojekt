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

---

## 🌐 Deployment & Server-Architektur (Session 11)

Die Anwendung ist als eine **Single-Server-Architektur** (All-in-One Node.js) auf einem Hetzner Webhosting L Server deployt. Der Express-Server liefert dabei sowohl die API-Endpunkte unter `/api/*` als auch das statische React-Build aus.

### Architektur-Übersicht

| Bestandteil | Läuft als | Hostname / Pfad | Wird ausgeliefert von |
| :--- | :--- | :--- | :--- |
| **Frontend (React)** | Statisches Build (`dist/`) | `muriel-kleinschroth.de` | Express (`express.static`) |
| **Backend (Express)** | Node.js-App | `muriel-kleinschroth.de/api` | konsoleH Node.js (Reverse Proxy) |
| **Datenbank (SQL)** | MySQL/MariaDB | `localhost` (auf dem Server) | konsoleH DB-Verwaltung |

### Wichtige Design-Entscheidungen

#### 1. Warum entfällt CORS?
Da Frontend und API-Backend unter exakt derselben Origin (`https://muriel-kleinschroth.de`) erreichbar sind, handelt es sich um **same-origin**-Kommunikation. Der Browser muss keine Cross-Origin-Anfragen durchführen. Daher ist eine CORS-Konfiguration im Backend für den Betrieb der Anwendung im Web nicht mehr erforderlich.

#### 2. Cookie-Attribute für JWT & SameSite=Lax
Für das Session-Management wird ein verschlüsselter JWT-Token in einem Cookie mit folgenden Attributen verwendet:
* `httpOnly: true`: Verhindert, dass Client-seitige JavaScript-Skripte auf den Cookie zugreifen können (Schutz vor XSS).
* `secure: true` (in Produktion): Stellt sicher, dass der Cookie nur über verschlüsselte HTTPS-Verbindungen übertragen wird.
* `sameSite: 'lax'`: Ist völlig ausreichend, da alle API-Aufrufe der App same-origin sind. Es schützt vor CSRF bei Cross-Site-Anfragen von externen Seiten, verhindert aber nicht das Mitsenden des Cookies bei normalen Aktionen innerhalb der Seite. Ein schwächeres und fehleranfälliges `SameSite=None` ist nicht notwendig.

#### 3. Reverse Proxy & `trust proxy`
Da die Node.js-App auf Hetzner hinter einem Apache-Reverse-Proxy betrieben wird (der die SSL-Verschlüsselung terminiert), wird `app.set('trust proxy', 1)` verwendet. Dadurch kann Express dem `X-Forwarded-*`-Header des Proxys vertrauen, wodurch Protokolle (HTTPS) und echte Client-IPs korrekt erkannt und ausgewertet werden (z. B. für das Login-Rate-Limiting).

---

## ⚡ Performance- & Sicherheits-Optimierung (Session 12)

### 1. Automatisierter Sicherheits-Scan (Findings & Härtung)
Wir haben einen externen Sicherheits-Scan durchgeführt und folgende Härtungen im Express-Backend ([server.js](file:///c:/Users/murie/Documents/Studium/4.Semester/Web-Architecture/meinprojekt/backend/server.js)) vorgenommen:
* **MIME-Sniffing-Prävention**: Setzen des Headers `X-Content-Type-Options: nosniff`.
* **Clickjacking-Schutz**: Setzen des Headers `X-Frame-Options: DENY`.
* **XSS-Schutz**: Setzen des Headers `X-XSS-Protection: 1; mode=block`.
* **Content Security Policy (CSP)**: Einschränkung erlaubter Ressourcen (z. B. Skripte, Styles, Fonts, Bilder) auf vertrauenswürdige Domänen.
* **Server-Fingerprinting verhindern**: Der `X-Powered-By`-Header wurde deaktiviert (`app.disable('x-powered-by')`), um Framework-Informationen vor Angreifern zu verschleiern.

### 2. Lighthouse-Audit & Bilder-Optimierung
* **Baseline (Vorher)**: Performance-Score lag bei **85**. Hauptursache war das unkomprimierte Hero-Image `hero-cat.png` (**428.68 KB**), das zu einer Verzögerung des Largest Contentful Paint (LCP) führte. Zudem fehlten feste Breite- und Höhe-Attribute auf dem Bildelement, was zu Layout-Verschiebungen (CLS) führte.
* **Optimierung**: 
  * Das Bild wurde mit `sharp` auf **600x600px** herunterskaliert und in das moderne **WebP-Format** konvertiert (**19.71 KB**, **95.40% Ersparnis**).
  * Im React-Code ([Landing.jsx](file:///c:/Users/murie/Documents/Studium/4.Semester/Web-Architecture/meinprojekt/frontend/src/pages/Landing.jsx)) wurden feste Dimensionen (`width="600"`, `height="600"`) und `loading="lazy"` gesetzt.
* **Ergebnis (Nachher)**: Performance-Score stieg auf **98-100**. Die Ladezeit des Hero-Assets hat sich drastisch verringert und der CLS-Wert sank auf **0**.