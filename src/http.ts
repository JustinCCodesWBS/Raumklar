import type { ServerResponse } from 'node:http';
import { Types, type QueryFilter } from 'mongoose';
import type { ReportData } from './models/Report.ts';

export function send(res: ServerResponse, status: number, body?: unknown) {
    res.statusCode = status;
    res.setHeader('Cache-Control', 'no-store');
    if (status === 204) {
        res.end();
        return;
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

export function parseId(value: unknown): Types.ObjectId | null {
    if (typeof value !== 'string' || !/^[a-fA-F0-9]{24}$/.test(value)) return null;
    return new Types.ObjectId(value);
}

export function text(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    return value.trim();
}

export function statusValue(value: unknown): 'open' | 'resolved' | null {
    if (value !== 'open' && value !== 'resolved') return null;
    return value;
}

export function listFilter(params: URLSearchParams) {
    const allowed = ['status', 'roomId', 'q', 'limit'];
    for (const key of params.keys()) {
        if (!allowed.includes(key) || params.getAll(key).length > 1) return null;
    }
    const limit = Number(params.get('limit') ?? '10');
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) return null;

    const filter: QueryFilter<ReportData> = {};
    if (params.has('status')) {
        const status = statusValue(params.get('status'));
        if (status === null) return null;
        filter.status = status;
    }
    if (params.has('roomId')) {
        const roomId = parseId(params.get('roomId'));
        if (roomId === null) return null;
        filter.roomId = roomId;
    }
    if (params.has('q')) {
        const query = text(params.get('q'));
        if (query === null) return null;
        filter.$text = { $search: query };
    }
    return { filter, limit };
}
