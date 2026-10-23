import { pickRandom } from '#utils';

type Report = {
    title: string;
    description: string;
    room: string;
    status: 'open' | 'resolved'
}

const report: Report = {

    title: 'Bildschirm bleibt schwarz',
    description: 'Der angeschlossene Bildschirm zeigt beim Einschalten kein Bild.',
    room: 'Raum A',
    status: 'open',
}

console.log(report);
console.log('Zufälliger Raum:', pickRandom(['Raum A', 'Raum B']));
console.log('Leere Auswahl:', pickRandom([]));