import jsonLinemons from "../data/linemons.json" assert { type: "json" };
import jsonMoves from "../data/moves.json" assert { type: "json" };

import chalk from "chalk";
import gradient from "gradient-string";
import { createSpinner } from "nanospinner";

import type { LinemonProps } from "../interfaces/LinemonProps.js";
import type { PlayerMethods } from "../interfaces/PlayerMethods.js";
import type { Moves } from "../types/Moves.js";

import { Linemon } from "../classes/Linemon.js";

import { attack } from "./attack.js";
import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { generateStatus } from "./generateStatus.js";
import { getCombatMenu } from "./getCombatMenu.js";
import { getFromJson } from "./getFromJson.js";
import { randomIntFromInterval } from "./randomIntFromInterval.js";

export const searchForLinemon = (
	linemonOptions: string[],
	findingChance: number,
	level: { min: number; max: number },
	location: "tallGrass" | "water",
	player: PlayerMethods,
	returnToOrigin: () => void
) => {
	const options = [{ name: "Leave", value: "exit" }];
	let searchText: string;

	switch (location) {
		case "tallGrass":
			options.unshift({ name: "Keep walking", value: "continue" });
			searchText = "Searching for Linemon...";
			break;
		case "water":
			options.unshift({ name: "Keep fishing", value: "continue" });
			searchText = "Fishing...";
			break;
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

	const findLinemon = async (
		wildLinemon?: LinemonProps,
		catchLinemon?: boolean,
		diskBonus?: number
	): Promise<any> => {
		if (!wildLinemon) {
			const randomNumber = randomIntFromInterval(1, 100);
			const linemonId = randomIntFromInterval(
				0,
				linemonOptions.length - 1
			);

			const shinyNumber = randomIntFromInterval(1, 1000);
			let isShiny = shinyNumber === 1000 ? true : false;

			const { id, info, minMaxStatus } = getFromJson(
				jsonLinemons,
				linemonOptions[linemonId]
			);
			info.lvl = randomIntFromInterval(level.min, level.max);

			const moves = generateMoves(info.type);
			const status = generateStatus(minMaxStatus);

			wildLinemon = new Linemon(id, { ...info, isShiny }, status, moves);

			console.log(" ");

			const spinner = createSpinner(searchText).start();
			await delayMessage(null);

			if (randomNumber <= findingChance) {
				spinner.success({
					text: `You found a ${wildLinemon.info.name}!`,
				});

				await delayMessage(" ");

				console.log(
					`You sent out ${await player.getFirstTeam().info.name}\n`
				);

				player.setLinemonsSeen(wildLinemon.id);
			} else {
				spinner.error({
					text: "You found nothing.\n",
				});

				return search();
			}

			await delayMessage(null);
		}

		const type = formatType(wildLinemon!.info.type);
		const linemon = player.getFirstTeam();

		if (
			wildLinemon.status.currentHp <= 0 ||
			linemon.status.currentHp <= 0
		) {
			return search();
		}

		if (catchLinemon) {
			const catchProbability =
				((3 * wildLinemon.status.maxHp -
					2 * wildLinemon.status.currentHp) *
					wildLinemon.info.catchRate *
					diskBonus!) /
				(3 * wildLinemon.status.maxHp);

			const randomNumber = randomIntFromInterval(0, 255);

			console.log(" ");

			const spinner = createSpinner("Catching...").start();
			await delayMessage(null);

			if (catchProbability >= randomNumber) {
				spinner.success({
					text: `You caught a ${wildLinemon.info.name}!\n`,
				});

				player.setLinemonsCaught(wildLinemon.id);
				await player.addToTeam(wildLinemon);

				return search();
			} else {
				spinner.error({
					text: `${wildLinemon.info.name} broke free!\n`,
				});

				const selectedMove =
					wildLinemon.moves[randomIntFromInterval(0, 3)];

				await attack(selectedMove, wildLinemon, linemon);
			}
		}

		const linemonActions = [
			{ name: `${linemon.info.name}'s status`, value: "status" },
			{ name: "Fight", value: "fight" },
			{ name: "Catch", value: "catch" },
			{ name: "Inventory", value: "inventory" },
			{ name: "Run", value: "run" },
		];

		console.log(`${wildLinemon.info.name} - Lvl. ${wildLinemon.info.lvl} ${
			wildLinemon.info.isShiny ? gradient.cristal("[Shiny]") : ""
		}
HP: (${wildLinemon.status.currentHp}/${wildLinemon.status.maxHp})
Type: ${type}`);

		const answer = await createPrompt(
			"What do you want to do?",
			linemonActions
		);

		switch (answer.selectedOption) {
			case "status":
				await delayMessage(`HP: (${linemon.status.currentHp}/${linemon.status.maxHp})
PP: (${linemon.status.currentPp}/${linemon.status.maxPp})\n`);
				return findLinemon(wildLinemon);
			case "fight":
				return getCombatMenu(findLinemon, linemon, wildLinemon);
			case "catch":
				return player.getDisks(findLinemon, wildLinemon);
			case "inventory":
				const response = await player.getConsumables(
					findLinemon,
					player.getTeamRaw(),
					wildLinemon
				);

				if (response!) {
					const selectedMove =
						wildLinemon.moves[randomIntFromInterval(0, 3)];

					await attack(selectedMove, wildLinemon, linemon);

					findLinemon(wildLinemon);
				}
				break;
			default:
				await delayMessage("You ran away.\n");
				search();
		}
	};

	const search = async (): Promise<any> => {
		const answer = await createPrompt("What do you want to do?", options);

		await delayMessage(null);
		switch (answer.selectedOption) {
			case "exit":
				return returnToOrigin();
			case "continue":
				return findLinemon();
		}
	};

	findLinemon();
};
