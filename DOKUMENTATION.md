# Architekturdokumentation: CatSlimDown

Dieses Dokument beschreibt die wesentlichen Architekturentscheidungen, die im Rahmen der Studio-Sessions für das Projekt **CatSlimDown** getroffen wurden.

# Studio Session 1

# User Story

Als Nutzer möchte ich den Gewichtsverlauf meiner Katze übersichtlich sehen, damit ich ihr helfen kann ein gesundes Zielgewicht zu erreichen.

# Generierung der Features

In der ersten Iteration habe ich ein Diagramm generieren lassen, das den Gewichtsverlauf der Katze anzeigt und das es einem ermöglicht Werte einzutragen. In der zweiten Iteration habe ich noch eine Seite hinzugefügt, in der man seine Katzen verwalten kann und Fotos der Katze hochladen kann.
In vielen weiteren Iterationen habe ich noch Fitnesstipps, Rezeptideen, ein Community-Forum, ein Abzeichen-System und weitere Features ergänzt.

# Studio Session 2

# Beobachtungsaufgabe Next.js

Mit deaktiviertem JavaScript war meine Vite-App im Wesentlichen nur weiß bzw. ohne nutzbaren Inhalt sichtbar, während die Next.js-Seite weiterhin Inhalte zeigte; das ist für mein Projekt okay, weil es als interaktive App gedacht ist und nicht als SEO-orientierte, öffentlich indexierte Content-Seite.

# Je ein Feature in Client/Server Component

Server-Component:
Als Nutzer möchte ich beim Öffnen der Seite sofort meine Katzen und den letzten Gewichtsverlauf sehen, ohne Ladespinner, damit ich direkt loslegen kann.

Client-Component:
Als Nutzer möchte ich neue Gewichtseinträge direkt hinzufügen können, ohne Seitenreload, damit die Eingabe schnell und flüssig bleibt.

# Architekturentscheidung (Next.js vs. Vite)

Ich habe mich bewusst für Vite entschieden, da die Website interaktiv ist und einen eher app-artigen Ablauf hat. Eine schnelle Client-Interaktion liegt im Fokus. Next.js würde nur dann Vorteile bringen, wenn ich öffentlich auffindbare Inhalte hätte, die von Suchmaschinen sauber idexiert werden sollten. Trotz meines Community-Forums entscheide ich mich für Vite, weil das Forum hauptsächlich innerhalb der App, im Login-Bereich genutzt wird und Interaktivität wichtiger ist als die Suchmaschinenoptimierung. 

# Studio Session 3

# Ressourcen und API-Struktur

Haupt-Ressourcen:

-users
-cats
-weightentries
-posts
-reactions
-badges
-foodanalyses
-calorieentries

Content-Ressourcen (read only):

-tips
-recipes

Hierarchie:

Ein User: 
hat cats
erstellt posts
bekommt badges
hat calorieentries

Eine Cat:
hat weightentries

Ein Post:
hat Reactions

Eine Foodanalyse
gehört zu einem user
basiert auf einem Bild-Upload

Gewählte API-Struktur:

Ich habe mich für ein flaches Design mit Query-Parametern entschieden, da es flexibel, leicht erweiterbar und gut für die Verwendung im Frontend geeignet ist. Beziehungen zwischen den Ressourcen werden über IDs dargestellt, z.B: 

-/cats?userID=123
-/weight-entries?catID=456
-/posts?userID=123

Zusätzlich nutze ich pragmatisches Nesting mit maximal einer Ebene, wenn es die Lesbarkeit verbessert, z.B.:

-/cats/{id}/weight-entries
-/posts/{id}/reactions

Auf tiefere Verschachtelungen verzichte ich bewusst, da diese die Komplexität erhöhen und schwer wartbar sind.

# API-Tests (ohne Frontend)

Die Cats-API wurde manuell mit Postman/Hoppscotch getestet.

Basis-URL:
- http://localhost:3001

Verwendete Collection:
- backend/Cats-API.postman_collection.json

