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
            // Translate itemType to sprite frame number.
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


    export class Level {

        private items: Item[] = [];
        private game: Barbarian.Game;

        constructor(game: Barbarian.Game, rawData: any) {
            this.game = game;
            for (var room of rawData) {
                for (var item of room.items) {
                    this.items.push(new Item(this.game, item.id, item.x, item.y, room.id));
                }
            }

        }

        getRoomItems(room: number) {
            return this.items.filter((item) => {
                return item.roomNum == room && item.visible;
            });
        }

        pickUpItem(hero: Barbarian.Hero): ItemType {
             
            var closestItem: Item = null;
            var closestDelta: number = 0xFFFF;
            for (var item of this.getRoomItems(this.game.roomNum)) {
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