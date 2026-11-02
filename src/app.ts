import { program } from './cli.ts';
import { disconnectDB } from '#db';

async function main() {
    try {
        await program.parseAsync(process.argv);
    } finally {
        await disconnectDB();
    }
}

main().catch((error: unknown) => {
    console.error('Fehler:', error instanceof Error ? error.message : 'Unbekannter Fehler.');
    process.exitCode = 1;
});
