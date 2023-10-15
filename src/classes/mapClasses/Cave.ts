import chalk from "chalk";

import type { PlayerMethods } from "../../interfaces/PlayerMethods.js";

import { addMenuToOptions } from "../../utils/addMenuToOptions.js";
import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";
import { getMenu } from "../../utils/getMenu.js";
import { searchForLinemon } from "../../utils/searchForLinemon.js";

let caveOptions = [
	{ name: `Walk around`, value: "walk" },
	{ name: `Go to ${chalk.green("forest")}`, value: "forest" },
];

const linemonOptions = [
	"firebeast",
	"firepup",
	"fireling",
	"fireball",
	"firesprite",
	"terramite",
	"groundling",
	"terraclysm",
];

export class Cave {
	constructor(private goToForest: () => void, private player: PlayerMethods) {
		caveOptions = addMenuToOptions(caveOptions);
	}

	goToCave = async () => {
		console.log("\nYou are in the cave.");

		const { selectedOption } = await createPrompt(
			"Where do you want to go?",
			caveOptions
		);

		await delayMessage(null);
		switch (selectedOption) {
			case "walk":
				return searchForLinemon(
					linemonOptions,
					80,
					{ min: 15, max: 20 },
					"cave",
					this.player,
					this.goToCave
				);
			case "forest":
				return this.goToForest();
			default:
				return getMenu(this.player, this.goToCave);
		}
	};
}
