# Prompt-Dokumentation: CatSlimDown

Dieses Dokument dokumentiert die Prompt-Iterationen aus den Studio-Sessions, die zur automatischen Codegenerierung verwendet wurden.


##  Studio Session 3: Generierung der CRUD API

Für die Hauptressource cats habe ich die CRUD-API in zwei Prompt-Iterationen erstellt und verbessert.

### ➡️ Iteration 1: Basis-CRUD-Operationen
In der ersten Iteration habe ich die fünf Basisoperationen erzeugen lassen: GET alle Cats, GET Cat per ID, POST neue Cat, PUT Cat ersetzen und DELETE Cat löschen.

### ➡️ Iteration 2: Fehlerbehandlung & HTTP-Statuscodes
Im zweiten Prompt habe ich die Anforderungen präzisiert, insbesondere die Fehlerbehandlung und die exakten HTTP-Statuscodes. Dabei wurde festgelegt: 201 bei erfolgreichem Create, 204 bei erfolgreichem Delete, 404 bei nicht gefundener Ressource und 400 bei ungültigen oder fehlenden Pflichtfeldern.
Zusätzlich wurden konsistente JSON-Fehlermeldungen für Validierungs- und Not-Found-Fälle umgesetzt.
Damit sind die API-Endpunkte nicht nur funktional, sondern auch HTTP-konform und klar testbar dokumentiert.



## Studio Session 4: Migration auf Prisma (Mock-Daten ersetzen)

Für die Umstellung von Mock-Daten auf Prisma habe ich den Endpoint GET/api/cats in zwei Prompt-Iterationen umgesetzt.

### ➡️ Iteration 1: Prisma-Datenbankabfrage einbinden
* **Prompt:**
  > "Ersetze den GET /api/cats-Handler. Bisher: res.json(cats). Neu: Alle Tasks aus der Datenbank laden mit prisma und als JSON zurückgeben. Fehlerbehandlung mit try/catch und 500-Status."

### ➡️ Iteration 2: Query-Parameter & Validierung hinzufügen
* **Prompt:**
  > "Ergänze den GET /api/cats-Handler um einen optionalen Query-Parameter userId mit where-Bedingung in Prisma. Wenn userId gesetzt ist, sollen nur die Cats dieses Users geladen werden; wenn kein userId gesetzt ist, weiterhin alle Cats zurückgeben. Bei ungültigem userId soll der Endpoint 400 Bad Request mit einer klaren Fehlermeldung zurückgeben."


## Studio Session 6: Test-Generierung (Vitest & Cypress)

### ➡️ Iteration 1: Unit-Tests mit Vitest
* **Prompt:**
  > "Schreib Vitest Tests für meine `catHealthCalculations.js` - Normalfall, Grenzfall, Fehlerfall"
* **Ergebnis:**
  Der Agent hat mir 39 Tests geschrieben! Aber es gab ein paar Probleme: Age 0 wurde als falsch behandelt, und Floating-Point-Precision. Nach meinen Fixes waren alle Tests grün.

### ➡️ Iteration 2: Cypress Sad-Path E2E-Tests
* **Prompt:**
  > "Schreib Cypress Tests für Fehlerszenarien - falsches Passwort, leere Felder, geschützte Routes"
* **Ergebnis:**
  Der Agent hat 6 Sad-Path Tests generiert und verwendete direkt `data-cy` Attribute. Das ist viel stabiler als CSS-Selektoren!

## Studio Session 7: Real Time Web

### ➡️ Iteration 1: Basis-Implementierung & CORS-Herausforderung
* **Prompt:**
  "Implementiere einen SSE-Endpoint GET /api/events im Express-Backend. Wenn eine neue Nachricht via POST in der Community angelegt wird, soll der Server allen verbundenen Clients ein Event schicken. Im Frontend soll ein useEffect einen EventSource-Listener öffnen, der bei diesem Event die Nachrichtenliste neu lädt."
* **Ergebnis:**
  Der Verbindungsaufbau im Frontend scheiterte zunächst an CORS-Richtlinien, da Credentials (HTTPOnly-Cookies für die Authentifizierung) im Browser standardmäßig nicht mitgesendet wurden, obwohl das Backend CORS mit Credentials erforderte.

### ➡️ Iteration 2: CORS-Behebung & Feature-Erweiterung (Reaktionen & Posts)
* **Prompt:**
  "Erweitere die `EventSource`-Verbindung im Frontend um `{ withCredentials: true }`, damit die Cookies bei der SSE-Verbindung korrekt übertragen werden. Passe zudem das Express-Backend an, sodass nicht nur bei neuen Nachrichten (`new-message`), sondern auch bei neuen Posts (`new-post`), Reaktionen (`new-reaction`) und beim Löschen von Posts (`delete-post`) ein entsprechendes Event an die Clients gesendet wird, damit die gesamte Community-Ansicht in allen Tabs synchron bleibt."
* **Ergebnis:**
  Die Verbindung wurde erfolgreich hergestellt. Beim Öffnen zweier Browser-Tabs und dem Hinzufügen einer Nachricht oder Reaktion in Tab 1 aktualisiert sich Tab 2 sofort und ohne manuellen Reload.

  ### ➡️ Iteration 1: Installation & Socket-Einrichtung
* **Prompt:**
  "Integriere socket.io in mein Express-Backend (Port 3001) und binde es an den HTTP-Server. Wenn ein Client ein Event 'new-message' mit den Daten einer neuen Nachricht sendet, leite dieses Event mittels `socket.broadcast.emit` an alle anderen verbundenen Clients weiter. Implementiere im Frontend (Community.jsx) die socket.io-client Verbindung, die auf dieses Event lauscht und die neue Nachricht direkt dem State hinzufügt."
* **Ergebnis:**
  Beim ersten Versuch traten im Browser CORS-Verbindungsfehler auf. Da der Express-Server mit Credentials läuft (CORS allow credentials: true), musste beim socket.io Client-Verbindungsaufbau explizit die Konfiguration `{ withCredentials: true }` übergeben werden. Zudem wurde das Senden von Paketen blockiert, da die PowerShell-Ausführungsrichtlinie auf dem System die Ausführung von `npm` (als `.ps1`-Skript) verhinderte. Wir mussten den Paketmanager über `cmd.exe /c` aufrufen und zusätzlich `strict-ssl false` konfigurieren, um lokale SSL-Zertifikatsprobleme beim Download zu umgehen.

### ➡️ Iteration 2: Feature-Vollständigkeit & direkte State-Updates
* **Prompt:**
  "Passe den Verbindungsaufbau an, um Credentials korrekt zu übertragen. Erweitere das Event-Handling, sodass neben neuen Chat-Nachrichten (`new-message`) auch neue Posts (`new-post`), Reaktionen (`new-reaction`) und das Löschen von Beiträgen (`delete-post`) per WebSocket übertragen werden. Im Frontend sollen diese Events die lokalen States `posts` und `messages` direkt manipulieren (z. B. Filterung beim Löschen, Hinzufügen zum Array, inkrementieren der Likes), um die Datenübertragung zu minimieren."
* **Ergebnis:**
  Die bidirektionale Kommunikation läuft fehlerfrei. Wenn ein Benutzer in Tab 1 eine Nachricht schreibt oder auf einen Beitrag reagiert, erscheint das Ergebnis in Tab 2 ohne Verzögerung und ohne zusätzlichen REST-API-Query, da das Frontend das empfangene Daten-Objekt direkt in den State einpflegt.
