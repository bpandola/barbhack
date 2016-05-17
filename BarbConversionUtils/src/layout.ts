namespace BarbConversionUtils {

    export interface RoomObj {
        flags: number;
        yOff: number;
        xOff: number;
        imageId: number;
        unknown: number;

    }

    export class Layout extends Phaser.State {

        game: BarbConversionUtils.Util;
        room: number = 0;
        roomsJSON: any;

        preload() {
            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
        }

        create() {

            this.roomsJSON = this.cache.getJSON('rooms');

            this.stage.smoothed = false;

            this.drawRoom();

            //this.time.events.loop(Phaser.Timer.SECOND * 2, () => { this.room++; if (this.room > 56) this.room = 0; this.drawRoom(); }, this);

            var key;
            key = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            key.onDown.add(() => { this.nextRoom(0); }, this);
            key = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            key.onDown.add(() => { this.nextRoom(1); }, this);
            key = this.input.keyboard.addKey(Phaser.Keyboard.UP);
            key.onDown.add(() => { this.nextRoom(2); }, this);
            key = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            key.onDown.add(() => { this.nextRoom(3); }, this);
        }

        nextRoom(direction: number) {

            var newRoom: number;

            switch (direction) {
                case 0:
                    newRoom = this.roomsJSON[this.room].mapData.left;
                    break;
                case 1:
                    newRoom = this.roomsJSON[this.room].mapData.right;
                    break;
                case 2:
                    newRoom = this.roomsJSON[this.room].mapData.up;
                    break;
                case 3:
                    newRoom = this.roomsJSON[this.room].mapData.down;
                    break;

            }

            if (newRoom !== -1) {
                this.room = newRoom;
                this.drawRoom();
            }

        }

        drawRoom() {

            this.world.removeAll();

            for (var o of this.roomsJSON[this.room].area) {

                var obj: RoomObj = o;
                var spr: Phaser.Sprite;

                if (obj.flags !== 5) {
                    spr = this.add.sprite(obj.xOff, obj.yOff, 'area', obj.imageId);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);

                    var xScale = obj.flags & 1 ? -1 : 1;
                    var yScale = obj.flags & 2 ? -1 : 1;

                    spr.scale.setTo(xScale, yScale);
                }
                else {
                    var rect: Phaser.BitmapData = this.add.bitmapData(16 * obj.unknown, 16);
                    rect.fill(0, 0, 0, 1);
                    rect.addToWorld(obj.xOff, obj.yOff);
                }

            }



        }






    }
}