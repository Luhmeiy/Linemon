import figlet from "figlet";
import gradient from "gradient-string";

import { Map } from "./classes/Map.js";
import { createPrompt } from "./utils/createPrompt.js";
import inquirer from "inquirer";
import { delayMessage } from "./utils/delayMessage.js";

const titleScreenOptions = [{ name: "Start game", value: "ts1" }];

async function main() {
	await generateTitle();

	const answer = await createPrompt(
		"Welcome to Linemon!",
		titleScreenOptions
	);

	if (answer.selectedOption === "ts1") {
		const name = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "What is your name: ",
			},
		]);

		await delayMessage(`Welcome, ${name.name}`);

		new Map(name.name);
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
