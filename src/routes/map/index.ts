import { Request } from "express";

import { Player } from "@/classes/Player.js";
import { PlayerMethods } from "@/interfaces/PlayerMethods.js";
import { getRoute } from "@/utils/getRoute.js";

interface MapProps {
	name?: string;
	playerData?: string;
}

export let player: PlayerMethods;

export default async (req: Request<{}, {}, {}, MapProps>) => {
	const { name, playerData } = req.query;

	player = name
		? new Player(name)
		: new Player(JSON.parse(playerData) as Player);

	return await getRoute("map/city/city");
};
