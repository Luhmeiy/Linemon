import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Request } from "express";
import moment from "moment";
import confirm from "@inquirer/confirm";

import { player } from "../map/index.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { getLinepedia } from "@/utils/getLinepedia.js";
import { getRoute } from "@/utils/getRoute.js";

const actionsOptions = [
	{ name: "player", value: "player" },
	{ name: "Team", value: "team" },
	{ name: "Inventory", value: "inventory" },
	{ name: "Linepedia", value: "linepedia" },
	{ name: "Save", value: "save" },
	{ name: "Exit game", value: "exit" },
	{ name: "Go back", value: "back" },
];

export default async (req: Request<{}, {}, {}, { url: string }>) => {
	const { url } = req.query;

	actionsOptions[0].name = player.getName();

	const answer = await createPrompt("Choose an option: ", actionsOptions);

	switch (answer) {
		case "player":
			return player.getStatus(`menu?url=${url}`);
		case "team":
			return player.getTeam(`menu?url=${url}`);
		case "inventory":
			return player.getInventory(`menu?url=${url}`);
		case "linepedia":
			return getLinepedia(`menu?url=${url}`);
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
			const answer = await confirm({
				message:
					"Are you sure you want to exit? All unsaved progress will be lost.",
			});

			if (answer) await getRoute("start/");
			return await getRoute("menu/");
		case "back":
			return await getRoute(url);
	}
};
