import type { WildLinemonProps } from "../interfaces/WildLinemonProps.js";
import { randomIntFromInterval } from "../utils/randomIntFromInterval.js";

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

export class WildLinemon implements WildLinemonProps {
	status: {
		maxHp: number;
		currentHp: number;
		atk: number;
		def: number;
		spd: number;
		pp: number;
	};

	constructor(
		public id: WildLinemonProps["id"],
		public info: WildLinemonProps["info"],
		private minMaxStatus: minMaxStatus,
		public moves: WildLinemonProps["moves"]
	) {
		const hp = randomIntFromInterval(
			this.minMaxStatus.minHp,
			this.minMaxStatus.maxHp
		);

		this.status = {
			maxHp: hp,
			currentHp: hp,
			atk: randomIntFromInterval(
				this.minMaxStatus.minAtk,
				this.minMaxStatus.maxAtk
			),
			def: randomIntFromInterval(
				this.minMaxStatus.minDef,
				this.minMaxStatus.maxDef
			),
			spd: randomIntFromInterval(
				this.minMaxStatus.minSpd,
				this.minMaxStatus.maxSpd
			),
			pp: 50,
		};
	}
}
