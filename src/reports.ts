import { ObjectId, type Filter } from 'mongodb';
import { db } from './db.ts';

export type Report = {
    title: string;
    description: string;
    room: string;
    status: 'open' | 'resolved';
};

export type RoomSummary = {
    _id: string;
    openCount: number;
};

const reports = db.collection<Report>('reports');

export async function findReport(id: ObjectId) {
    return reports.findOne({ _id: id });
}

export async function findReports(filter: Filter<Report> = {}, limit = 10) {
    const cursor = reports.find(filter).limit(limit);
    const documents = await cursor.toArray();
    return documents;
}

export async function insertReport(report: Report) {
    const result = await reports.insertOne(report);
    return result.insertedId;
}

export async function changeReport(id: ObjectId, changes: Report) {
    return reports.updateOne({ _id: id }, { $set: changes });
}

export async function removeReport(id: ObjectId) {
    return reports.deleteOne({ _id: id });
}

export async function searchReports(text: string) {
    const cursor = reports.find({ $text: { $search: text } });
    return cursor.toArray();
}

export async function summarizeReports() {
    const cursor = reports.aggregate<RoomSummary>([
        { $match: { status: 'open' } },
        { $group: { _id: '$room', openCount: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);
    return cursor.toArray();
}
