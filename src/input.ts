import { ObjectId } from 'mongodb';

export function parseReportId(input: string): ObjectId {
    if (!ObjectId.isValid(input)) {
        throw new Error('Die ID muss aus 24 Hexzeichen bestehen.');
    }
    return new ObjectId(input);
}

export function requireText(input: string, fieldName: string): string {
    const value = input.trim();
    if (value.length === 0) {
        throw new Error(`${fieldName} darf nicht leer sein.`);
    }
    return value;
}

export function parseStatus(input: string): 'open' | 'resolved' {
    if (input !== 'open' && input !== 'resolved') {
        throw new Error('Status muss open oder resolved sein.');
    }
    return input;
}
