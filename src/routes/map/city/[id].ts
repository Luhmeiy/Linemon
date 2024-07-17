import { Request } from "express";

import jsonLocations from "@/data/locations.json";
import { LocationProps } from "@/interfaces/LocationProps";

import { addMenuToOptions } from "@/utils/addMenuToOptions";
import { createPrompt } from "@/utils/createPrompt";
import { delayMessage } from "@/utils/delayMessage";
import { getFromJson } from "@/utils/getFromJson";
import { getRoute } from "@/utils/getRoute";
import { stringToTemplateLiteral } from "@/utils/stringToTemplateLiteral";

export default async (req: Request) => {
	const { id } = req.params;

	const city = getFromJson(jsonLocations, id) as LocationProps;

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
			await getRoute(
				`map/shop?cityName=${city.name}&shopItemsIds=${city.shopItemsIds}&url=map/city/${id}`
			);
		case "healingCenter":
			return await getRoute(`map/heal?cityName=${city.name}`);
		case "menu":
			return getRoute(`menu?url=map/city/${id}`);
		default:
			await getRoute(city.routes[answer]);
	}
};