# 1) GET /api/cats

Erfolgsfall:
- Request: GET /api/cats
- Erwartet: 200 OK
- Ergebnis: 200 OK
- Beleg: Erfolgsfall (200):
![GET cats 200](screenshots/get-cats-200.png)

Fehlerfall:
- Request: GET /api/cats?userId=abc
- Erwartet: 400 Bad Request
- Ergebnis: 400 Bad Request
- Beleg: Fehlerfall (400 bei ungueltigem userId):
![GET cats invalid userId 400](screenshots/get-cats-invalid-userid-400.png)


# 2) GET /api/cats/:id

Erfolgsfall:
- Request: GET /api/cats/1
- Erwartet: 200 OK
- Ergebnis: 200 OK
- Beleg: Erfolgsfall (200):
![GET cat by id 200](screenshots/get-cat-by-id-200.png)

Fehlerfall:
- Request: GET /api/cats/999999
- Erwartet: 404 Not Found
- Ergebnis: 404 Not Found
- Beleg: Fehlerfall (404):
![GET cat by id 404](screenshots/get-cat-by-id-404.png)


# 3) POST /api/cats

Erfolgsfall:
- Request: POST /api/cats mit gueltigem Body
- Erwartet: 201 Created
- Ergebnis: 201 Created
- Beleg: Erfolgsfall (201):
![POST cat 201](screenshots/post-cat-201.png)

Fehlerfall:
- Request: POST /api/cats mit fehlendem Pflichtfeld name
- Erwartet: 400 Bad Request
- Ergebnis: 400 Bad Request
- Beleg: Fehlerfall (400, name fehlt):
![POST cat missing name 400](screenshots/post-cat-missing-name-400.png)


# 4) PUT /api/cats/:id

Erfolgsfall:
- Request: PUT /api/cats/1 mit gueltigem Body
- Erwartet: 200 OK
- Ergebnis: 200 OK
- Beleg: Erfolgsfall (200):
![PUT cat 200](screenshots/put-cat-200.png)

Fehlerfall:
- Request: PUT /api/cats/1 mit ungueltigen Daten (z. B. name leer)
- Erwartet: 400 Bad Request
- Ergebnis: 400 Bad Request
- Beleg: Fehlerfall (400, ungueltige Daten):
![PUT cat invalid data 400](screenshots/put-cat-invalid-data-400.png)


# 5) DELETE /api/cats/:id

Erfolgsfall:
- Request: DELETE /api/cats/2
- Erwartet: 204 No Content
- Ergebnis: 204 No Content
- Beleg:![DELETE cat 204](screenshots/delete-cat-204.png)

Fehlerfall:
- Request: DELETE /api/cats/999999
- Erwartet: 404 Not Found
- Ergebnis: 404 Not Found
- Beleg:Fehlerfall (404):
![DELETE cat 404](screenshots/delete-cat-404.png)

# Studio Session 4

# Datenschema

### users

| Feld | Typ | Constraint |
| --- | --- | --- |
| id | int | PK |
| email | string | NOT NULL, UNIQUE |
| name | string | NOT NULL |
| avatarUrl | string | optional |
| createdAt | datetime | NOT NULL |

### cats

| Feld | Typ | Constraint |
| --- | --- | --- |
| id | int | PK |
| userId | int | FK -> users.id, NOT NULL |
| name | string | NOT NULL |
| age | int | optional |
| breed | string | NOT NULL |
| size | enum | NOT NULL (klein, mittel, gross) |
| idealWeight | float | NOT NULL |
| photo | string | optional |
| createdAt | datetime | NOT NULL |

### weight_entries

| Feld | Typ | Constraint |
| --- | --- | --- |
| id | int | PK |
| catId | int | FK -> cats.id, NOT NULL |
| date | date | NOT NULL |
| weight | float | NOT NULL |

### calorie_entries

