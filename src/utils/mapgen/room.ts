import { random } from "../dice";
import { shuffle } from "../helpers";
import { Cell, MapBlueprint, ROOM_HEIGHT, ROOM_WIDTH } from "./shared";

export class RoomGenerator {
  map: MapBlueprint = [];
  roomWidth = random(4, 8);
  roomHeight = random(4, 8);

  constructor() {
    this.prepareMap();
    this.createRoom();
  }

  private prepareMap() {
    this.map = [];
    for (let i = 0; i < ROOM_WIDTH; i++) {
      this.map.push([]);
      for (let j = 0; j < ROOM_HEIGHT; j++) {
        this.map[i].push(0);
      }
    }
  }

  private createRoom() {
    const x = Math.floor(ROOM_WIDTH / 2 - this.roomWidth / 2);
    const y = Math.floor(ROOM_HEIGHT / 2 - this.roomHeight / 2);

    const doorPlaces: Cell[] = [];

    for (let i = x; i < x + this.roomWidth; i++) {
      for (let j = y; j < y + this.roomHeight; j++) {
        this.map[i][j] = 1;
        // North
        if (j === y && i > x && i < x + this.roomWidth - 1) {
          doorPlaces.push({
            x: i,
            y: j - 1,
          });
        }
        // South
        if (
          j === y + this.roomHeight - 1 &&
          i > x &&
          i < x + this.roomWidth - 1
        ) {
          doorPlaces.push({
            x: i,
            y: j + 1,
          });
        }
      }
    }

    shuffle(doorPlaces);

    const doors = random(1, 5);
    for (let i = 0; i < doors; i++) {
      const cell = doorPlaces.pop();
      if (cell) {
        this.map[cell.x][cell.y] = 1;
      }
    }
  }
}
