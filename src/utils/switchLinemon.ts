import { LinemonProps } from "@/interfaces/LinemonProps.js";
import { delayMessage } from "./delayMessage.js";

export const switchLinemon = async (
	origin: LinemonProps[],
	firstLinemonId: string,
	secondLinemonId: string
) => {
	const firstIndex = origin.findIndex(
		({ referenceId }) => referenceId === firstLinemonId
	);
	const secondIndex = origin.findIndex(
		({ referenceId }) => referenceId === secondLinemonId
	);

	[origin[firstIndex], origin[secondIndex]] = [
		origin[secondIndex],
		origin[firstIndex],
	];

	await delayMessage(
		`Swapped ${origin[secondIndex].info.name} and ${origin[firstIndex].info.name}.\n`
	);

	return origin;
};
