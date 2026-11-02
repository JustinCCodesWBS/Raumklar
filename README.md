# Raumklar – P4: HTTP-Lesezugriffe

Der Node HTTP Server stellt die vorhandenen Raum und Meldungsdaten über GET bereit.

## Lokal starten

Die vorhandene lokale `.env` enthält `MONGO_URI` für `raumklar_test`. MongoDB muss bereits laufen. Normale Starts führen keine Migration aus.

```bash
npm run typecheck
npm run dev
```

Die API läuft unter `http://localhost:4000`. Mit Ctrl+C wird zuerst der HTTP-Server beendet und danach die Datenbankverbindung geschlossen. `npm start` baut das Projekt über die vorhandenen Hooks und startet das erzeugte JavaScript.

## Verfügbare Routen

| Anfrage                             | Ergebnis                                                           |
| ----------------------------------- | ------------------------------------------------------------------ |
| `GET /rooms`                        | Vorhandene Räume und ihre IDs                                      |
| `GET /reports`                      | Meldungsliste, standardmäßig höchstens zehn Einträge               |
| `GET /reports?status=open&limit=10` | Nach Status gefilterte Meldungen                                   |
| `GET /reports?roomId=HIER_RAUM_ID`  | Meldungen eines vorhandenen Raums                                  |
| `GET /reports?q=Bildschirm`         | Textsuche in Titel und Beschreibung über den vorhandenen Textindex |
| `GET /reports/summary`              | Alle offenen Meldungen je Raum; kein Listenlimit                   |
| `GET /reports/HIER_MELDUNGS_ID`     | Einzelne Meldung oder 404                                          |

Die Platzhalter werden durch echte IDs aus den gelesenen Daten ersetzt. Status, Raum, Suchtext und Limit lassen sich kombinieren. Das Limit muss eine ganze Zahl zwischen 1 und 100 sein. Unbekannte oder doppelte Query Parameter werden abgewiesen.

Andere Methoden an diesen Pfaden ergeben 405 mit `Allow: GET`. Ungültige IDs oder Filter ergeben 400. Nicht vorhandene Routen beziehungsweise Meldungen 404. Unerwartete Fehler erhalten eine allgemeine 500 Antwort.

## Aufbau

- `src/app.ts`: Serverstart und Verbindungsfreigabe.
- `src/handlers.ts`: Pfade, Methoden und HTTP Antworten.
- `src/http.ts`: JSON Antworten sowie ID und Query Prüfungen.
- `src/reports.ts` und `src/rooms.ts`: Datenzugriffe über Mongoose.
- `src/models`: Schemas und Models für Meldungen und Räume.
