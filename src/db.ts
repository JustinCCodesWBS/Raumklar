import { MongoClient } from "mongodb";

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    throw new Error(
        'MONGO_URI ist nicht gesetzt. Prüfe den Eintrag in der .env Datei und starte mit npm run dev oder npm start!'
    );
}

export const client = new MongoClient(mongoURI);
export const db = client.db('raumklar_test');