import jsonEffects from "@/data/effects.json";
import jsonLinemons from "@/data/linemons.json";

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
	public effects: LinemonProps["effects"];
	public moves: LinemonProps["moves"];

	constructor(data: Linemon) {
		this.id = data.id;
		this.referenceId = data.referenceId;
		this.info = data.info;
		this.status = data.status;
		this.effects = data.effects || [];
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

	// XP
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
			({ info: { evolutionFamily, evolutionStage } }) =>
				evolutionFamily === this.info.evolutionFamily &&
				evolutionStage === this.info.evolutionStage + 1
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

	// Effects
	setEffect = async (effectName: string, duration: number) => {
		const effect = jsonEffects.find(({ id }) => id === effectName);
		const hasEffect = this.effects.find(({ id }) => id === effectName);

		if (hasEffect) {
			hasEffect.duration += duration;
		} else {
			console.log(`${this.info.name} is now ${effect.name}.\n`);
			await delayMessage(null);

			this.effects.push({ ...effect, duration });
		}
	};

	getEffectByAffect = (affect: string) => {
		return this.effects.filter((effect) => {
			if (effect.affects === affect) {
				effect.duration -= 1;
				return effect;
			}
		});
	};

	removeEffect = (effectName: string) => {
		this.effects = this.effects.filter(({ id }) => id !== effectName);
	};

	applyEffects = async () => {
		const effects = this.effects.filter(({ power }) => power !== undefined);

		for (const effect of effects) {
			const damage = Math.floor(this.status.maxHp * effect.power);

			const updatedHp = this.status.currentHp - damage;

			if (effect.id === "poison") {
				this.status.currentHp = updatedHp <= 1 ? 1 : updatedHp;
			} else {
				this.status.currentHp = updatedHp <= 0 ? 0 : updatedHp;
			}

			console.log(
				`${this.info.name} is ${effect.name} and took ${damage} damage.\n`
			);
			await delayMessage(null);

			effect.duration -= 1;

			if (effect.duration === 0) this.removeEffect(effect.id);
		}
	};
}
