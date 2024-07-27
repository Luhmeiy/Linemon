import jsonLinemons from "@/data/linemons.json";
import jsonMoves from "@/data/moves.json";

import chalk from "chalk";
import { randomUUID } from "crypto";
import { Request } from "express";
import gradient from "gradient-string";
import { createSpinner } from "nanospinner";

import { LinemonProps } from "@/interfaces/LinemonProps.js";
import { FindingSettings } from "@/interfaces/LocationProps.js";
import { Moves } from "@/types/Moves.js";
import { ReturnUrlParams } from "@/types/ReturnUrlParams.js";

import { player } from "../map/index.js";
import { Linemon } from "@/classes/Linemon.js";
import { attack } from "@/utils/attack.js";
import {
	filterLinemons,
	formatType,
	verifyIfAffected,
} from "@/utils/combatUtils.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { generateStatus } from "@/utils/generateStatus.js";
import { getCombatMenu } from "@/utils/getCombatMenu.js";
import { getFromJson } from "@/utils/getFromJson.js";
import { getRoute } from "@/utils/getRoute.js";
import { randomIntFromInterval } from "@/utils/randomIntFromInterval.js";
import { removeFunctionsFromLinemon } from "@/utils/removeFunctionsFromLinemon.js";

interface BaseEncounterProps {
	linemonOptions?: string[];
	findingSettings?: FindingSettings;
	url?: string;
}

interface EncounterProps extends BaseEncounterProps {
	wildLinemon?: Linemon;
	activePlayerLinemonId?: string;
	catchLinemon?: boolean;
	diskBonus?: number;
	battleWon?: boolean;
	verifyEffect?: boolean;
}

const generateMoves = (linemonType: string) => {
	const generatedNumbers: number[] = [];
	const moves: Moves[] = [];

	let index = 0;
	while (index < 4) {
		let random: string | number = Math.floor(
			Math.random() * jsonMoves.length
		);

		random = Number(random);
		const move = jsonMoves[random];

		if (
			!generatedNumbers.includes(random) &&
			(move.type === linemonType || move.type === "normal")
		) {
			generatedNumbers.push(random);
			moves.push(move);
			index++;
		}
	}

	return moves;
};

const generateLinemon = async (
	linemonOptions: string[],
	level: { min: number; max: number }
) => {
	const linemonId = randomIntFromInterval(0, linemonOptions.length - 1);

	const shinyNumber = randomIntFromInterval(1, 1000);
	let isShiny = shinyNumber === 1000 ? true : false;

	const { id, info, minMaxStatus } = getFromJson(
		jsonLinemons,
		linemonOptions[linemonId]
	);
	info.lvl = randomIntFromInterval(level.min, level.max);
	info.xp = 1;
	info.xpToNextLevel = Math.floor((info.lvl + 1) ** 3 / 2);

	const moves = generateMoves(info.type);
	const status = generateStatus(minMaxStatus);

	return new Linemon({
		id,
		referenceId: randomUUID(),
		info: { ...info, isShiny },
		status,
		moves,
	} as Linemon);
};

const tryCatchingLinemon = async (
	url: string,
	returnUrlParams: ReturnUrlParams,
	wildLinemon: LinemonProps,
	linemon: LinemonProps,
	baseEncounterProps: BaseEncounterProps,
	diskBonus?: number
) => {
	const catchProbability =
		((3 * wildLinemon.status.maxHp - 2 * wildLinemon.status.currentHp) *
			wildLinemon.info.catchRate *
			diskBonus!) /
		(3 * wildLinemon.status.maxHp);

	const randomNumber = randomIntFromInterval(0, 255);

	console.log();

	const spinner = createSpinner("Catching...").start();
	await delayMessage(null);

	if (catchProbability >= randomNumber) {
		spinner.success({
			text: `You caught a ${wildLinemon.info.name}!\n`,
		});

		player.setLinemonsCaught(wildLinemon.id);
		await player.team.addToTeam(wildLinemon);

		return search(baseEncounterProps);
	} else {
		spinner.error({
			text: `${wildLinemon.info.name} broke free!\n`,
		});

		const selectedMove = wildLinemon.moves[randomIntFromInterval(0, 3)];

		await attack(
			(newParams) =>
				getRoute(url, {
					...returnUrlParams,
					...newParams,
				}),
			selectedMove,
			wildLinemon,
			linemon
		);
	}
};