| Feld | Typ | Constraint |
| --- | --- | --- |
| id | int | PK |
| catId | int | FK -> cats.id, NOT NULL |
| date | date | NOT NULL |
| consumed | float | NOT NULL |
| burned | float | NOT NULL |
| basalBurned | float | NOT NULL |

### community_posts

| Feld | Typ | Constraint |
| --- | --- | --- |
| id | int | PK |
| userId | int | FK -> users.id, optional |
| author | string | NOT NULL |
| text | string | NOT NULL |
| photo | string | optional |
| beforeWeight | float | optional |
| nowWeight | float | optional |
| likes | int | NOT NULL, default 0 |
| hearts | int | NOT NULL, default 0 |
| createdAt | datetime | NOT NULL |

### post_reactions

| Feld | Typ | Constraint |
| --- | --- | --- |
| id | int | PK |
| postId | int | FK -> community_posts.id, NOT NULL |
| userId | int | FK -> users.id, NOT NULL |
| type | enum | NOT NULL (like, thumbsUp) |
| createdAt | datetime | NOT NULL |

### community_messages

| Feld | Typ | Constraint |
| --- | --- | --- |
| id | int | PK |
| userId | int | FK -> users.id, optional |
| userName | string | NOT NULL |
| avatar | string | optional |
| text | string | NOT NULL |
| createdAt | datetime | NOT NULL |

# Beziehungen

- users 1:n cats
- cats 1:n weight_entries
- cats 1:n calorie_entries
- community_posts 1:n post_reactions
- users 1:n post_reactions
- users n:m community_posts ueber post_reactions 

# Pflichtfelder

- users: email, name, createdAt
- cats: userId, name, breed, size, idealWeight, createdAt
- weight_entries: catId, date, weight
- calorie_entries: catId, date, consumed, burned, basalBurned
- community_posts: author, text, likes, hearts, createdAt
- post_reactions: postId, userId, type, createdAt
- community_messages: userName, text, createdAt

# Persistenz-Test

Nach dem Senden des Eintrag POST /api/cats erhielt ich wie erwartet die Antwort Status 201 Created.

Beleg: ![POST cat](screenshots/post-cat.png)

Anschließend wurde der Server gestoppt und wieder neu gestartet, um zu überprüfen, ob der Eintrag noch vorhanden ist. Dann wurde der Eintrag GET/api/cats gesendet und ich erhielt die Antwort Status 200 OK.

Beleg: ![GET cat](screenshots/get-cat.png)

Der Test war erfolgreich, da der neu angelegte Eintrag nach dem Neustart weiterhin vorhanden war.

# Architekturentscheidung

Aus architektonischer Sicht sollten vor allem strukturierte und beziehungsreiche Daten in der Datenbank gespeichert werden,
zum Beispiel:
User, Cats, Gewichtseinträge und Community-Posts.

Redis wäre für kurzlebige Daten wie Sessions, Caching-Ergebnisse oder temporäre Zähler sinnvoll, da diese Daten schnell verfügbar sein müssen, aber nicht dauerhaft gespeichert werden.

Für Bilder und größere Uploads ist langfristig ein Cloud Object Store wie S3 geeigneter, damit die Datenbank entlastet wird und sich auf relationale Daten konzentrieren kann.

# Studio Session 5

# Lücken in der API

Im aktuellen Stand sind die Cats-Endpunkte ohne Login/Token aufrufbar. Ein anonymer Nutzer kann daher Dinge tun, die er nicht dürfte:

1. Er kann mit GET /api/cats alle Katzen-Datensätze aller Nutzer auslesen (inklusive Gewichtsverläufe), sobald kein userId-Filter gesetzt ist.
2. Er kann mit GET /api/cats/:id gezielt fremde Datensätze per ID abrufen und durch Ausprobieren von IDs Daten anderer Nutzer enumerieren.
3. Er kann mit DELETE /api/cats/:id beliebige Katzen löschen, auch wenn sie einem anderen Nutzer gehören, da keine Authentifizierung und keine Besitzprüfung erfolgt.

# Authenticate-Middleware

