import type { LinemonProps } from "../../interfaces/LinemonProps.js";
import type { PCMethods } from "../../interfaces/PlayerMethods.js";
import type { Option } from "../../types/Option.js";

import { createPrompt } from "../../utils/createPrompt.js";
import { delayMessage } from "../../utils/delayMessage.js";

const linemonOptions = [
	{ name: "Status", value: "status" },
	{ name: "Description", value: "description" },
	{ name: "Add to team", value: "team" },
	{ name: "Release", value: "release" },
	{ name: "Go back", value: "back" },
];

const defaultOption = { name: "Go back", value: "back" };

export class PC implements PCMethods {
	private pc: LinemonProps[];

	constructor(
		private addToTeam: (
			linemon: LinemonProps
		) => Promise<LinemonProps | undefined>
	) {
		this.pc = [];
	}

	getPC = async (returnFunction: () => void) => {
		const linemonsInPc: Option = [...this.createOptions(), defaultOption];

		if (this.pc.length == 0) {
			await delayMessage("No Linemons in PC.");
			returnFunction();
		} else {
			await this.createLinemonsMenus(linemonsInPc, returnFunction);
		}
	};

	addToPC = async (linemon: LinemonProps) => {
		await delayMessage(`${linemon.info.name} sent to PC.\n`);
		this.pc.push(linemon);
	};

	private createOptions = () => {
		return this.pc.map((linemon, i) => {
			return {
				name: linemon.info.name,
				value: `${i}`,
			};
		});
	};

	private createLinemonsMenus = async (
		options: Option,
		returnFunction: () => void
	) => {
		const answer = await createPrompt("Choose a Linemon: ", options);

		if (answer.selectedOption !== "back") {
			const linemonId = Number(answer.selectedOption);
			const linemon = this.pc[linemonId];

			const linemonAnswer = await createPrompt(
				linemon.info.name,
				linemonOptions
			);

			switch (linemonAnswer.selectedOption) {
				case "status":
					await delayMessage(`HP: (${linemon.status.currentHp}/${linemon.status.maxHp})
ATK: ${linemon.status.atk}
DEF: ${linemon.status.def}
SPD: ${linemon.status.spd}\n`);
					break;
				case "description":
					await delayMessage(
						`${linemon.info.name}: ${linemon.info.description}\n`
					);
					break;
				case "team":
					this.removeFromPC(linemonId);
					await this.addToTeam(linemon);
					break;
				case "release":
					await delayMessage(`${linemon.info.name} was released.\n`);
					this.removeFromPC(linemonId);
					break;
			}

			this.getPC(returnFunction);
		} else {
			returnFunction();
		}
	};

	private removeFromPC = (linemonId: number) => this.pc.splice(linemonId, 1);
}
