import { Schema, model } from 'mongoose';

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
        unique: true,
    },
});

export const Room = model('Room', roomSchema, 'rooms');