Wenn jemand den JWT-Payload manuell verändert, zum Beispiel die userId auf eine fremde ID setzt, funktioniert das nicht. Der JWT ist serverseitig mit dem Secret aus der .env-Datei signiert. Sobald der Payload verändert wird, passt die Signatur nicht mehr zum Token, und jwt.verify lehnt ihn ab. Die Middleware setzt req.user deshalb nur dann, wenn der Token unverändert und echt signiert ist; sonst kommt direkt 401.

# OWASP-Audit

| OWASP-Punkt | Status | Code-Stelle | Fix / Hinweis |
| --- | --- | --- | --- |
| A01 Broken Access Control | teilweise abgedeckt | [backend/server.js](backend/server.js), [backend/routes/auth.js](backend/routes/auth.js) | Cats, Weights, Calories und Community sind authentifiziert; Community-Posts werden jetzt zusätzlich nur vom Besitzer gelöscht. |
| A02 Cryptographic Failures | abgedeckt | [backend/routes/auth.js](backend/routes/auth.js), [backend/prisma/schema.prisma](backend/prisma/schema.prisma) | Passwörter werden mit bcrypt gehasht und der JWT-Secret kommt aus `.env`. |
| A03 Injection | abgedeckt / beobachtbar | [backend/server.js](backend/server.js) | Runtime-Zugriffe laufen über Prisma, es gibt keine rohe SQL-Konkatenation; XSS-Risiko bleibt clientseitig davon abhängig, wie Daten gerendert werden. |
| A07 Authentication Failures | verbessert | [backend/routes/auth.js](backend/routes/auth.js) | Einheitliche Login-Fehlermeldung bleibt erhalten; zusätzlich gibt es nun stärkere Passwortregeln und ein einfaches Rate-Limit für Login-Versuche. |

# Studio Session 6: Testing

# Test-Pyramide für CatSlimDown

Die Testsuite folgt der Test-Pyramide mit drei Ebenen. Unten: viele schnelle Unit-Tests, in der Mitte: Integrationstests, oben: wenige E2E-Tests.

| Ebene | Was testen wir bei uns? | Tool |
|-------|--------------------------|------|
| **Unit** | Email-Validierung (isValidEmail), Passwort-Anforderungen (min. 10 Zeichen, Buchstaben + Zahlen), Input-Normalisierung (trim, toLowerCase), Gewichtsberechnung | Vitest |
| **Integration** | POST /auth/register → User in DB + JWT-Token, POST /auth/login → Authentifizierung, GET /cats?userId=X → nur eigene Katzen, POST /cats → neue Katze speichern, PUT /cats/:id → Katze aktualisieren, DELETE /cats/:id → Katze löschen, GET /cats/:id/weight-entries → Gewichtsverlauf | Vitest |
| **E2E** | Login-Flow (Register, Login, Session bleibt), neue Katze erstellen im Frontend → im Dashboard sichtbar, Gewichtsverlauf erfassen → Chart aktualisiert sich, Community-Post erstellen | Cypress |

## Zwei kritischste Dinge

Falls diese kaputt gehen, funktioniert das ganze Projekt nicht:

1. **Authentication & JWT-Token**
   - Problem: Ohne funktionierende Auth kann niemand auf sein Konto/seine Katzen zugreifen
   - Betroffen: Register, Login, Token-Validierung in Middleware
   - Impact: App ist komplett unbenutzbar

2. **Datenbank-Persistierung von Cats**
   - Problem: Wenn Katzen nicht mehr gespeichert/geladen werden, ist das Kernfeature weg
   - Betroffen: POST /cats, GET /cats, PUT /cats, DELETE /cats
   - Impact: Nutzerdaten gehen verloren oder sind nicht mehr abrufbar

## 🏛️ Übersicht der Architekturentscheidungen nach Studio-Sessions

