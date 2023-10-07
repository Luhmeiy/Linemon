import jsonLinemons from "../data/linemons.json" assert { type: "json" };

import chalk from "chalk";
import gradient from "gradient-string";
import { createSpinner } from "nanospinner";

import type { PlayerMethods } from "../interfaces/PlayerMethods.js";
import type { WildLinemonProps } from "../interfaces/WildLinemonProps.js";

import { Linemon } from "../classes/Linemon.js";
import { WildLinemon } from "../classes/WildLinemon.js";

import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { getFromJson } from "./getFromJson.js";
import { randomIntFromInterval } from "./randomIntFromInterval.js";

const linemonActions = [
	{ name: "Catch", value: "catch" },
	{ name: "Run", value: "run" },
];

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

	const findLinemon = async (
		linemon?: WildLinemonProps,
		catchLinemon?: boolean,
		diskBonus?: number
	) => {
		if (!linemon) {
			const randomNumber = randomIntFromInterval(1, 100);

			const linemonId = randomIntFromInterval(
				0,
				linemonOptions.length - 1
			);
			const shinyNumber = randomIntFromInterval(1, 1000);

			let isShiny = false;
			if (shinyNumber === 1000) isShiny = true;

			const { id, info, minMaxStatus } = getFromJson(
				jsonLinemons,
				linemonOptions[linemonId]
			);
			info.lvl = randomIntFromInterval(level.min, level.max);

			linemon = new WildLinemon(id, { ...info, isShiny }, minMaxStatus);

			console.log("\n");

			const spinner = createSpinner(searchText).start();

			await delayMessage(null);

			if (randomNumber <= findingChance) {
				spinner.success({
					text: `You found a ${linemon.info.name}!\n`,
				});

				player.setLinemonsSeen(linemon.id);
			} else {
				spinner.error({
					text: "You found nothing.\n",
				});

				return search();
			}

			await delayMessage(null);
		}

		const type = formatType(linemon!.info.type);

		if (catchLinemon) {
			console.log("\n");

			const spinner = createSpinner("Catching...").start();

			const catchProbability =
				((3 * linemon.status.maxHp - 2 * linemon.status.currentHp) *
					linemon.info.catchRate *
					diskBonus!) /
				(3 * linemon.status.maxHp);

			const randomNumber = randomIntFromInterval(0, 255);

			await delayMessage(null);

			if (catchProbability >= randomNumber) {
				spinner.success({
					text: `You caught a ${linemon.info.name}!\n`,
				});

				player.setLinemonsCaught(linemon.id);

				const caughtLinemon = new Linemon(
					linemon.id,
					linemon.info,
					linemon.status
				);

				await player.addToTeam(caughtLinemon);
				search();
			} else {
				spinner.error({
					text: `${linemon.info.name} broke free!\n`,
				});

				findLinemon(linemon, false);
			}
		} else {
			let fightOn = true;
			while (fightOn) {
				console.log(`${linemon!.info.name} - Lvl. ${
					linemon!.info.lvl
				} ${linemon!.info.isShiny ? gradient.cristal("[Shiny]") : ""}
Type: ${type}`);

				const answer = await createPrompt(
					"What do you want to do?",
					linemonActions
				);

				if (!(answer.selectedOption === "run")) {
					await delayMessage(null);
					if (answer.selectedOption === "catch") {
						fightOn = false;
						player.getDisks(findLinemon, linemon!);
					}
				} else {
					fightOn = false;
					await delayMessage("You ran away.\n");
					search();
				}
			}
		}
	};

	const search = async () => {
		const answer = await createPrompt("What do you want to do?", options);

		await delayMessage(null);
		if (answer.selectedOption === "exit") {
			returnToOrigin();
		} else if (answer.selectedOption === "continue") {
			findLinemon();
		}
	};

	findLinemon();
};
