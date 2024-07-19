import jsonLinemons from "@/data/linemons.json";
import jsonMoves from "@/data/moves.json";

import chalk from "chalk";
import { randomUUID } from "crypto";
import { Request } from "express";
import gradient from "gradient-string";
import { createSpinner } from "nanospinner";

import { LinemonProps } from "@/interfaces/LinemonProps";
import { FindingSettings } from "@/interfaces/LocationProps";
import { Moves } from "@/types/Moves";

import { player } from "../map";
import { Linemon } from "@/classes/Linemon";
import { attack } from "@/utils/attack";
import { createPrompt } from "@/utils/createPrompt";
import { delayMessage } from "@/utils/delayMessage";
import { generateStatus } from "@/utils/generateStatus";
import { getCombatMenu } from "@/utils/getCombatMenu";
import { getFromJson } from "@/utils/getFromJson";
import { getRoute } from "@/utils/getRoute";
import { randomIntFromInterval } from "@/utils/randomIntFromInterval";
import { removeFunctionsFromLinemon } from "@/utils/removeFunctionsFromLinemon";

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
}

const formatType = (type: string) => {
	switch (type) {
		case "fire":
			return chalk.bgRed.bold(" Fire ");
		case "ground":
			return chalk.bgHex("#954535").bold(" Ground ");
		case "grass":
			return chalk.bgGreen.black.bold(" Grass ");
		case "water":
			return chalk.bgBlue.bold(" Water ");
		case "air":
			return chalk.bgBlack.bold(" Fire ");
		case "electric":
			return chalk.bgYellow.bold(" Fire ");
		case "normal":
			return chalk.bgGray.bold(" Normal ");
	}
};

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
		await player.addToTeam(wildLinemon);

		return search(baseEncounterProps);
	} else {
		spinner.error({
			text: `${wildLinemon.info.name} broke free!\n`,
		});

		const selectedMove = wildLinemon.moves[randomIntFromInterval(0, 3)];

		await attack(selectedMove, wildLinemon, linemon);
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
	let { wildLinemon } = req.query;
	const { findingChance, level, location } = findingSettings;

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
	}

	let linemon = activePlayerLinemonId
		? player.getLinemonById(activePlayerLinemonId)
		: player.getFirstTeam();

	if (catchLinemon) {
		tryCatchingLinemon(wildLinemon, linemon, baseEncounterProps, diskBonus);
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

			console.log();
			spinner.success({
				text: `You found a ${wildLinemon.info.name}!\n`,
			});
			await delayMessage(null);

			player.setLinemonsSeen(wildLinemon.id);
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

	const returnUrlParams = {
		findingSettings,
		url,
		wildLinemon: removeFunctionsFromLinemon(wildLinemon),
		activePlayerLinemonId: linemon.referenceId,
	};

	switch (answer) {
		case "status":
			await delayMessage(`HP: (${linemon.status.currentHp}/${linemon.status.maxHp})
PP: (${linemon.status.currentPp}/${linemon.status.maxPp})\n`);
			return getRoute("encounter", returnUrlParams);
		case "fight":
			return getCombatMenu("encounter", returnUrlParams, linemon);
		case "catch":
			return player.getDisks("encounter", returnUrlParams);
		case "swap":
			const team = player.getTeamRaw();

			const filteredLinemons = team.filter(
				(arrayLinemon) =>
					arrayLinemon.referenceId !== linemon.referenceId &&
					arrayLinemon.status.currentHp > 0
			);

			const availableLinemons = [
				...filteredLinemons.map((linemon) => {
					return {
						name: linemon.info.name,
						value: linemon.referenceId,
					};
				}),
			];

			const linemonId = await createPrompt("Choose a Linemon to swap: ", [
				...availableLinemons,
				{ name: "Go back", value: "back" },
			]);

			if (linemonId === "back") {
				console.log();
				await getRoute("encounter", returnUrlParams);
			}

			linemon = player.getLinemonById(linemonId);

			const selectedMove = wildLinemon.moves[randomIntFromInterval(0, 3)];
			await attack(selectedMove, wildLinemon, linemon);

			await getRoute("encounter", {
				...returnUrlParams,
				activePlayerLinemonId: linemon.referenceId,
			});
			break;
		case "inventory":
			const response = await player.getConsumables(
				"encounter",
				player.getTeamRaw(),
				"battle",
				returnUrlParams
			);

			// @ts-ignore
			if (response!) {
				const selectedMove =
					wildLinemon.moves[randomIntFromInterval(0, 3)];
				await attack(selectedMove, wildLinemon, linemon);

				getRoute("encounter", { wildLinemon, linemon });
			}
			break;
		default:
			await delayMessage("You ran away.\n");
			search(baseEncounterProps);
	}
};
