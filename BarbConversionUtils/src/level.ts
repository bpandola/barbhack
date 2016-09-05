namespace Barbarian {

    export class Item {
        id: number;
        x: number;
        y: number;
        visible: boolean;
        roomNum: number;

        constructor(id: number, x: number, y:number, roomNum: number) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.roomNum = roomNum;
            this.visible = true;
        }
    }

    export class Level {

        private items: Item[] = [];

        constructor(rawData: any) {
            for (var room of rawData) {
                for (var item of room.items) {
                    this.items.push(new Item(item.id, item.x, item.y, room.id));
                }
            }

        }

        getRoomItems(room: number) {
            return this.items.filter((item) => {
                return item.roomNum == room && item.visible;
            });
        }
    }


}