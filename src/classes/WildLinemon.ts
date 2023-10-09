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
		maxPp: number;
		currentPp: number;
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
			maxPp: 60,
			currentPp: 60,
		};
	}

	attack = (
		basePower: number,
		modifiers: number,
		adversaryDefense: number
	) => {
		const damage = Math.floor(
			((this.info.lvl * 2) / 5 + 2) *
				((basePower * this.status.atk) / adversaryDefense) *
				(modifiers / 50) *
				randomIntFromInterval(0.85, 1) +
				2
		);

		return damage;
	};

	sleep = () => {
		const recover = this.status.currentPp + this.status.maxPp / 2;

		this.status.currentPp =
			recover > this.status.maxPp ? this.status.maxPp : recover;
	};
}
