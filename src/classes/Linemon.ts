import type { LinemonProps } from "../interfaces/LinemonProps.js";
import { randomIntFromInterval } from "../utils/randomIntFromInterval.js";

export class Linemon implements LinemonProps {
	constructor(
		public id: LinemonProps["id"],
		public info: LinemonProps["info"],
		public status: LinemonProps["status"],
		public moves: LinemonProps["moves"]
	) {}

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
