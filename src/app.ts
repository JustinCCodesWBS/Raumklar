import { client } from "./db.ts";
import { findReport } from "./reports.ts";
import { parseReportId } from "./input.ts";


async function main() {
    try {
        const input = process.argv[2];
        if (!input) throw new Error('Bitte eine Meldungs-ID als Argument angeben.')

        const id = parseReportId(input);

        await client.connect();

        const report = await findReport(id);

        console.log(report ?? 'Meldung nicht gefunden.')

    } finally {
        await client.close();
    }
}

main().catch((error: unknown) => {
    console.error('Fehler:', error instanceof Error ? error.message : 'Unbekannter Fehler');
    process.exitCode = 1;
});