### Studio Session 1: Anwendungsarchitektur & MVP-Struktur
* **Getroffene Entscheidung:**
  Entwicklung einer clientseitig gerenderten Web-App (Single-Page-Application, SPA) mit einem interaktiven Dashboard zur Katzenverwaltung und Erfassung von Gewichtseinträgen.
* **Warum (Alternativen & Begründung):**
  * *Verworfen:* Klassische Multi-Page Application (MPA) mit serverseitig gerenderten HTML-Seiten.
  * *Begründung:* Das ständige Neuladen der Seiten bei der Benutzerinteraktion (z. B. beim schnellen Hinzufügen von Gewichtswerten) stört den App-artigen Charakter und die Benutzererfahrung (UX). Ein Dashboard profitiert massiv von einem dynamischen, clientseitigen UI-State.
* **Im Nachhinein anders gemacht:**
  Wir hätten von Anfang an ein festes Datenschema entwerfen sollen, anstatt im ersten Prototyp Mock-Daten im lokalen Frontend-State zu verwalten. Dies führte beim späteren DB-Anschluss zu einigem Refactoring-Aufwand.

---

### Studio Session 2: Technologie-Stack (Vite vs. Next.js)
* **Getroffene Entscheidung:**
  Bewusste Entscheidung für **React mit Vite** als Build-Tool (SPA-Ansatz) anstelle von Next.js (SSR-Ansatz).
