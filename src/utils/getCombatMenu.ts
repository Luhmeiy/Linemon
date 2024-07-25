import { ReturnUrlParams } from "@/types/ReturnUrlParams.js";
import { LinemonProps } from "@/interfaces/LinemonProps.js";

import { attack } from "./attack.js";
import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { getRoute } from "./getRoute.js";
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
	url: string,
	returnUrlParams: ReturnUrlParams,
	linemon: LinemonProps
): Promise<any> => {
	const { wildLinemon } = returnUrlParams;
	const adversary = new Linemon(wildLinemon);

	const options = [
		...createOptions(linemon.moves),
		{ name: "Go back", value: "back" },
	];

	const answer = await createPrompt("Choose your move: ", options);

	if (answer === "back") {
		console.log();
		return await getRoute(url, returnUrlParams);
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
								url,
								returnUrlParams,
								selectedMove,
								linemon,
								adversary
							);
							await attack(
								url,
								returnUrlParams,
								adversarySelectedMove,
								adversary,
								linemon
							);
							break;
					}

					return await getRoute(url, returnUrlParams);
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
					url,
					returnUrlParams,
					firstAttack,
					firstToGo,
					secondToGo
				);
				await attack(
					url,
					returnUrlParams,
					secondAttack,
					secondToGo,
					firstToGo
				);

				return await getRoute(url, {
					...returnUrlParams,
					verifyEffect: true,
				});
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
				return await getCombatMenu(url, returnUrlParams, linemon);
		}

		return await getMoveMenu();
	};

	await getMoveMenu();
};
