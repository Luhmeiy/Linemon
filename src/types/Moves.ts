export type Moves = {
	name: string;
	description: string;
	type: string;
	power: number;
	accuracy: number;
	pp: number;
	effect?: string;
	duration?: number;
	isFirst?: boolean;
	repeat?: number;
};
