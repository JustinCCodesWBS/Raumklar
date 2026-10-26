import { ObjectId } from "mongodb";

export function parseReportId(input: string): ObjectId {
    if (!ObjectId.isValid(input)) {
        throw new Error('Die ID muss aus 24 Hexzeichen bestehen.');
    }
    return new ObjectId(input);
}