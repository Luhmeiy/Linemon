import type { PlayerProps } from "./PlayerProps.js";

export interface LakeProps {
	goToLake: () => void;
	goToGrasslands: () => void;
	goToForest: () => void;
	player: PlayerProps;
}
