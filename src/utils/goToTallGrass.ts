import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";

const tallGrassOptions = [
	{ name: "Keep walking", value: "walk" },
	{ name: "Leave", value: "exit" },
];

export const goToTallGrass = (returnToOrigin: () => void) => {
	const walk = async () => {
		console.log("\nYou found a Linemon!");

		const answer = await createPrompt(
			"Where do you want to go?",
			tallGrassOptions
		);

		await delayMessage(null);
		if (answer.selectedOption === "exit") {
			returnToOrigin();
		} else if (answer.selectedOption === "walk") {
			walk();
		}
	};

	walk();
};
