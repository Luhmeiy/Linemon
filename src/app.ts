import figlet from "figlet";
import gradient from "gradient-string";
import inquirer from "inquirer";

import { Map } from "./classes/Map.js";

import { createPrompt } from "./utils/createPrompt.js";
import { delayMessage } from "./utils/delayMessage.js";

const titleScreenOptions = [{ name: "Start game", value: "ts1" }];

async function main() {
	await generateTitle();

	const answer = await createPrompt(
		"Welcome to Linemon!",
		titleScreenOptions
	);

	if (answer.selectedOption === "ts1") {
		const inputName = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "What is your name?",
			},
		]);

		const name = inputName.name !== "" ? inputName.name : "Player";

		await delayMessage(`Welcome, ${name}`);

		new Map(name);
	}
}

async function generateTitle() {
	console.log(`==================================================================================
${gradient.cristal.multiline(
	figlet.textSync("Linemon", { font: "Alligator2" })
)}
==================================================================================\n\n`);
}

main();
