import type { PlayerProps } from "./PlayerProps.js";

export interface ForestProps {
	goToForest: () => void;
	goToGrasslands: () => void;
	goToLake: () => void;
	player: PlayerProps;
}
