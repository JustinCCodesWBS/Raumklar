import type { Types } from 'mongoose';

export type ReportInput = {
    title: string;
    description: string;
    roomId: Types.ObjectId;
    status: 'open' | 'resolved';
    locationHint?: { area: string; detail: string };
};

export type RoomSummary = {
    roomId: Types.ObjectId;
    room: string;
    openCount: number;
};
