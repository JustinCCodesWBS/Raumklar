import { Schema, model, type InferSchemaType } from 'mongoose';

const locationHintSchema = new Schema({
    area: { type: String, required: true, trim: true, maxlength: 60 },
    detail: { type: String, required: true, trim: true, maxlength: 160 },
}, { _id: false });

const reportSchema = new Schema({
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open', required: true },
    locationHint: { type: locationHintSchema, required: false },
}, { timestamps: true });

reportSchema.index({ status: 1 });
reportSchema.index({ title: 'text', description: 'text' });

export type ReportData = InferSchemaType<typeof reportSchema>;
export const Report = model('Report', reportSchema, 'reports');
