import { client } from './db.ts';
import { program } from './cli.ts';

async function main() {
    try {
        await program.parseAsync(process.argv);
    } finally {
        await client.close();
    }
}

main().catch((error: unknown) => {
    console.error('Fehler:', error instanceof Error ? error.message : 'Unbekannter Fehler.');
    process.exitCode = 1;
});
