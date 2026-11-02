import mongoose from 'mongoose';

export async function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI ist nicht gesetzt. Prüfe die .env-Datei und starte mit npm run dev oder npm start.');
    }
    await mongoose.connect(uri, { dbName: 'raumklar_test', autoIndex: false });
}

export async function disconnectDB() {
    await mongoose.disconnect();
}
