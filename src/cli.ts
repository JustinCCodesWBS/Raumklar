import { Command } from 'commander';
import type { QueryFilter } from 'mongoose';
import { connectDB } from '#db';
import type { ReportData } from './models/Report.ts';
import type { ReportInput } from './types/index.ts';
import { parseReportId, parseStatus, requireText } from './input.ts';
import {
    changeReport,
    findReport,
    findReports,
    insertReport,
    removeReport,
    searchReports,
    summarizeReports,
} from './reports.ts';
import { findRoomByName, findRooms } from './rooms.ts';

type ListOptions = {
    status?: string;
    room?: string;
    limit: string;
};

type AddOptions = {
    area?: string;
    detail?: string;
};

async function findRoom(name: string) {
    const room = await findRoomByName(requireText(name, 'Raum'));
    if (!room) {
        throw new Error('Raum nicht gefunden. Mit rooms die vorhandenen Namen ansehen.');
    }
    return room;
}

export const program = new Command();

program
    .name('raumklar')
    .description('Meldungen zu gemeinsam genutzten Räumen verwalten')
    .version('1.0.0');

program
    .command('rooms')
    .description('Vorhandene Räume anzeigen')
    .action(async () => {
        await connectDB();
        const rooms = await findRooms();
        console.log(rooms);
    });

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

        const filter: QueryFilter<ReportData> = {};
        if (options.status !== undefined) {
            filter.status = parseStatus(options.status);
        }

        let roomName: string | undefined;
        if (options.room !== undefined) {
            roomName = requireText(options.room, 'Raum');
        }

        await connectDB();
        if (roomName !== undefined) {
            const room = await findRoom(roomName);
            filter.roomId = room._id;
        }

        const documents = await findReports(filter, limit);
        console.log(documents);
    });

program
    .command('get <id>')
    .description('Eine Meldung anhand ihrer ID lesen')
    .action(async (input: string) => {
        const id = parseReportId(input);
        await connectDB();
        const report = await findReport(id);
        console.log(report ?? 'Meldung nicht gefunden.');
    });

program
    .command('add <title> <description> <room>')
    .description('Eine neue offene Meldung anlegen')
    .option('--area <area>', 'Bereich im Raum')
    .option('--detail <detail>', 'Genauer Ortshinweis')
    .action(async (
        title: string,
        description: string,
        roomName: string,
        options: AddOptions,
    ) => {
        const titleText = requireText(title, 'Titel');
        const descriptionText = requireText(description, 'Beschreibung');
        const roomText = requireText(roomName, 'Raum');

        if ((options.area === undefined) !== (options.detail === undefined)) {
            throw new Error('area und detail gemeinsam angeben.');
        }

        let locationHint: { area: string; detail: string } | undefined;
        if (options.area !== undefined && options.detail !== undefined) {
            locationHint = {
                area: requireText(options.area, 'Bereich'),
                detail: requireText(options.detail, 'Detail'),
            };
        }

        await connectDB();
        const room = await findRoom(roomText);
        const input: ReportInput = {
            title: titleText,
            description: descriptionText,
            roomId: room._id,
            status: 'open',
        };
        if (locationHint !== undefined) {
            input.locationHint = locationHint;
        }

        const report = await insertReport(input);
        console.log('Angelegt:', report._id.toString());
    });

program
    .command('update <id> <title> <description> <room> <status>')
    .description('Die vier Felder einer vorhandenen Meldung ändern')
    .action(async (
        input: string,
        title: string,
        description: string,
        roomName: string,
        status: string,
    ) => {
        const id = parseReportId(input);
        const titleText = requireText(title, 'Titel');
        const descriptionText = requireText(description, 'Beschreibung');
        const roomText = requireText(roomName, 'Raum');
        const nextStatus = parseStatus(status);

        await connectDB();
        const room = await findRoom(roomText);
        const changes: ReportInput = {
            title: titleText,
            description: descriptionText,
            roomId: room._id,
            status: nextStatus,
        };
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
        await connectDB();
        const result = await removeReport(id);
        console.log('Gelöscht:', result.deletedCount);
    });

program
    .command('search <text>')
    .description('Wörter in Titel und Beschreibung suchen')
    .action(async (input: string) => {
        const text = requireText(input, 'Suchtext');
        await connectDB();
        const documents = await searchReports(text);
        console.log(documents);
    });

program
    .command('summary')
    .description('Offene Meldungen je Raum zählen')
    .action(async () => {
        await connectDB();
        const rooms = await summarizeReports();

        if (rooms.length === 0) {
            console.log('Keine offenen Meldungen vorhanden.');
            return;
        }

        console.log('Offene Meldungen je Raum:');
        for (const room of rooms) {
            console.log(room.room + ': ' + room.openCount + ' offen');
        }
    });
