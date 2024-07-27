import jsonLocations from "@/data/locations.json";

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

	const city = getFromJson(jsonLocations, id) as LocationProps;

	player.setPlayerLocation(city.type, id, city.name);

	console.log(`\nYou are in ${city.name}.`);

	let locationOptions = stringToTemplateLiteral(city.locationOptions);
	locationOptions = addMenuToOptions(locationOptions);

	const answer = await createPrompt(
		"Where do you want to go?",
		locationOptions
	);

	await delayMessage(null);
	switch (answer) {
		case "shop":
			await getRoute("map/shop", {
				cityName: city.name,
				shopItemsIds: city.shopItemsIds,
				url: `map/city/${id}`,
			});
		case "healingCenter":
			return await getRoute(
				`map/heal?cityId=${id}&cityName=${city.name}`
			);
		case "menu":
			return getRoute(`menu?url=map/city/${id}`);
		default:
			await getRoute(city.routes[answer]);
	}
};
