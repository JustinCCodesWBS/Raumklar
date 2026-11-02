# Raumklar – P3

Meldungsverwaltung als TypeScript-CLI mit Commander und Mongoose. Ausgangspunkt für den nativen HTTP-Server in P4.

## Lokal starten

Die lokale `.env` enthält `MONGO_URI` für `raumklar_test`; `.env.example` zeigt die Form ohne echte Zugangsdaten. MongoDB muss bereits laufen. Die Raumtexte aus P2 werden beim Übergang zu P3 einmalig auf `roomId`-Referenzen umgestellt. Normale Programmstarts führen keine Migration aus.

```bash
npm run typecheck
npm run dev -- --help
npm run dev -- rooms
npm run dev -- list --status open --room "Raum A" --limit 10
npm run dev -- summary
npm start -- summary
```

## Befehle

- `rooms`: Vorhandene Räume anzeigen.
- `list`: Meldungen mit optionalem Status-, Raumfilter und Limit auflisten.
- `get <id>`: Eine Meldung lesen.
- `add <title> <description> <room>`: Eine offene Meldung anlegen; optional `--area` und `--detail` gemeinsam angeben.
- `update <id> <title> <description> <room> <status>`: Titel, Beschreibung, Raum und Status ändern; ein vorhandener Ortshinweis bleibt erhalten.
- `delete <id>`: Genau eine Meldung löschen.
- `search <text>`: Titel und Beschreibung über den MongoDB-Textindex durchsuchen.
- `summary`: Alle offenen Meldungen je Raum zählen.

Die CLI öffnet die Datenbankverbindung für einen Aufruf und schließt sie anschließend. Raumdaten werden separat gespeichert; Meldungen referenzieren ihre Räume. Der optionale Ortshinweis ist eingebettet. Mongoose verwaltet Validierung und Zeitstempel.
