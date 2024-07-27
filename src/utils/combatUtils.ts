import chalk from "chalk";
import { LinemonProps } from "@/interfaces/LinemonProps.js";
import { player } from "@/routes/map/index.js";

export const formatType = (type: string) => {
	switch (type) {
		case "fire":
			return chalk.bgRed.bold(" Fire ");
		case "ground":
			return chalk.bgHex("#954535").bold(" Ground ");
		case "grass":
			return chalk.bgGreen.black.bold(" Grass ");
		case "water":
			return chalk.bgBlue.bold(" Water ");
		case "air":
			return chalk.bgBlack.bold(" Fire ");
		case "electric":
			return chalk.bgYellow.bold(" Fire ");
		case "normal":
			return chalk.bgGray.bold(" Normal ");
	}
};

export const verifyIfAffected = async (linemon: LinemonProps) => {
	if (linemon && linemon.effects) await linemon.applyEffects();
};

export const filterLinemons = (linemon?: LinemonProps) => {
	const team = player.team.getTeam();

	let filteredLinemons: LinemonProps[];

	if (linemon) {
		filteredLinemons = team.filter(
			(arrayLinemon) =>
				arrayLinemon.referenceId !== linemon.referenceId &&
				arrayLinemon.status.currentHp > 0
		);
	} else {
		filteredLinemons = team.filter(
			({ status: { currentHp } }) => currentHp > 0
		);
	}

	const availableLinemons = [
		...filteredLinemons.map((linemon) => {
			return {
				name: linemon.info.name,
				value: linemon.referenceId,
			};
		}),
	];

	return availableLinemons;
};
