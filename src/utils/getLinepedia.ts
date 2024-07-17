import jsonLinemons from "@/data/linemons.json";

import { player } from "@/routes/map";
import { createPrompt } from "./createPrompt";
import { delayMessage } from "./delayMessage";
import { getRoute } from "./getRoute";

export const getLinepedia = async (url: string) => {
	const linemonsSeen = player.getLinemonsSeen();
	const linemonsCaught = player.getLinemonsCaught();

	if (linemonsSeen.length === 0) {
		await delayMessage("No Linemons seen yet!\n");
		return await getRoute(url);
	}

	const linemons = jsonLinemons.map((linemon, i) => {
		if (linemonsSeen.indexOf(linemon.id) > -1) {
			const isCaught = linemonsCaught.indexOf(linemon.id) > -1;

			return {
				name: `${linemon.info.name} ${isCaught ? "[Caught]" : ""}`,
				value: `${i}`,
			};
		} else {
			return {
				name: linemon.info.name.replace(/./g, "-"),
				value: `${i}`,
			};
		}
	});

	const answer = await createPrompt("Linepedia", [
		...linemons,
		{ name: "Go back\n", value: "back" },
	]);

	if (answer.selectedOption === "back") {
		return await getRoute(url);
	} else {
		await getLinepedia(url);
	}
};