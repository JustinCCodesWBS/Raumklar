import { Command } from 'commander';
import type { Filter } from 'mongodb';
import { client } from './db.ts';
import { parseReportId, parseStatus, requireText } from './input.ts';
import {
    changeReport,
    findReport,
    findReports,
    insertReport,
    removeReport,
    searchReports,
    summarizeReports,
    type Report,
} from './reports.ts';

type ListOptions = {
    status?: string;
    room?: string;
    limit: string;
};

export const program = new Command();

program
    .name('raumklar')
    .description('Meldungen zu gemeinsam genutzten Räumen verwalten')
    .version('1.0.0');

program
    .command('list')
    .description('Meldungen auflisten und nach Status oder Raum filtern')
    .option('--status <status>', 'open oder resolved')
    .option('--room <room>', 'Genauer Raumname')
    .option('--limit <number>', 'Anzahl zwischen 1 und 100', '10')
    .action(async (options: ListOptions) => {
        const limit = Number(options.limit);
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            throw new Error('Limit muss eine ganze Zahl zwischen 1 und 100 sein.');
        }

        const filter: Filter<Report> = {};
        if (options.status !== undefined) {
            filter.status = parseStatus(options.status);
        }
        if (options.room !== undefined) {
            filter.room = requireText(options.room, 'Raum');
        }

        await client.connect();
        const documents = await findReports(filter, limit);
        console.log(documents);
    });

program
    .command('get <id>')
    .description('Eine Meldung anhand ihrer ID lesen')
    .action(async (input: string) => {
        const id = parseReportId(input);
        await client.connect();
        const report = await findReport(id);
        console.log(report ?? 'Meldung nicht gefunden.');
    });

program
    .command('add <title> <description> <room>')
    .description('Eine neue offene Meldung anlegen')
    .action(async (title: string, description: string, room: string) => {
        const report: Report = {
            title: requireText(title, 'Titel'),
            description: requireText(description, 'Beschreibung'),
            room: requireText(room, 'Raum'),
            status: 'open',
        };

        await client.connect();
        const id = await insertReport(report);
        console.log('Angelegt:', id.toHexString());
    });

program
    .command('update <id> <title> <description> <room> <status>')
    .description('Die vier Felder einer vorhandenen Meldung ändern')
    .action(async (
        input: string,
        title: string,
        description: string,
        room: string,
        status: string,
    ) => {
        const id = parseReportId(input);
        const changes: Report = {
            title: requireText(title, 'Titel'),
            description: requireText(description, 'Beschreibung'),
            room: requireText(room, 'Raum'),
            status: parseStatus(status),
        };

        await client.connect();
        const result = await changeReport(id, changes);

        if (result.matchedCount === 0) {
            console.log('Meldung nicht gefunden.');
            return;
        }
        console.log('Gefunden:', result.matchedCount);
        console.log('Geändert:', result.modifiedCount);
    });

program
    .command('delete <id>')
    .description('Genau eine Meldung anhand ihrer ID löschen')
    .action(async (input: string) => {
        const id = parseReportId(input);
        await client.connect();
        const result = await removeReport(id);
        console.log('Gelöscht:', result.deletedCount);
    });

program
    .command('search <text>')
    .description('Wörter in Titel und Beschreibung suchen')
    .action(async (input: string) => {
        const text = requireText(input, 'Suchtext');
        await client.connect();
        const documents = await searchReports(text);
        console.log(documents);
    });

program
    .command('summary')
    .description('Offene Meldungen je Raum zählen')
    .action(async () => {
        await client.connect();
        const rooms = await summarizeReports();

        if (rooms.length === 0) {
            console.log('Keine offenen Meldungen vorhanden.');
            return;
        }

        console.log('Offene Meldungen je Raum:');
        for (const room of rooms) {
            console.log(room._id + ': ' + room.openCount + ' offen');
        }
    });
