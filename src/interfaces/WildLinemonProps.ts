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

	status: {
		maxHp: number;
		currentHp: number;
		atk: number;
		def: number;
		spd: number;
		sp: number;
	};
}