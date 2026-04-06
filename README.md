# meinprojekt
# CatSlimDown
# katzengewichtstracker

Projekt für Web Architecture. Zeigt den Gewichtsverlauf meiner Katze als Diagramm.

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

# Generierung der CRUD API

Für die Hauptressource cats habe ich die CRUD-API in zwei Prompt-Iterationen erstellt und verbessert.
In der ersten Iteration habe ich die fünf Basisoperationen erzeugen lassen: GET alle Cats, GET Cat per ID, POST neue Cat, PUT Cat ersetzen und DELETE Cat löschen.
Im zweiten Prompt habe ich die Anforderungen präzisiert, insbesondere die Fehlerbehandlung und die exakten HTTP-Statuscodes. Dabei wurde festgelegt: 201 bei erfolgreichem Create, 204 bei erfolgreichem Delete, 404 bei nicht gefundener Ressource und 400 bei ungültigen oder fehlenden Pflichtfeldern.
Zusätzlich wurden konsistente JSON-Fehlermeldungen für Validierungs- und Not-Found-Fälle umgesetzt.
Damit sind die API-Endpunkte nicht nur funktional, sondern auch HTTP-konform und klar testbar dokumentiert.

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


# Kurzfazit

- Alle fünf Endpunkte wurden erfolgreich getestet.
- Pro Endpoint wurde mindestens ein Fehlerfall nachgewiesen.
- Die API liefert die erwarteten HTTP-Statuscodes und strukturierte Fehlermeldungen.
