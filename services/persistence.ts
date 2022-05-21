
import { clubs } from '../deps.ts';

class PersistenceManager {
	processes: Persistence[] = [];

	getClub(clubId: string) {
		return clubs.find(club => club.id === clubId) || { short: '' };
	}

	getPersistence(clubId: string) {
		return this.processes.find(p => p._name === clubId);
	}

	log(clubId: string, event: string) {
		const ls = `[LOG] ${this.getClub(clubId).short} - ${event}`;
		console.log(ls);
		this.processes.find(p => p._name === clubId)?.log(ls);
	}

	startProcess(clubId: string, process: string) {
		const ls = `[EVT] ${this.getClub(clubId).short} - Process start: ${process}`;
		console.log(ls);
		this.processes.push(new Persistence(clubId));
		this.processes.find(p => p._name === clubId)?.log(ls);
	}

	endProcess(clubId: string, process: string) {
		const ls = `[EVT] ${this.getClub(clubId).short} - Process end: ${process}`;
		console.log(ls);
		this.processes.splice(this.processes.findIndex(p => p._name === clubId), 1);
	}
}

class Persistence {
	_name: string;
	_log: string[] = [];

	constructor(name: string) {
		this._name = name;
	}

	log(event: string) {
		this._log.push(event);
	}
}

export const persistence = new PersistenceManager();