const search = async (encounterProps: BaseEncounterProps) => {
	const options = [{ name: "Leave", value: "exit" }];

	// Add location specific option
	switch (encounterProps.findingSettings.location) {
		case "tallGrass":
			options.unshift({ name: "Keep walking", value: "continue" });
			break;
		case "water":
			options.unshift({ name: "Keep fishing", value: "continue" });
			break;
	}

	const answer = await createPrompt("What do you want to do?", options);

	await delayMessage(null);
	switch (answer) {
		case "exit":
			return await getRoute(encounterProps.url);
		case "continue":
			return await getRoute("encounter", encounterProps);
	}
};

let linemonOptions: string[];

export default async (req: Request<{}, {}, {}, EncounterProps>) => {
	const {
		linemonOptions: holdOptions,
		findingSettings,
		url,
		activePlayerLinemonId,
		catchLinemon,
		diskBonus,
		battleWon,
	} = req.query;
	let { wildLinemon, verifyEffect } = req.query;
	const { findingChance, level, location } = findingSettings;

	const returnUrlParams: ReturnUrlParams = {
		findingSettings,
		url,
		wildLinemon: undefined,
		activePlayerLinemonId: undefined,
	};

	// Save lineOptions to route
	if (holdOptions) linemonOptions = holdOptions;

	const baseEncounterProps = {
		linemonOptions,
		findingSettings,
		url,
	};

	if (battleWon) return search(baseEncounterProps);

	if (wildLinemon) {
		wildLinemon = new Linemon(wildLinemon);
		returnUrlParams.wildLinemon = removeFunctionsFromLinemon(wildLinemon);
	}

	let linemon: LinemonProps;

	// Select first Linemon in the beginning of battle
	if (holdOptions) {
		linemon = player.team.getFirstTeam();
	}

	// Get Linemon by id if id is set
	if (activePlayerLinemonId) {
		linemon = player.team.getLinemonById(activePlayerLinemonId);
	}

	// Prompt player to select a Linemon
	if (!holdOptions && !activePlayerLinemonId) {
		const availableLinemons = filterLinemons();

		if (availableLinemons.length === 0) {
			await delayMessage("All your Linemons fainted.");
			await delayMessage(
				`You took them to a ${chalk.red("healing center")}.`
			);
			return getRoute(`map/heal`, {
				cityId: player.playerLocation.lastVisitedCityId,
				cityName: player.playerLocation.lastVisitedCityName,
				defeatedTeam: true,
			});
		}

		const linemonId = await createPrompt("Choose a Linemon: ", [
			...availableLinemons,
		]);

		linemon = player.team.getLinemonById(linemonId);
	}

	returnUrlParams.activePlayerLinemonId = linemon.referenceId;

	if (catchLinemon) {
		await tryCatchingLinemon(
			url,
			returnUrlParams,
			wildLinemon,
			linemon,
			baseEncounterProps,
			diskBonus
		);

		verifyEffect = true;
	}

	if (verifyEffect) {
		await verifyIfAffected(wildLinemon);
		await verifyIfAffected(linemon);
	}

	// If wild Linemon isn't provided, generate one
	if (!wildLinemon) {
		const randomNumber = randomIntFromInterval(1, 100);
		console.log();

		const searchText =
			location === "tallGrass"
				? "Searching for Linemon..."
				: "Fishing...";

		const spinner = createSpinner(searchText).start();
		await delayMessage(null);

		if (randomNumber <= findingChance) {
			wildLinemon = await generateLinemon(linemonOptions, level);

			spinner.success({
				text: `You found a ${wildLinemon.info.name}!\n`,
			});

			player.setLinemonsSeen(wildLinemon.id);
			returnUrlParams.wildLinemon =
				removeFunctionsFromLinemon(wildLinemon);
		} else {
			spinner.error({
				text: "You found nothing.\n",
			});

			return search(baseEncounterProps);
		}

		await delayMessage(null);
	}

	if (!activePlayerLinemonId) {
		console.log(`You sent out ${linemon.info.name}\n`);
		await delayMessage(null);
	}

	// Format Linemon type and display wild Linemon informations
	const type = formatType(wildLinemon!.info.type);
	console.log(`${wildLinemon.info.name} - Lvl. ${wildLinemon.info.lvl} ${
		wildLinemon.info.isShiny === true ? gradient.cristal("[Shiny]") : ""
	}
HP: (${wildLinemon.status.currentHp}/${wildLinemon.status.maxHp})
Type: ${type}`);

	const linemonActions = [
		{ name: `${linemon.info.name}'s status`, value: "status" },
		{ name: "Fight", value: "fight" },
		{ name: "Catch", value: "catch" },
		{ name: "Swap", value: "swap" },
		{ name: "Inventory", value: "inventory" },
		{ name: "Run", value: "run" },
	];

	const answer = await createPrompt(
		"What do you want to do?",
		linemonActions
	);

	switch (answer) {
		case "status":
			await delayMessage(`HP: (${linemon.status.currentHp}/${linemon.status.maxHp})
PP: (${linemon.status.currentPp}/${linemon.status.maxPp})\n`);
			return getRoute("encounter", returnUrlParams);
		case "fight":
			return getCombatMenu(
				(newParams) =>
					getRoute("encounter", { ...returnUrlParams, ...newParams }),
				wildLinemon,
				linemon
			);
		case "catch":
			return player.inventory.getDisksMenu("encounter", returnUrlParams);
		case "swap":
			const availableLinemons = filterLinemons(linemon);

			if (availableLinemons.length === 0) {
				await delayMessage("No Linemons available.\n");
				return await getRoute("encounter", returnUrlParams);
			}

			const linemonId = await createPrompt("Choose a Linemon to swap: ", [
				...availableLinemons,
				{ name: "Go back", value: "back" },
			]);

			if (linemonId === "back") {
				console.log();
				await getRoute("encounter", returnUrlParams);
			}

			const selectedLinemon = player.team.getLinemonById(linemonId);

			await delayMessage(
				`Swapped ${linemon.info.name} and ${selectedLinemon.info.name}.\n`
			);

			const selectedMove = wildLinemon.moves[randomIntFromInterval(0, 3)];
			await attack(
				(newParams) =>
					getRoute(url, {
						...returnUrlParams,
						...newParams,
					}),
				selectedMove,
				wildLinemon,
				selectedLinemon
			);

			await getRoute("encounter", {
				...returnUrlParams,
				activePlayerLinemonId: selectedLinemon.referenceId,
				verifyEffect: true,
			});
			break;
		case "inventory":
			const response = await player.inventory.getConsumablesMenu(
				"battle",
				() => getRoute("encounter", returnUrlParams)
			);

			// @ts-ignore
			if (response!) {
				const selectedMove =
					wildLinemon.moves[randomIntFromInterval(0, 3)];
				await attack(
					(newParams) =>
						getRoute(url, {
							...returnUrlParams,
							...newParams,
						}),
					selectedMove,
					wildLinemon,
					linemon
				);

				getRoute("encounter", {
					...returnUrlParams,
					verifyEffect: true,
				});
			}
			break;
		default:
			await delayMessage("You ran away.\n");
			search(baseEncounterProps);
	}
};
