import { LinemonProps } from "@/interfaces/LinemonProps.js";

import { attack } from "./attack.js";
import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { randomIntFromInterval } from "./randomIntFromInterval.js";
import { Linemon } from "@/classes/Linemon.js";

const moveOptions = [
	{ name: "Use", value: "use" },
	{ name: "Description", value: "description" },
	{ name: "Status", value: "status" },
	{ name: "Go back", value: "back" },
];

const createOptions = (moves: LinemonProps["moves"]) => {
	return moves.map(({ name }, i) => {
		return {
			name: name,
			value: `${i}`,
		};
	});
};

export const getCombatMenu = async (
	returnFunction: ({}) => void,
	wildLinemon: Linemon,
	linemon: LinemonProps
): Promise<any> => {
	const adversary = new Linemon(wildLinemon);

	const options = [
		...createOptions(linemon.moves),
		{ name: "Go back", value: "back" },
	];

	const answer = await createPrompt("Choose your move: ", options);

	if (answer === "back") {
		console.log();
		return await returnFunction({});
	}

	const getMoveMenu = async () => {
		const selectedMove = linemon.moves[Number(answer)];

		const moveAnswer = await createPrompt(selectedMove.name, moveOptions);

		switch (moveAnswer) {
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

					switch (sleepAnswer) {
						case "sleep":
							await attack(
								returnFunction,
								selectedMove,
								linemon,
								adversary
							);
							await attack(
								returnFunction,
								adversarySelectedMove,
								adversary,
								linemon
							);
							break;
					}

					return await returnFunction({});
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

				await attack(
					returnFunction,
					firstAttack,
					firstToGo,
					secondToGo
				);
				await attack(
					returnFunction,
					secondAttack,
					secondToGo,
					firstToGo
				);

				return await returnFunction({ verifyEffect: true });
			case "description":
				await delayMessage(
					`${selectedMove.name}: ${selectedMove.description}\n`
				);
				break;
			case "status":
				await delayMessage(`Type: ${selectedMove.type}
Power: ${selectedMove.power}
Accuracy: ${selectedMove.accuracy}%
PP Cost: ${selectedMove.pp}\n`);
				break;
			default:
				return await getCombatMenu(
					returnFunction,
					wildLinemon,
					linemon
				);
		}

		return await getMoveMenu();
	};

	await getMoveMenu();
};
