import type { Moves } from "../types/Moves.js";

export interface WildLinemonProps {
	id: string;

	info: {
		name: string;
		description: string;
		lvl: number;
		evolvesAt?: number;
		evolutionStage: number;
		type: string;
		isShiny: boolean;
		catchRate: number;
	};

	status: {
		maxHp: number;
		currentHp: number;
		atk: number;
		def: number;
		spd: number;
		pp: number;
	};

	moves: Moves[];
}
