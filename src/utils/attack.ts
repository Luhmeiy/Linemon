import jsonTypesEffectiveness from "../data/typesEffectiveness.json";

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
			const modifiers = getTypeModifier(
				move.type,
				defendingLinemon.info.type
			);

			const damage = attackingLinemon.attack(
				move.power,
				modifiers,
				defendingLinemon.status.def
			);

			const updatedHp = defendingLinemon.status.currentHp - damage;

			attackingLinemon.status.currentPp -= move.pp;
			defendingLinemon.status.currentHp = updatedHp <= 0 ? 0 : updatedHp;

			await delayMessage(
				`${attackingLinemon.info.name} used ${move.name}.`
			);

			await delayMessage(
				`${attackingLinemon.info.name} dealt ${damage} damage to ${defendingLinemon.info.name}.\n`
			);
		} else {
			attackingLinemon.status.currentPp -= move.pp;

			createSpinner().error({
				text: `${attackingLinemon.info.name} missed.`,
			});

			await delayMessage(" ");
		}
	} else {
		const recover = attackingLinemon.sleep();
		await delayMessage(
			`${attackingLinemon.info.name} slept and recovered ${recover} pp.\n`
		);
	}
};
