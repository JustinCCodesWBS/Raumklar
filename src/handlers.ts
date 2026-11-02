import type { IncomingMessage, ServerResponse } from 'node:http';
import { send, listFilter, parseId } from './http.ts';
import { findRooms } from './rooms.ts';
import { findReports, summarizeReports, findReport } from './reports.ts';

export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
    try {
        const url = new URL(req.url ?? '/', 'http://localhost:4000');
        const path = url.pathname;
        const method = req.method;

        if (path === '/rooms') {
            if (method !== 'GET') {
                res.setHeader('Allow', 'GET');
                send(res, 405, { message: 'Methode nicht erlaubt.' });
                return;
            }
            send(res, 200, await findRooms());
            return;
        }

        if (path === '/reports/summary') {
            if (method !== 'GET') {
                res.setHeader('Allow', 'GET');
                send(res, 405, { message: 'Methode nicht erlaubt.' });
                return;
            }
            send(res, 200, await summarizeReports());
            return;
        }

        if (path === '/reports') {
            if (method === 'GET') {
                const parsed = listFilter(url.searchParams);
                if (parsed === null) {
                    send(res, 400, { message: 'Ungültige Query-Parameter.' });
                    return;
                }
                send(res, 200, await findReports(parsed.filter, parsed.limit));
                return;
            }
            res.setHeader('Allow', 'GET');
            send(res, 405, { message: 'Methode nicht erlaubt.' });
            return;
        }

        const match = /^\/reports\/([^/]+)$/.exec(path);
        if (match) {
            const id = parseId(match[1]);
            if (id === null) {
                send(res, 400, { message: 'Die ID muss aus 24 Hexzeichen bestehen.' });
                return;
            }
            if (method === 'GET') {
                const report = await findReport(id);
                if (!report) {
                    send(res, 404, { message: 'Meldung nicht gefunden.' });
                    return;
                }
                send(res, 200, report);
                return;
            }
            res.setHeader('Allow', 'GET');
            send(res, 405, { message: 'Methode nicht erlaubt.' });
            return;
        }

        send(res, 404, { message: 'Route nicht gefunden.' });
    } catch {
        if (res.destroyed || res.writableEnded) return;
        if (res.headersSent) {
            res.destroy();
            return;
        }
        send(res, 500, { message: 'Interner Serverfehler.' });
    }
}
