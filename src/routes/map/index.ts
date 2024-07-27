import jsonNPCs from "@/data/npcs.json";

import { Request } from "express";

import { NPC } from "@/classes/NPC.js";
import { Player } from "@/classes/Player.js";
import { getRoute } from "@/utils/getRoute.js";

interface MapProps {
	name?: string;
	playerData?: string;
}

export let player: Player;
export let npcs: NPC[];

export default async (req: Request<{}, {}, {}, MapProps>) => {
	const { name, playerData } = req.query;

	player = name
		? new Player(name)
		: new Player(JSON.parse(playerData) as Player);

	// @ts-ignore
	npcs = jsonNPCs.map((npc) => new NPC(npc));

	const playerLocation = player.getPlayerLocation();

	return await getRoute(`map/${playerLocation}`);
};
