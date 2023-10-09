import type { Moves } from "../types/Moves.js";

export interface LinemonProps {
	id: string;

	info: {
		name: string;
		description: string;
		lvl: number;
		evolvesAt?: number;
		evolutionStage: number;
		type: string;
		isShiny: boolean;
	};

	status: {
		maxHp: number;
		currentHp: number;
		atk: number;
		def: number;
		spd: number;
		maxPp: number;
		currentPp: number;
	};

	moves: Moves[];

	attack: (
		basePower: number,
		modifiers: number,
		adversaryDefense: number
	) => number;

	sleep: () => void;
}
