import jsonLocations from "@/data/locations.json";

import chalk from "chalk";
import { Request } from "express";

import { LocationProps } from "@/interfaces/LocationProps.js";

import { player } from "../index.js";
import { addMenuToOptions } from "@/utils/addMenuToOptions.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { getFromJson } from "@/utils/getFromJson.js";
import { getRoute } from "@/utils/getRoute.js";
import { stringToTemplateLiteral } from "@/utils/stringToTemplateLiteral.js";

export default async (req: Request) => {
	const { id } = req.params;

	const route = getFromJson(jsonLocations, id) as LocationProps;

	player.setPlayerLocation(route.type, id);

	let locationOptions = stringToTemplateLiteral(route.locationOptions);
	locationOptions = addMenuToOptions(locationOptions);

	if (
		player.inventory.hasFishingRod() &&
		route.secondaryFindingSettings.location === "water"
	) {
		locationOptions.unshift({
			name: `${chalk.blue("Fish")}`,
			value: "fish",
		});
	}

	console.log(`\nYou are in the ${route.name}.`);

	const answer = await createPrompt(
		"Where do you want to go?",
		locationOptions
	);

	await delayMessage(null);
	switch (answer) {
		case "tallGrass":
			return await getRoute("encounter", {
				linemonOptions: route.linemonOptions,
				findingSettings: route.findingSettings,
				url: `map/route/${id}`,
			});
		case "fish":
			return await getRoute("encounter", {
				linemonOptions: route.secondaryLinemonOptions,
				findingSettings: route.secondaryFindingSettings,
				url: `map/route/${id}`,
			});
		case "menu":
			return await getRoute(`menu?url=map/route/${id}`);
		default:
			return await getRoute(route.routes[answer]);
	}
};
