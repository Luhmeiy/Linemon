import chalk from "chalk";
import { Request } from "express";

import jsonLocations from "@/data/locations.json";
import { LocationProps } from "@/interfaces/LocationProps";

import { player } from "..";
import { addMenuToOptions } from "@/utils/addMenuToOptions";
import { createPrompt } from "@/utils/createPrompt";
import { delayMessage } from "@/utils/delayMessage";
import { getFromJson } from "@/utils/getFromJson";
import { getRoute } from "@/utils/getRoute";
import { searchForLinemon } from "@/utils/searchForLinemon";
import { stringToTemplateLiteral } from "@/utils/stringToTemplateLiteral";

export default async (req: Request) => {
	const { id } = req.params;

	const route = getFromJson(jsonLocations, id) as LocationProps;

	let locationOptions = stringToTemplateLiteral(route.locationOptions);
	locationOptions = addMenuToOptions(locationOptions);

	if (
		player.hasFishingRod() &&
		route.secondaryFindingSettings.location === "water"
	) {
		locationOptions.unshift({
			name: `${chalk.blue("Fish")}`,
			value: "fish",
		});
	}

	console.log(`\nYou are in the ${route.name}.`);

	const { selectedOption } = await createPrompt(
		"Where do you want to go?",
		locationOptions
	);

	await delayMessage(null);
	switch (selectedOption) {
		case "tallGrass":
			return searchForLinemon(
				route.linemonOptions,
				route.findingSettings,
				`map/route/${id}`
			);
		case "fish":
			return searchForLinemon(
				route.secondaryLinemonOptions,
				route.secondaryFindingSettings,
				`map/route/${id}`
			);
		case "menu":
			return await getRoute(`menu?url=map/route/${id}`);
		default:
			return await getRoute(route.routes[selectedOption]);
	}
};
