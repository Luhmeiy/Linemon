import type { LinemonProps } from "@/interfaces/LinemonProps.js";
import type { TeamMethods } from "@/interfaces/PlayerMethods.js";

import { Linemon } from "../Linemon.js";

import { player } from "@/routes/map/index.js";
import { createLinemonsMenu } from "@/utils/createLinemonsMenu.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";
import { switchLinemon } from "@/utils/switchLinemon.js";

export class Team implements TeamMethods {
	private team: LinemonProps[];

	constructor(team) {
		this.team = team
			? team.team.map((linemon) => new Linemon(linemon))
			: [];
	}

	getTeamMenu = async (url: string) => {
		await createLinemonsMenu(
			"team",
			this.team,
			player.pc.addToPC,
			this.switchLinemon,
			this.removeFromTeam,
			url
		);
	};

	getTeam = () => this.team;
	getFirstTeam = () => {
		for (const linemon of this.team) {
			if (linemon.status.currentHp > 0) {
				return linemon;
			}
		}
	};
	getLinemonById = (id: string) => {
		return this.team.find(({ referenceId }) => referenceId === id);
	};

	addToTeam = async (linemon: LinemonProps) => {
		let linemonForPC: LinemonProps;

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

			if (answer === "yes") {
				const options = this.team.map((linemon, i) => {
					return {
						name: linemon.info.name,
						value: `${i}`,
					};
				});

				const linemonAnswer = await createPrompt(
					"Select Linemon to release: ",
					options
				);

				const linemonId = Number(linemonAnswer);

				linemonForPC = this.team[linemonId];
				this.team[linemonId] = linemon;

				await delayMessage(`${linemon.info.name} added to team.\n`);
			} else {
				linemonForPC = linemon;
			}
		}

		if (linemonForPC) await player.pc.addToPC(linemonForPC);
	};

	private switchLinemon = async (
		firstLinemonId: string,
		secondLinemonId: string
	) => {
		this.team = await switchLinemon(
			this.team,
			firstLinemonId,
			secondLinemonId
		);

		return this.team;
	};

	private removeFromTeam = (linemonId: string) => {
		this.team = this.team.filter(
			({ referenceId }) => referenceId !== linemonId
		);

		return this.team;
	};

	cleanEffects = () => {
		this.team.map(({ effects }) => (effects = []));
	};
}
