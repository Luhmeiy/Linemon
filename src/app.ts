import figlet from "figlet";
import gradient from "gradient-string";

import { Map } from "./classes/Map.js";
import { createPrompt } from "./utils/createPrompt.js";

const titleScreenOptions = [{ name: "Start game", value: "ts1" }];

async function main() {
	await generateTitle();

	const answer = await createPrompt(
		"Welcome to Linemon!",
		titleScreenOptions
	);

	if (answer.selectedOption === "ts1") new Map();
}

async function generateTitle() {
	console.log(`==================================================================================
${gradient.cristal.multiline(
	figlet.textSync("Linemon", { font: "Alligator2" })
)}
==================================================================================\n\n`);
}

main();
