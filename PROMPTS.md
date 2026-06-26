# Prompt-Dokumentation: CatSlimDown

Dieses Dokument dokumentiert die Prompt-Iterationen aus den Studio-Sessions, die zur automatischen Codegenerierung verwendet wurden.

---

## 🤖 Studio Session 3: Generierung der CRUD API

Für die Hauptressource cats habe ich die CRUD-API in zwei Prompt-Iterationen erstellt und verbessert.

### ➡️ Iteration 1: Basis-CRUD-Operationen
In der ersten Iteration habe ich die fünf Basisoperationen erzeugen lassen: GET alle Cats, GET Cat per ID, POST neue Cat, PUT Cat ersetzen und DELETE Cat löschen.

### ➡️ Iteration 2: Fehlerbehandlung & HTTP-Statuscodes
Im zweiten Prompt habe ich die Anforderungen präzisiert, insbesondere die Fehlerbehandlung und die exakten HTTP-Statuscodes. Dabei wurde festgelegt: 201 bei erfolgreichem Create, 204 bei erfolgreichem Delete, 404 bei nicht gefundener Ressource und 400 bei ungültigen oder fehlenden Pflichtfeldern.
Zusätzlich wurden konsistente JSON-Fehlermeldungen für Validierungs- und Not-Found-Fälle umgesetzt.
Damit sind die API-Endpunkte nicht nur funktional, sondern auch HTTP-konform und klar testbar dokumentiert.

---

## 🤖 Studio Session 4: Migration auf Prisma (Mock-Daten ersetzen)

Für die Umstellung von Mock-Daten auf Prisma habe ich den Endpoint GET/api/cats in zwei Prompt-Iterationen umgesetzt.

### ➡️ Iteration 1: Prisma-Datenbankabfrage einbinden
* **Prompt:**
  > "Ersetze den GET /api/cats-Handler. Bisher: res.json(cats). Neu: Alle Tasks aus der Datenbank laden mit prisma und als JSON zurückgeben. Fehlerbehandlung mit try/catch und 500-Status."

### ➡️ Iteration 2: Query-Parameter & Validierung hinzufügen
* **Prompt:**
  > "Ergänze den GET /api/cats-Handler um einen optionalen Query-Parameter userId mit where-Bedingung in Prisma. Wenn userId gesetzt ist, sollen nur die Cats dieses Users geladen werden; wenn kein userId gesetzt ist, weiterhin alle Cats zurückgeben. Bei ungültigem userId soll der Endpoint 400 Bad Request mit einer klaren Fehlermeldung zurückgeben."

---

## 🤖 Studio Session 6: Test-Generierung (Vitest & Cypress)

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
