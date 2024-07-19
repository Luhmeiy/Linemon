import { UUID } from "crypto";
import type { Moves } from "../types/Moves.js";

export interface LinemonProps {
	referenceId: UUID;
	id: string;

	info: {
		name: string;
		description: string;
		xp: number;
		xpToNextLevel: number;
		lvl: number;
		evolvesAt?: number;
		evolutionFamily?: string;
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
	setXp: (newXp: number) => void;
	evolve: () => void;
}
