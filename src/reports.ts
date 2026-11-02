import { type QueryFilter, type Types } from 'mongoose';
import { Report } from '#models';
import type { ReportData } from './models/Report.ts';
import type { ReportInput, RoomSummary } from './types/index.ts';

export async function findReports(filter: QueryFilter<ReportData> = {}, limit = 10) {
    return Report.find(filter).limit(limit).populate('roomId', 'name').lean();
}

export async function findReport(id: Types.ObjectId) {
    return Report.findById(id).populate('roomId', 'name').lean();
}

export async function insertReport(input: ReportInput) {
    const report = new Report(input);
    await report.save();
    await report.populate('roomId', 'name');
    return report;
}

export async function changeReport(id: Types.ObjectId, changes: ReportInput) {
    return Report.updateOne({ _id: id }, { $set: changes }, { runValidators: true });
}

export async function removeReport(id: Types.ObjectId) {
    return Report.deleteOne({ _id: id });
}

export async function summarizeReports() {
    return Report.aggregate<RoomSummary>([
        { $match: { status: 'open' } },
        { $group: { _id: '$roomId', openCount: { $sum: 1 } } },
        {
            $lookup: {
                from: 'rooms',
                localField: '_id',
                foreignField: '_id',
                as: 'room',
            },
        },
        { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0,
                roomId: '$_id',
                room: { $ifNull: ['$room.name', 'Unbekannter Raum'] },
                openCount: 1,
            },
        },
        { $sort: { room: 1 } },
    ]);
}
