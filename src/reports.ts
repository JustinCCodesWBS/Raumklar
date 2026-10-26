import { db } from "./db.ts";
import { ObjectId } from "mongodb";

export type Report = {
    title: string;
    description: string;
    room: string;
    status: 'open' | 'resolved'
}

const reports = db.collection<Report>('reports');

export async function findReport(id: ObjectId) {
    return reports.findOne({ _id: id });
}