* **Warum (Alternativen & Begründung):**
  * *Verworfen:* Next.js (Server-Side Rendering).
  * *Begründung:* Next.js bietet exzellente SEO-Vorteile, da fertiges HTML an Suchmaschinen geliefert wird. Bei der Deaktivierung von JavaScript bleibt die Seite lesbar. CatSlimDown läuft jedoch als interaktive App komplett im Login-Bereich. SEO und öffentliche Indexierung sind hier irrelevant. Die Leichtgewichtigkeit und schnelle Client-Interaktion von Vite hatten Vorrang vor den Vorteilen von Next.js (siehe [README.md](file:///C:/Users/murie/Documents/Studium/4.Semester/Web-Architecture/meinprojekt/README.md#L31-L34)).
* **Im Nachhinein anders machen:**
  Sollten wir in Zukunft planen, die Beiträge des Community-Forums öffentlich zu indexieren (z. B. um neue User über Websuchen zu gewinnen), wäre ein hybrider Ansatz oder der Einsatz von Next.js für die Forums-Subroutes im Nachhinein sinnvoll gewesen.

---

### Studio Session 3: REST API-Struktur (Flat vs. Nested)
* **Getroffene Entscheidung:**
  Implementierung eines **flachen API-Designs mit Query-Parametern** (z. B. `/api/cats?userId=123` oder `/api/weight-entries?catId=456`), kombiniert mit maximal einstufigem Nesting (z. B. `/api/cats/:id/weight-entries`), wo es der Übersicht dient.
* **Warum (Alternativen & Begründung):**
  * *Verworfen:* Tief verschachtelte REST-Pfade (z. B. `/api/users/:userId/cats/:catId/weight-entries/:entryId`).
  * *Begründung:* Tief verschachtelte Endpunkte erhöhen die Komplexität im Backend-Routing (Express) massiv, führen zu unübersichtlichen Controllern und engen das Frontend bei zukünftigen Abfragen (z. B. "Hole alle Gewichtseinträge aller Katzen eines Users") unnötig ein (siehe [README.md](file:///C:/Users/murie/Documents/Studium/4.Semester/Web-Architecture/meinprojekt/README.md#L73-L87)).
* **Im Nachhinein anders machen:**
  Wir hätten von Beginn an einen strengen API-Standard wie JSON:API oder einheitliche HATEOAS-Strukturen durchziehen können, um das Daten-Parsing im Frontend weiter zu vereinheitlichen.

---

### Studio Session 4: Persistenz und Datenhaltung (Prisma & SQLite)
* **Getroffene Entscheidung:**
  Verwendung einer relationalen SQL-Datenbank (SQLite) unter Verwendung des ORMs **Prisma** zur dauerhaften Speicherung aller strukturierten Daten (User, Cats, Gewichtseinträge, Community-Posts).
* **Warum (Alternativen & Begründung):**
  * *Verworfen:* Datenhaltung in lokalen JSON-Dateien (Mock-Daten-Handler) oder einer NoSQL-Datenbank (z. B. MongoDB).
  * *Begründung:* Lokale JSON-Dateien bieten keine Transaktionssicherheit (Concurrency) und Datenverlust droht bei Fehlern. NoSQL wurde verworfen, da unsere Daten stark relational verknüpft sind ($User \rightarrow Cats \rightarrow WeightEntries$). Eine relationale DB garantiert referenzielle Integrität per Fremdschlüssel (siehe [schema.prisma](file:///C:/Users/murie/Documents/Studium/4.Semester/Web-Architecture/meinprojekt/backend/prisma/schema.prisma)).
* **Im Nachhinein anders machen:**
  SQLite blockiert die gesamte Datenbank bei Schreibzugriffen (Database-Locking). Im Nachhinein wäre eine robustere relationale Datenbank wie **PostgreSQL** von Anfang an besser gewesen, um für spätere Features (wie den Live-Chat oder das Community-Forum) bereit zu sein.

---

### Studio Session 5: Sicherheit und Authentifizierung (JWT-Auth)
* **Getroffene Entscheidung:**
  Sicherung der Endpunkte über eine tokenbasierte Authentifizierung mittels **JWT (JSON Web Tokens)**, die in HTTPOnly-Cookies gespeichert werden, kombiniert mit einer serverseitigen Middleware ([authenticate.js](file:///C:/Users/murie/Documents/Studium/4.Semester/Web-Architecture/meinprojekt/backend/middleware/authenticate.js)) und Ownership-Prüfungen auf Daten-Ebene.
* **Warum (Alternativen & Begründung):**
  * *Verworfen:* Token-Speicherung im unsicheren LocalStorage (anfällig für XSS) oder rein anonyme API-Endpunkte ohne Autorisierungsprüfungen.
  * *Begründung:* Ohne Authentifizierung und Prüfung der Ressourcen-Besitzer (z. B. darf User A nur seine eigenen Katzen löschen) wäre die API anfällig für OWASP A01 (Broken Access Control) gewesen. Die Middleware prüft die Signatur des JWT mit dem serverseitigen Secret aus der `.env` und stellt die Authentizität sicher.
* **Im Nachhinein anders machen:**
  Zusätzlich zum Access-Token hätten wir ein Refresh-Token-Verfahren einführen sollen. So müssen Benutzer sich nicht nach Ablauf des Access-Tokens neu anmelden, während die Token-Lebensdauer dennoch kurz und sicher bleibt.

---

### Studio Session 6: Test-Strategie (Unit- & E2E-Tests)
* **Getroffene Entscheidung:**
  Aufbau einer Testsuite nach der klassischen **Test-Pyramide**: **Vitest** für schnelle Unit- und Integrationstests (Validierungen und mathematische Berechnungen im Backend/Frontend) und **Cypress** für E2E-Tests auf dem kritischen Pfad (Authentifizierung, Katzen-Erstellung und Persistenz).
* **Warum (Alternativen & Begründung):**
  * *Verworfen:* Rein manuelle Tests oder E2E-Tests über Selenium bzw. Playwright.
  * *Begründung:* Manuelle Tests sind fehleranfällig und aufwendig. Cypress wurde gewählt, da es eine hervorragende Developer Experience (interaktiver Testrunner) und stabile Selektoren mittels `data-cy`-Attributen bietet. Vitest wurde wegen seiner extremen Geschwindigkeit gewählt.
* **Im Nachhinein anders machen:**
  Wir hätten von Beginn an eine CI/CD-Pipeline (z. B. GitHub Actions) einbinden sollen, um bei jedem Push oder Pull-Request die Tests automatisch auszuführen und fehlerhafte Builds im Haupt-Zweig direkt zu verhindern.
