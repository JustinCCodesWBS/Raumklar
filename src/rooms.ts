import { Room } from '#models';

export async function findRooms() {
    return Room.find().sort({ name: 1 }).lean();
}

export async function findRoomByName(name: string) {
    return Room.findOne({ name });
}
