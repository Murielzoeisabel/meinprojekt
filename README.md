# meinprojekt
# katzengewichtstracker

Projekt für Web Architecture. Zeigt den Gewichtsverlauf meiner Katze als Diagramm.

# Architekturentscheidung (Next.js vs. Vite)

Ich habe mich bewusst für Vite entschieden, da die Website interaktiv ist und einen eher app-artigen Ablauf hat. Eine schnelle Client-Interaktion liegt im Fokus. Next.js würde nur dann Vorteile bringen, wenn ich öffentlich auffindbare Inhalte hätte, die von Suchmaschinen sauber idexiert werden sollten. Trotz meines Community-Forums entscheide ich mich für Vite, weil das Forum hauptsächlich innerhalb der App, im Login-Bereich genutzt wird und Interaktivität wichtiger ist als die Suchmaschinenoptimierung. 

## Ressourcen und API-Struktur

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

