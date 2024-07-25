import jsonTypesEffectiveness from "@/data/typesEffectiveness.json";

import { createSpinner } from "nanospinner";

import type { LinemonProps } from "@/interfaces/LinemonProps.js";
import type { Moves } from "@/types/Moves.js";
import { ReturnUrlParams } from "@/types/ReturnUrlParams.js";

import { player } from "@/routes/map/index.js";
import { delayMessage } from "./delayMessage.js";
import { getRoute } from "./getRoute.js";
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

const verifyIfDefeated = async (
	url: string,
	returnUrlParams: ReturnUrlParams,
	linemon: LinemonProps,
	adversary: LinemonProps,
	move: Moves
) => {
	let defeatedLinemon: LinemonProps;

	if (linemon.status.currentHp <= 0 || adversary.status.currentHp <= 0) {
		defeatedLinemon = linemon.status.currentHp <= 0 ? linemon : adversary;
	}

	if (defeatedLinemon) {
		await delayMessage(`${defeatedLinemon.info.name} was defeated.\n`);

		if (!player.team.getLinemonById(defeatedLinemon.referenceId)) {
			const xp = (112 * adversary.info.lvl) / 7;
			linemon.setXp(xp);

			await delayMessage(`${linemon.info.name} received ${xp} xp.\n`);

			return await getRoute(url, {
				...returnUrlParams,
				battleWon: true,
			});
		}

		return await getRoute(url, {
			...returnUrlParams,
			activePlayerLinemonId: "",
		});
	}

	if (move.effect) {
		await linemon.setEffect(move.effect, move.duration);
	}
};

export const attack = async (
	url: string,
	returnUrlParams: ReturnUrlParams,
	move: Moves,
	attackingLinemon: LinemonProps,
	defendingLinemon: LinemonProps
) => {
	if (attackingLinemon.status.currentPp >= move.pp) {
		const random = randomIntFromInterval(1, 100);

		const accuracyModifier = attackingLinemon.getEffectByAffect("accuracy");

		const linemonAccuracy = accuracyModifier
			? accuracyModifier.reduce(
					(modifier, current) => modifier * current.effect,
					move.accuracy
			  )
			: move.accuracy;

		if (random <= linemonAccuracy) {
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

			return await verifyIfDefeated(
				url,
				returnUrlParams,
				defendingLinemon,
				attackingLinemon,
				move
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
