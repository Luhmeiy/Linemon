import { Request } from "express";
import chalk from "chalk";

import { player } from "../index.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { getRoute } from "@/utils/getRoute.js";

const healingOptions = [
	{ name: "Heal", value: "heal" },
	{ name: "PC", value: "pc" },
	{ name: "Go back", value: "healingExit" },
];

interface HealProps {
	cityName: string;
	defeatedTeam?: boolean;
}

export default async (req: Request<{}, {}, {}, HealProps>) => {
	const { cityName, defeatedTeam } = req.query;

	console.log(`\nYou are in ${cityName}'s ${chalk.red("healing center")}.`);

	const answer = defeatedTeam
		? "heal"
		: await createPrompt("What do you want to do?", healingOptions);

	switch (answer) {
		case "heal":
			const team = player.team.getTeamRaw();

			if (team.length === 0) {
				await delayMessage("No linemons to heal.");
				return await getRoute(`map/heal?cityName=${cityName}`);
			}

			for (const linemon of team) {
				linemon.status.currentHp = linemon.status.maxHp;
				linemon.status.currentPp = linemon.status.maxPp;
			}

			if (defeatedTeam) await delayMessage(null);
			await delayMessage("Your Linemons are healed.");
			return await getRoute(`map/heal?cityName=${cityName}`);
		case "pc":
			return player.pc.getPC(`map/heal?cityName=${cityName}`);
		default:
			await delayMessage("You left.");
			return await getRoute(`map/city/${cityName.toLowerCase()}`);
	}
};
