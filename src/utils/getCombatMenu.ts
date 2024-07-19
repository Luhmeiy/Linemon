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

const verifyIfDefeated = async (
	url: string,
	returnUrlParams: ReturnUrlParams,
	linemon: LinemonProps,
	adversary: LinemonProps
) => {
	let defeatedLinemon: LinemonProps;

	if (linemon.status.currentHp <= 0 || adversary.status.currentHp <= 0) {
		defeatedLinemon = linemon.status.currentHp <= 0 ? linemon : adversary;
	}

	if (defeatedLinemon) {
		await delayMessage(`${defeatedLinemon.info.name} was defeated.\n`);

		if (defeatedLinemon !== linemon) {
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
			await verifyIfDefeated(url, returnUrlParams, linemon, adversary);

			await attack(secondAttack, secondToGo, firstToGo);
			await verifyIfDefeated(url, returnUrlParams, linemon, adversary);

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
