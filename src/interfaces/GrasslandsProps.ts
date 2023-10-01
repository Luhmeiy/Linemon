import type { PlayerProps } from "./PlayerProps.js";

export interface GrasslandsProps {
	goToGrasslands: () => void;
	goToCity: () => void;
	goToForest: () => void;
	goToLake: () => void;
	player: PlayerProps;
}
