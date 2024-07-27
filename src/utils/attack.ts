import jsonTypesEffectiveness from "@/data/typesEffectiveness.json";

import { createSpinner } from "nanospinner";

import type { LinemonProps } from "@/interfaces/LinemonProps.js";
import type { Moves } from "@/types/Moves.js";

import { player } from "@/routes/map/index.js";
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

const verifyIfDefeated = async (
	returnFunction: ({}) => void,
	linemon: LinemonProps,
	adversary: LinemonProps,
	move: Moves
) => {
	let defeatedLinemon: LinemonProps;
	let winnerLinemon: LinemonProps;

	if (linemon.status.currentHp <= 0 || adversary.status.currentHp <= 0) {
		defeatedLinemon = linemon.status.currentHp <= 0 ? linemon : adversary;
		winnerLinemon = linemon.status.currentHp <= 0 ? adversary : linemon;
	}

	if (defeatedLinemon) {
		await delayMessage(`${defeatedLinemon.info.name} was defeated.\n`);

		if (!player.team.getLinemonById(defeatedLinemon.referenceId)) {
			const xp = (112 * defeatedLinemon.info.lvl) / 7;

			await delayMessage(
				`${winnerLinemon.info.name} received ${xp} xp.\n`
			);

			await winnerLinemon.setXp(xp);
			return await returnFunction({ battleWon: true });
		}

		return await returnFunction({ activePlayerLinemonId: "" });
	}

	if (move.effect) {
		await linemon.setEffect(move.effect, move.duration);
	}
};

export const attack = async (
	returnFunction: ({}) => void,
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

			await delayMessage(
				`${attackingLinemon.info.name} used ${move.name}.`
			);

			let damage = 0;

			if (move.repeat) {
				const repeatTimes = randomIntFromInterval(1, move.repeat);

				for (let i = 1; i <= repeatTimes; i++) {
					damage += attackingLinemon.attack(
						move.power,
						modifiers,
						defendingLinemon.status.def
					);

					await delayMessage(
						`${attackingLinemon.info.name} hit ${defendingLinemon.info.name} ${i} times.`,
						1000
					);
				}

				await delayMessage(" ", 1000);
			} else {
				damage = attackingLinemon.attack(
					move.power,
					modifiers,
					defendingLinemon.status.def
				);
			}

			const { currentHp } = defendingLinemon.status;

			damage = damage >= currentHp ? currentHp : damage;

			await delayMessage(
				`${attackingLinemon.info.name} dealt ${damage} damage to ${defendingLinemon.info.name}.\n`
			);

			const updatedHp = defendingLinemon.status.currentHp - damage;

			attackingLinemon.status.currentPp -= move.pp;
			defendingLinemon.status.currentHp = updatedHp <= 0 ? 0 : updatedHp;

			return await verifyIfDefeated(
				returnFunction,
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
