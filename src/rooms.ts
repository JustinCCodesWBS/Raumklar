import { Room } from '#models';

export async function findRooms() {
    return Room.find().sort({ name: 1 }).lean();
}
