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

	effects: {
		id: string;
		name: string;
		duration: number;
		power?: number;
		effect?: number;
		affects?: string;
	}[];

	moves: Moves[];

	attack: (
		basePower: number,
		modifiers: number,
		adversaryDefense: number
	) => number;

	sleep: () => void;
	setXp: (newXp: number) => void;
	evolve: () => void;
	setEffect: (effectName: string, duration: number) => void;
	getEffectByAffect: (affect: string) => LinemonProps["effects"];
	removeEffect: (effectName: string) => void;
	applyEffects: () => void;
}
