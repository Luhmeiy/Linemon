import type { WildLinemonProps } from "../interfaces/WildLinemonProps.js";

import { randomIntFromInterval } from "../utils/randomIntFromInterval.js";

export class WildLinemon implements WildLinemonProps {
	status: {
		hp: number;
		atk: number;
		def: number;
		spd: number;
		sp: number;
	};

	constructor(
		public id: WildLinemonProps["id"],
		public info: WildLinemonProps["info"],
		public minMaxStatus: WildLinemonProps["minMaxStatus"]
	) {
		this.status = {
			hp: randomIntFromInterval(
				this.minMaxStatus.minHp,
				this.minMaxStatus.maxHp
			),
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
			sp: 50,
		};
	}
}
