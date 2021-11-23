
import { clubs } from '../deps.ts';

class PersistenceManager {
	events: { [key: string]: string[] } = {};
	processes: { [key: string]: string[] } = {};

	constructor(clubs: any[]) {
		clubs.forEach(club => {
			this.events[club.id] = [];
			this.processes[club.id] = [];
		});
	}

	getClub(clubId: string) {
		return clubs.find(club => club.id === clubId) || { short: '' };
	}

	log(clubId: string, event: string) {
		console.log(`[LOG] ${this.getClub(clubId).short} - ${event}`);
		this.events[clubId].push(event);
	}

	startProcess(clubId: string, process: string) {
		console.log(`[EVT] ${this.getClub(clubId).short} - Process start: ${process}`);
		this.processes[clubId].push(process);
	}

	endProcess(clubId: string, process: string) {
		console.log(`[EVT] ${this.getClub(clubId).short} - Process end: ${process}`);
		this.processes[clubId].splice(this.processes[clubId].indexOf(process), 1);
	}
}

export const persistence = new PersistenceManager(clubs);