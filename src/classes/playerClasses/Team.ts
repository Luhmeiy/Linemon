import type { LinemonProps } from "../../interfaces/LinemonProps.js";
import type { TeamMethods } from "../../interfaces/PlayerMethods.js";

import { Linemon } from "../Linemon.js";

import { createLinemonsMenu } from "../../utils/createLinemonsMenu.js";
import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";

export class Team implements TeamMethods {
	private team: LinemonProps[];

	constructor(
		private addToPC: (linemon: LinemonProps) => void,
		team?: LinemonProps[]
	) {
		if (team) {
			this.team = team.map(({ id, info, status, moves }) => {
				return new Linemon(id, info, status, moves);
			});
		} else {
			this.team = [];
		}
	}

	getTeam = async (returnFunction: () => void) => {
		await createLinemonsMenu(
			"team",
			this.team,
			this.addToPC,
			this.removeFromTeam,
			returnFunction
		);
	};

	getTeamRaw = () => this.team;
	getFirstTeam = () => this.team[0];

	addToTeam = async (linemon: LinemonProps) => {
		let linemonForPC;

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

				const linemonId = Number(linemonAnswer.selectedOption);

				linemonForPC = this.team[linemonId];
				this.switchLinemon(linemon, linemonId);

				await delayMessage(`${linemon.info.name} added to team.\n`);
			} else {
				linemonForPC = linemon;
			}
		}

		return linemonForPC;
	};

	private removeFromTeam = (linemonId: number) =>
		this.team.splice(linemonId, 1);

	private switchLinemon = (linemon: LinemonProps, id: number) => {
		this.team[id] = linemon;
	};
}
