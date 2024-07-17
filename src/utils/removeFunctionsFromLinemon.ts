import { LinemonProps } from "@/interfaces/LinemonProps";

export const removeFunctionsFromLinemon = (linemon: LinemonProps) => {
	const stringLinemon = JSON.stringify(linemon);
	return JSON.parse(stringLinemon);
};
