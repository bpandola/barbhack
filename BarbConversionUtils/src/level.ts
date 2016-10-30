namespace Barbarian {

    export enum ItemType {
        None = -1,
        Arrow,
        Bow,
        Shield,
        Sword,
        Orb
    }

    export class Item extends Phaser.Sprite {
        roomNum: number;
        itemType: ItemType;

        constructor(game: Barbarian.Game, id: number, x: number, y: number, roomNum: number) {
            super(game, x, y, 'misc', id);
            this.roomNum = roomNum;
            this.itemType = id;
            // Translate itemType to sprite sheet frame number.
            switch (this.itemType) {
                case ItemType.Arrow:
                    this.frame = 2;
                    break;
                case ItemType.Bow:
                    this.frame = 5;
                    break;
                case ItemType.Shield:
                    this.frame = 4;
                    break;
                case ItemType.Sword:
                    this.frame = 3;
                    break;
                case ItemType.Orb:
                    this.frame = 28;
                    break;
                default:
                    this.frame = 0;
            }
            this.anchor.setTo(0.5, 1);
        }
    }

    export class Arrow extends Phaser.Sprite {
        private timeStep: number;
        private movement: number;

        constructor(hero: Barbarian.Hero) {
            super(hero.game, hero.x, hero.y-64, 'hero', 128);
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;

            this.timeStep = 0;
            this.movement = hero.facing == Direction.Left ? -TILE_SIZE * 2 : TILE_SIZE * 2;
            var scale = hero.facing == Direction.Left ? -1 : 1;
            this.scale.x = scale;
            this.x += this.movement * 2;

            hero.game.world.add(this);
        }

        update() {

            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % FIXED_TIMESTEP; // save remainder
                this.x += this.movement;
            }
        }
    }

    export interface RoomData {
        id: number;
        startPos: { tileX: number, tileY: number };
        map: { left: number, right: number, up: number, down: number };
        items: Array<{ id: number, x: number, y: number }>;
        enemies: Array<{ id: number, yOff: number, xMin: number, xMax: number, xOff: Array<number>, flags: Array<number> }>;
        effects: Array<{ name: string, x: number, y: number }>;
        area: Array<{ imageId: number, flags: number, unknown: number, xOff: number, yOff: number }>;
        layout: Array<{ rowData: string }>;
    }

    export class Level {

        private game: Barbarian.Game;
        private room: number;
        private roomData: RoomData[];
        private items: Item[] = [];

        public onRoomChange: Phaser.Signal = new Phaser.Signal();

        constructor(game: Barbarian.Game, roomData: RoomData[], startingRoom: number = 0) {
            this.game = game;
            this.roomData = roomData;
            this.room = startingRoom;
            for (var room of this.roomData) {
                for (var item of room.items) {
                    this.items.push(new Item(this.game, item.id, item.x, item.y, room.id));
                }
            }

        }

        get currentRoom(): RoomData {
            return this.roomData[this.room];
        }

        getStartPosition() {
            var startPos = this.currentRoom.startPos;
            // Loop until until we get a valid starting position.
            // This is needed when the hero falls into a pit and needs to be spawned back at the top.
            while (startPos.tileX == 0 || startPos.tileY == 0) {
                this.room--;
                startPos = this.currentRoom.startPos;
            }
            return startPos;
        }

        nextRoom(direction: Direction) {
            var newRoom: number;

            switch (direction) {
                case Direction.Left:
                    newRoom = this.currentRoom.map.left;
                    break;
                case Direction.Right:
                    newRoom = this.currentRoom.map.right;
                    break;
                case Direction.Up:
                    newRoom = this.currentRoom.map.up;
                    break;
                case Direction.Down:
                    newRoom = this.currentRoom.map.down;
                    break;
            }

            if (newRoom !== -1) {
                this.room = newRoom;
                this.onRoomChange.dispatch(direction);
            }
        }

        getRoomItems() {
            return this.items.filter((item) => {
                return item.roomNum == this.room && item.visible;
            });
        }

        pickUpItem(hero: Barbarian.Hero): ItemType {
             
            var closestItem: Item = null;
            var closestDelta: number = 0xFFFF;
            for (var item of this.getRoomItems()) {
                if (item.y == hero.y) {
                    var delta = Math.abs(item.x - hero.x);
                    if (delta < closestDelta) {
                        closestDelta = delta;
                        closestItem = item;
                    }
                }
            }
            if (closestItem != null && closestDelta <= 1.5 * TILE_SIZE) {
                closestItem.visible = false;
                return closestItem.itemType;
            } else {
                return ItemType.None;
            }

        }
    }


}