import jsonLinemons from "../data/linemons.json" assert { type: "json" };

import chalk from "chalk";
import gradient from "gradient-string";
import { createSpinner } from "nanospinner";

import { WildLinemon } from "../classes/WildLinemon.js";

import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { getFromJson } from "./getFromJson.js";
import { randomIntFromInterval } from "./randomIntFromInterval.js";

const tallGrassOptions = [
	{ name: "Keep walking", value: "walk" },
	{ name: "Leave", value: "exit" },
];

const linemonActions = [{ name: "Run", value: "run" }];

export const goToTallGrass = (
	linemonOptions: string[],
	returnToOrigin: () => void
) => {
	const formatType = (type: string) => {
		switch (type) {
			case "fire":
				return chalk.bgRed.bold(" Fire ");
			case "ground":
				return chalk.bgHex("#954535").bold(" Ground ");
			case "grass":
				return chalk.bgGreen.bold(" Grass ");
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

	const findLinemon = async () => {
		const linemonId = randomIntFromInterval(0, linemonOptions.length - 1);
		const randomNumber = randomIntFromInterval(1, 1000);

		let isShiny = false;
		if (randomNumber === 1000) isShiny = true;

		const { id, info, minMaxStatus } = getFromJson(
			jsonLinemons,
			linemonOptions[linemonId]
		);
		const linemon = new WildLinemon(id, { ...info, isShiny }, minMaxStatus);

		console.log("\n");

		const spinner = createSpinner("Searching for Linemon...").start();

		await delayMessage(null);

		spinner.success({ text: `You found a ${linemon.info.name}!\n` });
		await delayMessage(null);

		const type = formatType(linemon.info.type);

		let fightOn = true;
		while (fightOn) {
			console.log(`${linemon.info.name} - Lvl. ${linemon.info.lvl} ${
				linemon.info.isShiny ? gradient.cristal("[Shiny]") : ""
			}
Type: ${type}`);

			const answer = await createPrompt(
				"What do you want to do?",
				linemonActions
			);

			if (answer.selectedOption === "run") {
				fightOn = false;
				await delayMessage("You ran away.\n");
				walk();
			}
		}
	};

	const walk = async () => {
		const answer = await createPrompt(
			"Where do you want to go?",
			tallGrassOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "exit") {
			returnToOrigin();
		} else if (answer.selectedOption === "walk") {
			findLinemon();
		}
	};

	findLinemon();
};
