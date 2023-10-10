import { randomIntFromInterval } from "./randomIntFromInterval.js";

interface minMaxStatus {
	minHp: number;
	maxHp: number;
	minAtk: number;
	maxAtk: number;
	minDef: number;
	maxDef: number;
	minSpd: number;
	maxSpd: number;
}

export const generateStatus = (minMaxStatus: minMaxStatus) => {
	const hp = randomIntFromInterval(minMaxStatus.minHp, minMaxStatus.maxHp);

	const status = {
		maxHp: hp,
		currentHp: hp,
		atk: randomIntFromInterval(minMaxStatus.minAtk, minMaxStatus.maxAtk),
		def: randomIntFromInterval(minMaxStatus.minDef, minMaxStatus.maxDef),
		spd: randomIntFromInterval(minMaxStatus.minSpd, minMaxStatus.maxSpd),
		maxPp: 60,
		currentPp: 60,
	};

	return status;
};
