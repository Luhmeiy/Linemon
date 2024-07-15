import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Request } from "express";
import moment from "moment";

import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { getRoute } from "@/utils/getRoute.js";
import { player } from "../map/index.js";

const actionsOptions = [
	{ name: "player", value: "player" },
	{ name: "Team", value: "team" },
	{ name: "Inventory", value: "inventory" },
	{ name: "Save", value: "save" },
	{ name: "Exit game", value: "exit" },
	{ name: "Go back", value: "back" },
];

interface Url {
	url: string;
}

export default async (req: Request<{}, {}, {}, Url>) => {
	const { url } = req.query;

	actionsOptions[0].name = player.getName();

	const answer = await createPrompt("Choose an option: ", actionsOptions);

	switch (answer.selectedOption) {
		case "player":
			return player.getStatus(`menu?url=${url}`);
		case "team":
			return player.getTeam(`menu?url=${url}`);
		case "inventory":
			return player.getInventory(`menu?url=${url}`);
		case "save":
			if (!existsSync("./src/save")) mkdirSync("./src/save");

			const date = moment();
			const currentData = date.format("YYYYMMDD-HHmmss");

			writeFileSync(
				`./src/save/${currentData}.json`,
				JSON.stringify(player)
			);

			await delayMessage("Game saved!\n");
			return await getRoute(`menu?url=${url}`);
		case "exit":
			const response = await createPrompt(
				"Are you sure you want to exit? All unsaved progress will be lost.",
				[
					{ name: "Yes", value: "yes" },
					{ name: "No", value: "no" },
				]
			);

			if (response.selectedOption === "yes") {
				await getRoute("start/");
			}

			return await getRoute("menu/");
		case "back":
			return await getRoute(url);
	}
};
