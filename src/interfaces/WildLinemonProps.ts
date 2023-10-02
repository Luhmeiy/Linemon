export interface WildLinemonProps {
	id: number;

	info: {
		name: string;
		description: string;
		lvl: number;
		evolvesAt?: number;
		evolutionStage: number;
		type: string;
		isShiny: boolean;
	};

	minMaxStatus: {
		minHp: number;
		maxHp: number;
		minAtk: number;
		maxAtk: number;
		minDef: number;
		maxDef: number;
		minSpd: number;
		maxSpd: number;
	};
}
