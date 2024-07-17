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
	return moves.map((move, i) => {
		return {
			name: move.name,
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
	const adversary = new Linemon(
		wildLinemon.id,
		wildLinemon.info,
		wildLinemon.status,
		wildLinemon.moves
	);

	const options = [
		...createOptions(linemon.moves),
		{ name: "Go back", value: "back" },
	];

	const answer = await createPrompt("Choose your move: ", options);

	if (answer.selectedOption === "back") {
		console.log();
		return await getRoute(url, returnUrlParams);
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

			await attack(firstAttack, firstToGo, secondToGo);

			if (secondToGo.status.currentHp <= 0) {
				await delayMessage(`${secondToGo.info.name} was defeated.\n`);

				if (firstToGo === linemon) {
					const xp = (112 * adversary.info.lvl) / 7;
					linemon.setXp(xp);

					await delayMessage(
						`${linemon.info.name} received ${xp} xp.\n`
					);

					return await getRoute(url, {
						...returnUrlParams,
						battleWon: true,
					});
				}

				return await getRoute(url, returnUrlParams);
			}

			await attack(secondAttack, secondToGo, firstToGo);
			return await getRoute(url, returnUrlParams);
		case "description":
			await delayMessage(
				`${selectedMove.name}: ${selectedMove.description}\n`
			);
			return getCombatMenu(url, returnUrlParams, linemon);
		case "status":
			await delayMessage(`Type: ${selectedMove.type}
Power: ${selectedMove.power}
Accuracy: ${selectedMove.accuracy}%
PP Cost: ${selectedMove.pp}\n`);
			return getCombatMenu(url, returnUrlParams, linemon);
	}
};
