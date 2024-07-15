import { Request } from "express";
import chalk from "chalk";

import { player } from "..";
import { createPrompt } from "@/utils/createPrompt";
import { delayMessage } from "@/utils/delayMessage";
import { getRoute } from "@/utils/getRoute";

const healingOptions = [
	{ name: "Heal", value: "heal" },
	{ name: "PC", value: "pc" },
	{ name: "Go back", value: "healingExit" },
];

export default async (req: Request<{}, {}, {}, { cityName: string }>) => {
	const { cityName } = req.query;

	console.log(`\nYou are in ${cityName}'s ${chalk.red("healing center")}.`);

	const answer = await createPrompt(
		"What do you want to do?",
		healingOptions
	);

	switch (answer.selectedOption) {
		case "heal":
			const team = player.getTeamRaw();

			if (team.length === 0) {
				await delayMessage("No linemons to heal.");
				return await getRoute(`map/heal?cityName=${cityName}`);
			}

			for (const linemon of team) {
				linemon.status.currentHp = linemon.status.maxHp;
				linemon.status.currentPp = linemon.status.maxPp;
			}

			await delayMessage("Your Linemons are healed.");
			return await getRoute(`map/heal?cityName=${cityName}`);
		case "pc":
			return player.getPC(`map/heal?cityName=${cityName}`);
		default:
			await delayMessage("You left.");
			return await getRoute(`map/city/${cityName.toLowerCase()}`);
	}
};
