import { connectDB, disconnectDB } from '#db';
import { createServer } from 'node:http';
import { handleRequest } from './handlers.ts';

async function main() {
    await connectDB();
    const server = createServer((req, res) => {
        handleRequest(req, res).catch(() => {
            console.error('Request-Verarbeitung konnte nicht beendet werden.');
            if (!res.destroyed && !res.writableEnded) res.destroy();
        });
    });
    server.on('error', () => {
        console.error('HTTP-Server konnte nicht starten. Bitte prüfen.');
        disconnectDB().catch(() => {
            process.exitCode = 1;
        })
        process.exitCode = 1;
    })
    server.listen(4000, 'localhost', () => console.log('API: http://localhost:4000'))

    const stop = () => {
        server.close(() => {
            disconnectDB().catch(() =>
                process.exitCode = 1)
        })
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
}

main().catch(async () => {
    console.error('API konnte nicht starten. MongoDB-Verbindung prüfen');
    process.exitCode = 1;
    await disconnectDB().catch(() => {
        console.error('Datenbankverbindung konnte nicht sauber geschlossen werden.')
    })
});
