import { createSpinner } from "nanospinner";
import figlet from "figlet";
import { readdirSync, readFileSync, unlinkSync } from "fs";
import gradient from "gradient-string";
import inquirer from "inquirer";
import { join } from "path";

import { Map } from "./classes/Map.js";

import { createPrompt } from "./utils/createPrompt.js";
import { delayMessage } from "./utils/delayMessage.js";

const titleScreenOptions = [
	{ name: "New game", value: "new" },
	{ name: "Load game", value: "load" },
	{ name: "Exit", value: "exit" },
];

const fileOptions = [
	{ name: "Load", value: "load" },
	{ name: "Delete", value: "delete" },
	{ name: "Back", value: "back" },
];

async function getSaveFiles() {
	const dirPath = "./src/save";
	const files = readdirSync(dirPath);

	if (files.length === 0) {
		await delayMessage("No saves found.");
		return main();
	}

	const fileQuestions = [
		{
			type: "list",
			name: "selectedFile",
			message: "Select a file:",
			choices: [...files, { name: "Go back", value: "back" }],
		},
	];

	const { selectedFile } = await inquirer.prompt(fileQuestions);

	if (selectedFile === "back") return main();

	const selectedFilePath = join(dirPath, selectedFile);

	const { selectedOption } = await createPrompt(
		"Select an option:",
		fileOptions
	);

	switch (selectedOption) {
		case "load":
			const jsonPlayer = readFileSync(selectedFilePath, "utf-8");
			const data = JSON.parse(jsonPlayer);

			const spinner = createSpinner("Loading...").start();
			await delayMessage(null);
			spinner.success({ text: "Game loaded!\n" });

			await delayMessage(`Welcome, ${data.name}`);

			return new Map(data);
		case "delete":
			unlinkSync(selectedFilePath);

			createSpinner().success({ text: "Save deleted.\n" });
			await delayMessage(null);

			return getSaveFiles();
		case "back":
			return getSaveFiles();
	}
}

export async function main() {
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
			await getSaveFiles();
			break;
		case "exit":
			process.exit();
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
