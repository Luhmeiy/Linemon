import jsonTypesEffectiveness from "../data/typesEffectiveness.json" assert { type: "json" };

import { createSpinner } from "nanospinner";

import type { LinemonProps } from "../interfaces/LinemonProps.js";
import type { WildLinemonProps } from "../interfaces/WildLinemonProps.js";
import type { Moves } from "../types/Moves.js";

import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { randomIntFromInterval } from "./randomIntFromInterval.js";

const typesEffectiveness: { [key: string]: { [key: string]: number } } =
	jsonTypesEffectiveness;

const moveOptions = [
	{ name: "Use", value: "use" },
	{ name: "Description", value: "description" },
	{ name: "Status", value: "status" },
	{ name: "Go back", value: "back" },
];

const createOptions = (moves: LinemonProps["moves"]) => {
	return moves.map((move, i) => {
		return {
			name: move.name,
			value: `${i}`,
		};
	});
};

const getTypeModifier = (attackType: string, linemonType: string) => {
	if (attackType !== "normal" && linemonType !== "normal") {
		return typesEffectiveness[attackType][linemonType] || 1;
	} else {
		return 1;
	}
};

const attack = async (
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

export const getCombatMenu = async (
	returnFunction: (wildLinemon?: WildLinemonProps) => void,
	linemon: LinemonProps,
	adversary: WildLinemonProps
) => {
	const options = createOptions(linemon.moves);
	options.push({ name: "Go back", value: "back" });

	const answer = await createPrompt("Choose your move: ", options);

	if (!(answer.selectedOption === "back")) {
		const selectedMove = linemon.moves[Number(answer.selectedOption)];

		const moveAnswer = await createPrompt(selectedMove.name, moveOptions);

		switch (moveAnswer.selectedOption) {
			case "use":
				const adversarySelectedMove =
					adversary.moves[randomIntFromInterval(0, 3)];

				if (linemon.status.currentPp >= selectedMove.pp) {
					const linemonGoesFirst =
						linemon.status.spd > adversary.status.spd ||
						selectedMove.isFirst;

					const firstToGo = linemonGoesFirst ? linemon : adversary;
					const secondToGo = linemonGoesFirst ? adversary : linemon;

					const firstAttack = linemonGoesFirst
						? selectedMove
						: adversarySelectedMove;
					const secondAttack = linemonGoesFirst
						? adversarySelectedMove
						: selectedMove;

					await attack(firstAttack, firstToGo, secondToGo);
					if (secondToGo.status.currentHp <= 0) {
						await delayMessage(
							`${secondToGo.info.name} was defeated.\n`
						);

						return returnFunction(adversary);
					}
					await attack(secondAttack, secondToGo, firstToGo);
				} else {
					const sleepAnswer = await createPrompt(
						"You don't have enough pp to use this move. Do you want to sleep to recover pp?",
						[
							{ name: "Sleep", value: "sleep" },
							{ name: "Go back", value: "back" },
						]
					);

					switch (sleepAnswer.selectedOption) {
						case "sleep":
							await attack(selectedMove, linemon, adversary);
							await attack(
								adversarySelectedMove,
								adversary,
								linemon
							);
							break;
					}
				}
				returnFunction(adversary);
				break;
			case "description":
				await delayMessage(
					`${selectedMove.name}: ${selectedMove.description}\n`
				);
				getCombatMenu(returnFunction, linemon, adversary);
				break;
			case "status":
				await delayMessage(`Type: ${selectedMove.type}
Power: ${selectedMove.power}
Accuracy: ${selectedMove.accuracy}%
PP Cost: ${selectedMove.pp}\n`);
				getCombatMenu(returnFunction, linemon, adversary);
				break;
		}
	} else {
		console.log(" ");
		returnFunction(adversary);
	}
};
