import jsonLinemons from "@/data/linemons.json";

import { player } from "@/routes/map/index.js";
import { createPrompt } from "./createPrompt.js";
import { delayMessage } from "./delayMessage.js";
import { getRoute } from "./getRoute.js";

export const getLinepedia = async (url: string) => {
	const linemonsSeen = player.getLinemonsSeen();
	const linemonsCaught = player.getLinemonsCaught();

	if (linemonsSeen.length === 0) {
		await delayMessage("No Linemons seen yet!\n");
		return await getRoute(url);
	}

	const linemons = jsonLinemons.map(({ id, info: { name } }, i) => {
		if (linemonsSeen.indexOf(id) > -1) {
			const isCaught = linemonsCaught.indexOf(id) > -1;

			return {
				name: `${name} ${isCaught ? "[Caught]" : ""}`,
				value: `${i}`,
			};
		} else {
			return {
				name: name.replace(/./g, "-"),
				value: "-",
			};
		}
	});

	const answer = await createPrompt(
		"Linepedia",
		[...linemons, { name: "Go back\n", value: "back" }],
		14
	);

	if (answer === "back") {
		return await getRoute(url);
	} else if (answer !== "-") {
		const linemon = jsonLinemons[answer];

		await delayMessage(
			`${linemon.info.name}: ${linemon.info.description}\n`
		);
	}

	return await getLinepedia(url);
};
