import jsonTypesEffectiveness from "../data/typesEffectiveness.json" assert { type: "json" };

import { createSpinner } from "nanospinner";

import type { LinemonProps } from "../interfaces/LinemonProps.js";
import type { Moves } from "../types/Moves.js";

import { delayMessage } from "./delayMessage.js";
import { randomIntFromInterval } from "./randomIntFromInterval.js";

const typesEffectiveness: { [key: string]: { [key: string]: number } } =
	jsonTypesEffectiveness;

const getTypeModifier = (attackType: string, linemonType: string) => {
	if (attackType !== "normal" && linemonType !== "normal") {
		return typesEffectiveness[attackType][linemonType] || 1;
	} else {
		return 1;
	}
};

export const attack = async (
	move: Moves,
	attackingLinemon: LinemonProps,
	defendingLinemon: LinemonProps
) => {
	if (attackingLinemon.status.currentPp >= move.pp) {
		const random = randomIntFromInterval(1, 100);

		if (random <= move.accuracy) {
			await delayMessage(
				`${attackingLinemon.info.name} used ${move.name}.`
			);

			const modifiers = getTypeModifier(
				move.type,
				defendingLinemon.info.type
			);

			const damage = attackingLinemon.attack(
				move.power,
				modifiers,
				defendingLinemon.status.def
			);

			attackingLinemon.status.currentPp -= move.pp;
			defendingLinemon.status.currentHp -= damage;
			await delayMessage(
				`${attackingLinemon.info.name} dealt ${damage} damage to ${defendingLinemon.info.name}.\n`
			);
		} else {
			const spinner = createSpinner("Catching...").start();
			spinner.error({
				text: `${attackingLinemon.info.name} missed.`,
			});

			await delayMessage(" ");
		}
	} else {
		attackingLinemon.sleep();
		await delayMessage(
			`${attackingLinemon.info.name} slept and recovered ${
				attackingLinemon.status.maxPp / 2
			} pp.\n`
		);
	}
};
