import jsonLinemons from "@/data/linemons.json";

import { randomUUID } from "crypto";
import { createSpinner } from "nanospinner";

import type { LinemonProps } from "@/interfaces/LinemonProps.js";

import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { randomIntFromInterval } from "@/utils/randomIntFromInterval.js";

export class Linemon implements LinemonProps {
	public id: LinemonProps["id"];
	public referenceId: LinemonProps["referenceId"];
	public info: LinemonProps["info"];
	public status: LinemonProps["status"];
	public moves: LinemonProps["moves"];

	constructor(data: Linemon) {
		this.id = data.id;
		this.referenceId = data.referenceId;
		this.info = data.info;
		this.status = data.status;
		this.moves = data.moves;
	}

	attack = (
		basePower: number,
		modifiers: number,
		adversaryDefense: number
	) => {
		const damage = Math.floor(
			((this.info.lvl * 2) / 5 + 2) *
				((basePower * this.status!.atk) / adversaryDefense) *
				(modifiers / 50) *
				randomIntFromInterval(0.85, 1) +
				2
		);

		return damage;
	};

	sleep = () => {
		const { currentPp, maxPp } = this.status;

		const recover =
			currentPp + maxPp / 2 > maxPp ? maxPp - currentPp : maxPp / 2;

		this.status.currentPp += recover;

		return recover;
	};

	setXp = async (linemonXp: number) => {
		const { xpToNextLevel } = this.info;

		const newXp =
			this.info.xp + linemonXp > xpToNextLevel
				? xpToNextLevel - this.info.xp
				: linemonXp;
		const remainingXp = linemonXp - newXp;

		this.info.xp += newXp;

		if (this.info.xp >= xpToNextLevel) {
			this.info.lvl += 1;
			this.info.xpToNextLevel = Math.floor((this.info.lvl + 1) ** 3 / 2);
			this.info.xp = remainingXp;

			if (this.info.lvl === this.info.evolvesAt) {
				await delayMessage(`What? ${this.info.name} is evolving!\n`);

				const answer = await createPrompt(
					`Want to prevent ${this.info.name} from evolving?`,
					[
						{ name: "No", value: "no" },
						{ name: "Yes", value: "yes" },
					]
				);

				switch (answer) {
					case "no":
						return await this.evolve();
					case "yes":
						return await delayMessage(
							`${this.info.name} stopped evolving.\n`
						);
				}
			}
		}
	};

	evolve = async () => {
		const evolution = jsonLinemons.find(
			(linemon: any) =>
				linemon.info.evolutionFamily === this.info.evolutionFamily &&
				linemon.info.evolutionStage === this.info.evolutionStage + 1
		);

		if (evolution) {
			console.log();

			const spinner = createSpinner(
				`${this.info.name} is evolving...`
			).start();

			await delayMessage(null);

			spinner.success({
				text: `Congratulations! Your ${this.info.name} evolved into ${evolution.info.name}!\n`,
			});

			await delayMessage(null);

			this.id = evolution.id;
			this.info = {
				...evolution.info,
				lvl: this.info.lvl,
				xp: this.info.xp,
				xpToNextLevel: this.info.xpToNextLevel,
				isShiny: this.info.isShiny,
			};
		}
	};
}
