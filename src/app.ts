import { createSpinner } from "nanospinner";
import figlet from "figlet";
import { readFileSync, readdir } from "fs";
import gradient from "gradient-string";
import inquirer from "inquirer";
import { join } from "path";
import { promisify } from "util";

import { Map } from "./classes/Map.js";

import { createPrompt } from "./utils/createPrompt.js";
import { delayMessage } from "./utils/delayMessage.js";

const promisedReaddir = promisify(readdir);

const titleScreenOptions = [
	{ name: "New game", value: "new" },
	{ name: "Load game", value: "load" },
];

async function main() {
	console.clear();

	await generateTitle();

	const { selectedOption } = await createPrompt(
		"Welcome to Linemon!",
		titleScreenOptions
	);

	switch (selectedOption) {
		case "new":
			const inputName = await inquirer.prompt([
				{
					type: "input",
					name: "name",
					message: "What is your name?",
				},
			]);

			const name = inputName.name !== "" ? inputName.name : "Player";

			await delayMessage(`Welcome, ${name}`);

			return new Map(name);
		case "load":
			const dirPath = "./src/save";

			const files = await promisedReaddir(dirPath);

			if (files.length === 0) {
				await delayMessage("No saves found.");
				return main();
			}

			const fileQuestions = [
				{
					type: "list",
					name: "selectedFile",
					message: "Select a file:",
					choices: files,
				},
			];

			const { selectedFile } = await inquirer.prompt(fileQuestions);

			const selectedFilePath = join(dirPath, selectedFile);
			const jsonPlayer = readFileSync(selectedFilePath, "utf-8");
			const data = JSON.parse(jsonPlayer);

			const spinner = createSpinner("Loading...").start();
			await delayMessage(null);
			spinner.success({ text: "Game loaded!\n" });

			await delayMessage(`Welcome, ${data.name}`);

			return new Map(data);
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
