import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";

const tallGrassOptions = [
	{ name: "Keep walking", value: "walk" },
	{ name: "Leave", value: "exit" },
];

export const goToTallGrass = (returnToOrigin: () => void) => {
	const walk = async () => {
		await delayMessage("\nYou found a Linemon!");

		const answer = await createPrompt(
			"Where do you want to go?",
			tallGrassOptions
		);

		if (answer.selectedOption === "exit") {
			await delayMessage(null);
			returnToOrigin();
		} else if (answer.selectedOption === "walk") {
			walk();
		}
	};

	walk();
};
