import { RoomGenerator } from "./mapgen/room";
import { MapBlueprint } from "./mapgen/shared";
// import { generateCave } from "./mapgen/cave";

export const generateMap = (type: string): MapBlueprint => {
  switch (type) {
    case "Room":
      return new RoomGenerator().map;
    case "Cave":
      // return generateCave();
      throw `Unknown map type: ${type}`;
    default:
      throw `Unknown map type: ${type}`;
  }
};
