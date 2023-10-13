import type { LinemonProps } from "../interfaces/LinemonProps.js";

import { attack } from "./attack.js";
import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { randomIntFromInterval } from "./randomIntFromInterval.js";

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

export const getCombatMenu = async (
	returnFunction: (wildLinemon?: LinemonProps) => void,
	linemon: LinemonProps,
	adversary: LinemonProps
): Promise<any> => {
	const options = [
		...createOptions(linemon.moves),
		{ name: "Go back", value: "back" },
	];

	const answer = await createPrompt("Choose your move: ", options);

	if (answer.selectedOption === "back") {
		console.log();
		return returnFunction(adversary);
	}

	const selectedMove = linemon.moves[Number(answer.selectedOption)];

	const moveAnswer = await createPrompt(selectedMove.name, moveOptions);

	switch (moveAnswer.selectedOption) {
		case "use":
			const adversarySelectedMove =
				adversary.moves[randomIntFromInterval(0, 3)];

			if (linemon.status.currentPp <= selectedMove.pp) {
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
						await attack(adversarySelectedMove, adversary, linemon);
						break;
				}

				return returnFunction(adversary);
			}

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
				await delayMessage(`${secondToGo.info.name} was defeated.\n`);

				if (firstToGo === linemon) {
					const xp = (112 * adversary.info.lvl) / 7;
					linemon.setXp(xp);

					await delayMessage(
						`${linemon.info.name} received ${xp} xp.\n`
					);
				}

				return returnFunction(adversary);
			}

			await attack(secondAttack, secondToGo, firstToGo);
			return returnFunction(adversary);
		case "description":
			await delayMessage(
				`${selectedMove.name}: ${selectedMove.description}\n`
			);
			return getCombatMenu(returnFunction, linemon, adversary);
		case "status":
			await delayMessage(`Type: ${selectedMove.type}
Power: ${selectedMove.power}
Accuracy: ${selectedMove.accuracy}%
PP Cost: ${selectedMove.pp}\n`);
			return getCombatMenu(returnFunction, linemon, adversary);
	}
};
