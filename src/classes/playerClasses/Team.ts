import type { LinemonProps } from "../../interfaces/LinemonProps.js";
import type { TeamMethods } from "../../interfaces/PlayerMethods.js";
import type { WildLinemonProps } from "../../interfaces/WildLinemonProps.js";

import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";

import { Linemon } from "../Linemon.js";

export class Team implements TeamMethods {
	private team: LinemonProps[];

	constructor() {
		this.team = [];
	}

	getTeam = async (returnFunction: () => void) => {
		if (this.team.length === 0) {
			await delayMessage("No linemons caught yet.\n");
		} else {
			for (const linemon of this.team) {
				console.log(linemon.info.name);
			}

			await delayMessage("\n");
		}

		returnFunction();
	};

	addToTeam = async (wildLinemon: WildLinemonProps) => {
		const linemon = new Linemon(
			wildLinemon.id,
			wildLinemon.info,
			wildLinemon.status
		);

		if (this.team.length < 6) {
			await delayMessage(`${linemon.info.name} added to team.\n`);
			this.team.push(linemon);
		} else {
			const answer = await createPrompt(
				`Want to add ${linemon.info.name} to team?`,
				[
					{ name: "Yes", value: "yes" },
					{ name: "No", value: "no" },
				]
			);

			if (answer.selectedOption === "yes") {
				const options = this.team.map((linemon, i) => {
					return {
						name: linemon.info.name,
						value: `${i}`,
					};
				});

				const linemonAnswer: { selectedOption: string } =
					await createPrompt("Select Linemon to release: ", options);

				this.switchLinemon(
					linemon,
					Number(linemonAnswer.selectedOption)
				);
				await delayMessage(`${linemon.info.name} added to team.\n`);
			} else {
				await delayMessage(`${linemon.info.name} released.`);
			}
		}

		return true;
	};

	removeFromTeam = (linemon: LinemonProps) => {
		const index = this.team.findIndex((i) => i.id === linemon.id);
		if (index !== -1) this.team.splice(index, 1);
	};

	switchLinemon = (linemon: LinemonProps, id: number) => {
		this.team[id] = linemon;
	};
}
