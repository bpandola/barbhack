namespace Barbarian {

    export enum ItemType {
        None = -1,
        Arrow,
        Bow,
        Shield,
        Sword,
        Orb
    }

    // TODO: These should just be sprites and the level can have an object map that holds the sprite with room number.
    // There's no reason why the object would need to know what room number it's in.
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

        private velocity: number;
        private flightAnim: Phaser.Animation;

        constructor(hero: Barbarian.Hero) {
            super(hero.game, hero.x, hero.y-64, 'hero', 128);
            // Set the arrow movement and initial position based on which way the Hero is facing.
            this.velocity = hero.facing == Facing.Left ? -TILE_SIZE * 2 : TILE_SIZE * 2;
            this.scale.x = hero.facing == Facing.Left ? -1 : 1;
            this.x += this.velocity * 2;
            // Kill the arrow if it goes off the edge of the screen.
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;
            // Create a single frame Phaser animation that loops indefinitely.
            this.flightAnim = this.animations.add('fly', [128], FRAMERATE, true, true);
            // Move the x value on each frame, so the arrow flies through the air.
            this.flightAnim.enableUpdate = true;
            this.flightAnim.onUpdate.add(() => { this.x += this.velocity; }, this);
            this.flightAnim.play();
        }
    }
    
    export class Orb extends Item {

        bitmapData: Phaser.BitmapData;
        timeStep: number = 0;
        orb: Phaser.Sprite;
        colorIndex: number = 0;

        constructor(game: Barbarian.Game, id: number, x: number, y: number, roomNum: number) {
            super(game, id, x, y, roomNum);

            this.orb = game.make.sprite(0, 0, 'misc', 28);
            this.bitmapData = game.make.bitmapData(this.width, this.height);
            //this.bitmapData.draw(this);
            //this.bitmapData.update()
            this.bitmapData.ctx.beginPath();
            this.bitmapData.ctx.rect(0, 0, this.width, this.height);
            this.bitmapData.ctx.fillStyle = '#ff0000';
            this.bitmapData.ctx.fill();
            this.bitmapData.load(this.orb);
            this.bitmapData.update()
            this.setTexture(this.bitmapData.texture);
            
        }

        update() {

            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= (FIXED_TIMESTEP>>1)) {
                this.timeStep = this.timeStep % (FIXED_TIMESTEP>>1);
                this.bitmapData.load(this.orb);
                this.bitmapData.update()
                this.bitmapData.processPixelRGB(this.forEachPixel, this);
                this.colorIndex++;
                if (this.colorIndex > 15) {
                    this.colorIndex = 0;
                }
            }
        }



        forEachPixel(pixel): boolean | Phaser.Color {


            /**
            * This callback will be sent a single object with 6 properties: `{ r: number, g: number, b: number, a: number, color: number, rgba: string }`.
            * Where r, g, b and a are integers between 0 and 255 representing the color component values for red, green, blue and alpha.
            * The `color` property is an Int32 of the full color. Note the endianess of this will change per system.
            * The `rgba` property is a CSS style rgba() string which can be used with context.fillStyle calls, among others.
            * The callback must return either `false`, in which case no change will be made to the pixel, or a new color object.
            * If a new color object is returned the pixel will be set to the r, g, b and a color values given within it.
            */
            if (pixel.color.toString(16) == 'ffaa00aa') {
                return Phaser.Color.fromRGBA(EGA_COLORS[this.colorIndex]);
            } else {
                return false;
            }
            //  The incoming pixel values
            //var r = pixel.r;
            //var g = pixel.g;
            //var b = pixel.b;

            ////  And let's mix them up a bit
            //pixel.r = g;
            //pixel.g = b;
            //pixel.b = r;

            //return pixel;
        }

    }

    export class Orb2 extends Phaser.Sprite {

        bitmapData: Phaser.BitmapData;
        timeStep: number = 0;
        orb: Phaser.Sprite;
        colorIndex: number = 0;

        constructor(game: Barbarian.Game, x: number, y: number) {
            super(game, x, y, 'hero', 138 );

            this.orb = game.make.sprite(0, 0, 'hero', 138);
            this.bitmapData = game.make.bitmapData(this.width, this.height);
            //this.bitmapData.draw(this);
            //this.bitmapData.update()
            //this.bitmapData.ctx.beginPath();
            //this.bitmapData.ctx.rect(0, 0, this.width, this.height);
            //this.bitmapData.ctx.fillStyle = '#ff0000';
            //this.bitmapData.ctx.fill();
            this.bitmapData.load(this.orb);
            this.bitmapData.update()
            this.setTexture(this.bitmapData.texture);

        }

        update() {

            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= (FIXED_TIMESTEP >> 1)) {
                this.timeStep = this.timeStep % (FIXED_TIMESTEP >> 1);
                this.bitmapData.load(this.orb);
                this.bitmapData.update()
                this.bitmapData.processPixelRGB(this.forEachPixel, this);
                this.colorIndex++;
                if (this.colorIndex > 15) {
                    this.colorIndex = 0;
                }
            }
        }



        forEachPixel(pixel): boolean | Phaser.Color {


            /**
            * This callback will be sent a single object with 6 properties: `{ r: number, g: number, b: number, a: number, color: number, rgba: string }`.
            * Where r, g, b and a are integers between 0 and 255 representing the color component values for red, green, blue and alpha.
            * The `color` property is an Int32 of the full color. Note the endianess of this will change per system.
            * The `rgba` property is a CSS style rgba() string which can be used with context.fillStyle calls, among others.
            * The callback must return either `false`, in which case no change will be made to the pixel, or a new color object.
            * If a new color object is returned the pixel will be set to the r, g, b and a color values given within it.
            */
            if (pixel.color.toString(16) == 'ffaa00aa') {
                return Phaser.Color.fromRGBA(EGA_COLORS[this.colorIndex]);
            } else {
                return false;
            }
            //  The incoming pixel values
            //var r = pixel.r;
            //var g = pixel.g;
            //var b = pixel.b;

            ////  And let's mix them up a bit
            //pixel.r = g;
            //pixel.g = b;
            //pixel.b = r;

            //return pixel;
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
            // TEST: Add the orb
            this.items.push(new Orb(this.game, ItemType.Orb, 600, 304, 53));

        }

        addItem(id: number, x: number, y: number) {
            var newItem = new Item(this.game, id, x, y, this.room);
            this.items.push(newItem);
            this.game.world.add(newItem);
        }

        get currentRoom(): RoomData {
            return this.roomData[this.room];
        }

        getStartPosition() {
            var startPos = this.currentRoom.startPos;
            // Loop until until we get a valid starting position.
            // This is needed when the hero falls into a pit and must be spawned back at the top.
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
                default:
                    newRoom = -1;
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