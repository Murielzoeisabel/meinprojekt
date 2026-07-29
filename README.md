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

## 🌐 Deployment & Server-Architektur (Session 11)

Die Anwendung ist als eine **Single-Server-Architektur** (All-in-One Node.js) auf einem Hetzner Webhosting L Server deployt. Der Express-Server liefert dabei sowohl die API-Endpunkte unter `/api/*` als auch das statische React-Build aus.

### Architektur-Übersicht

| Bestandteil | Läuft als | Hostname / Pfad | Wird ausgeliefert von |
| :--- | :--- | :--- | :--- |
| **Frontend (React)** | Statisches Build (`dist/`) | `meinprojekt.de` | Express (`express.static`) |
| **Backend (Express)** | Node.js-App | `meinprojekt.de/api` | konsoleH Node.js (Reverse Proxy) |
| **Datenbank (SQL)** | MySQL/MariaDB | `localhost` (auf dem Server) | konsoleH DB-Verwaltung |

### Wichtige Design-Entscheidungen

#### 1. Warum entfällt CORS?
Da Frontend und API-Backend unter exakt derselben Origin (`https://meinprojekt.de`) erreichbar sind, handelt es sich um **same-origin**-Kommunikation. Der Browser muss keine Cross-Origin-Anfragen durchführen. Daher ist eine CORS-Konfiguration im Backend für den Betrieb der Anwendung im Web nicht mehr erforderlich.

#### 2. Cookie-Attribute für JWT & SameSite=Lax
Für das Session-Management wird ein verschlüsselter JWT-Token in einem Cookie mit folgenden Attributen verwendet:
* `httpOnly: true`: Verhindert, dass Client-seitige JavaScript-Skripte auf den Cookie zugreifen können (Schutz vor XSS).
* `secure: true` (in Produktion): Stellt sicher, dass der Cookie nur über verschlüsselte HTTPS-Verbindungen übertragen wird.
* `sameSite: 'lax'`: Ist völlig ausreichend, da alle API-Aufrufe der App same-origin sind. Es schützt vor CSRF bei Cross-Site-Anfragen von externen Seiten, verhindert aber nicht das Mitsenden des Cookies bei normalen Aktionen innerhalb der Seite. Ein schwächeres und fehleranfälliges `SameSite=None` ist nicht notwendig.

#### 3. Reverse Proxy & `trust proxy`
Da die Node.js-App auf Hetzner hinter einem Apache-Reverse-Proxy betrieben wird (der die SSL-Verschlüsselung terminiert), wird `app.set('trust proxy', 1)` verwendet. Dadurch kann Express dem `X-Forwarded-*`-Header des Proxys vertrauen, wodurch Protokolle (HTTPS) und echte Client-IPs korrekt erkannt und ausgewertet werden (z. B. für das Login-Rate-Limiting).