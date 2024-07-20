import type { LinemonProps } from "@/interfaces/LinemonProps.js";
import type { TeamMethods } from "@/interfaces/PlayerMethods.js";

import { Linemon } from "../Linemon.js";

import { createLinemonsMenu } from "@/utils/createLinemonsMenu.js";
import { createPrompt } from "@/utils/createPrompt.js";
import { delayMessage } from "@/utils/delayMessage.js";

export class Team implements TeamMethods {
	private team: LinemonProps[];

	constructor(
		private addToPC: (linemon: LinemonProps) => void,
		team?: LinemonProps[]
	) {
		if (team) {
			this.team = team.map((linemon) => {
				return new Linemon(linemon as Linemon);
			});
		} else {
			this.team = [];
		}
	}

	getTeam = async (url: string) => {
		await createLinemonsMenu(
			"team",
			this.team,
			this.addToPC,
			this.switchLinemon,
			this.removeFromTeam,
			url
		);
	};

	getTeamRaw = () => this.team;
	getFirstTeam = () => {
		for (const linemon of this.team) {
			if (linemon.status.currentHp > 0) {
				return linemon;
			}
		}
	};
	getLinemonById = (id: string) => {
		return this.team.find((linemon) => linemon.referenceId === id);
	};

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

		return linemonForPC;
	};

	private switchLinemon = (
		firstLinemonId: string,
		secondLinemonId: string
	) => {
		const firstIndex = this.team.findIndex(
			(linemon) => linemon.referenceId === firstLinemonId
		);
		const secondIndex = this.team.findIndex(
			(linemon) => linemon.referenceId === secondLinemonId
		);

		[this.team[firstIndex], this.team[secondIndex]] = [
			this.team[secondIndex],
			this.team[firstIndex],
		];

		return this.team;
	};

	private removeFromTeam = (linemonId: string) => {
		this.team = this.team.filter(
			(linemon) => linemon.referenceId !== linemonId
		);

		return this.team;
	};

	cleanEffects = () => {
		this.team.map((linemon) => (linemon.effects = []));
	};
}
