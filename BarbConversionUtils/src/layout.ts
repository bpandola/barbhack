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
        roomsJSON: any;
        hero: BarbConversionUtils.Hero;
        //tmpHero: Phaser.Group = null;
        //box: Phaser.Sprite;
        keys: Phaser.CursorKeys;
        tile: string;

        preload() {
            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
            this.load.atlasJSONArray('misc', 'assets/miscspr.png', 'assets/miscspr.json');
            this.load.atlasJSONArray('hero', 'assets/hero.png', 'assets/hero.json');
            this.load.json('hero', 'assets/heroanims.json');
        }

        create() {

            this.roomsJSON = this.cache.getJSON('rooms');

            this.stage.smoothed = false;
            //this.game.renderer.renderSession.roundPixels = true;
            //this.game.forceSingleUpdate = true;
            this.drawRoom();

            //this.drawHero();

            this.keys = this.input.keyboard.createCursorKeys();
            //var key;
            //key = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            //key.onDown.add(() => { this.nextRoom(0); }, this);
            //key = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            //key.onDown.add(() => { this.nextRoom(1); }, this);
            //key = this.input.keyboard.addKey(Phaser.Keyboard.UP);
            //key.onDown.add(() => { this.nextRoom(2); }, this);
            //key = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            //key.onDown.add(() => { this.nextRoom(3); }, this);

            //var timer = this.game.time.events.add(100, this.moveHero, this);
            //timer.loop = true;

            // Draw our pink box to sim barb
            //var bmd = this.make.bitmapData(60, 40);
            //// draw to the canvas context like normal
            //bmd.ctx.beginPath();
            //bmd.ctx.rect(0, 0, 30, 40);
            //bmd.ctx.fillStyle = '#ff0000';
            //bmd.ctx.fill();
            //this.box = this.add.sprite(100, 288, bmd);
            //this.box.anchor.setTo(0.5, 1);

            // Test
            this.hero = new BarbConversionUtils.Hero(this.game, 3, 17);
            //var tmp = new BarbConversionUtils.Hero(this.game, 12, 17);
            //tmp.direction = Direction.Left;
            
        }

        createEffect(x: number, y: number, name: string): void {

            var effect: Phaser.Sprite = this.add.sprite(x, y, 'misc');

            switch (name) {
                case 'bat':
                    effect.animations.add(name, [33, 34], 4, true, true);
                    var tween: Phaser.Tween = this.game.add.tween(effect).to({ x: this.world.width }, 6000, Phaser.Easing.Linear.None, true, 1000);
                    break;
                case 'torch1':
                    effect.animations.add(name, [9, 7, 8], 6, true, true);
                    break;
                case 'torch2':
                    effect.animations.add(name, [7, 8, 9], 6, true, true);
                    break;
                case 'fire':
                    effect.animations.add(name, [10, 11, 12], 6, true, true);
                    break;
                case 'skull_eyes':
                    effect.animations.add(name, [17, 18, 19, 18], 6, true, true);
                    break;
                case 'demon_eyes':
                    effect.animations.add(name, [13, 14, 15, 14], 6, true, true);
                    break;
                case 'blood_drip':
                    effect.frame = 16;
                    var tween: Phaser.Tween = this.game.add.tween(effect).to({ y: 320 }, 1500, Phaser.Easing.Exponential.In, true);
                    tween.repeat(-1, 1000);
                    break;
            }
            
            if (name != 'blood_drip') {
                effect.animations.play(name);
            }

        }

        nextRoom(direction: Direction) {

            var newRoom: number;

            switch (direction) {
                case Direction.Left:
                    newRoom = this.roomsJSON[this.game.roomNum].map.left;
                    break;
                case Direction.Right:
                    newRoom = this.roomsJSON[this.game.roomNum].map.right;
                    break;
                case Direction.Up:
                    newRoom = this.roomsJSON[this.game.roomNum].map.up;
                    break;
                case Direction.Down:
                    newRoom = this.roomsJSON[this.game.roomNum].map.down;
                    break;

            }

            if (newRoom !== -1) {
                this.game.roomNum = newRoom;
                this.drawRoom();
                this.world.add(this.hero);
                //this.world.add(this.box);
                //this.hero.x = 8;
            }

            
        }

        drawRoom() {

            this.world.removeAll();

            for (var o of this.roomsJSON[this.game.roomNum].area) {

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

            

            for (var effect of this.roomsJSON[this.game.roomNum].effects) {

                this.createEffect(effect.x, effect.y, effect.name);
            }

            for (var item of this.roomsJSON[this.game.roomNum].items) {

                var spr: Phaser.Sprite;
                var imageId;

                if (item.id == 1)
                    imageId = 5;
                else if (item.id == 2)
                    imageId = 4;
                else
                    imageId = 2;

                    spr = this.add.sprite(item.x, item.y, 'misc', imageId);
                    spr.x -= spr.width / 2;
                    spr.y -= spr.height - 2;
                    //spr.anchor.setTo(0.5,1);

                

            }

        }

        drawHero() {

            var anims = this.cache.getJSON('hero');
            var tmpGroup:Phaser.Group = this.add.group();
            
            //this.hero.visible = false;
            var animNum =  43;//43 is standing;
            var numFrames = anims[animNum].frames.length;
            var width = 240;
            var height = 200;
            //for (var part of anims[0].frames[2].parts) {
            //    if (part.flags == 0) {
            //        var spr: Phaser.Sprite = this.hero.create(part.rx, part.ry, 'hero', part.index);
            //        spr.anchor.setTo(0.5, 0);
            //        spr.scale.setTo(-1, 1);
            //    }
            //}
            var bmd = this.add.bitmapData(width * numFrames, height);
            //bmd.fill(255, 255, 255, 255);
            for (var i = 0; i < numFrames; i++) {
                for (var part of anims[animNum].frames[i].parts) {
                    var weapon = part.flags >> 4;
                    if (part.flags <5  || weapon==2) {
                        //var spr: Phaser.Sprite =  this.hero.create(part.x+(i*100), part.y, 'hero', part.index);
                        //var spr: Phaser.Sprite = this.add.sprite(part.x + (i * 100)+50, part.y + 100, 'hero', part.index);
                        var spr: Phaser.Sprite = tmpGroup.create(part.x + (i * width) + (width/2), part.y + height, 'hero', part.index);

                        // The bottom of his shoes don't show unless I substract 2... 1*SCALE
                        spr.x += spr.width / 2-2;
                        spr.y += spr.height / 2-2;
                        spr.anchor.setTo(0.5);
                        var xScale = part.flags & 1 ? -1 : 1;
                        var yScale = part.flags & 2 ? -1 : 1;

                        spr.scale.setTo(xScale, yScale);
                        //bmd.draw(spr, (i * 100) /*+ 50 + (part.x + spr.width / 2)*/, 0 /*+ (part.y + spr.height / 2)*/);
                        bmd.drawGroup(tmpGroup);
                        
                    }
                }
            }
            //bmd.add(this.hero.generateTexture());
            //bmd.update();
           //bmd.addToWorld(0,0);
            //this.world.add(bmd);
            //this.cache.addSpriteSheet('test', '',bmd.canvas, width, height,numFrames);
            //tmpGroup.destroy(true);
            //this.hero = this.add.sprite(200, 288, 'test');
            //this.hero.anchor.setTo(0.5, 1);
            //var anim:Phaser.Animation =  this.hero.animations.add('walk', [0, 1, 2, 3, 4,5], 6, true);
            //anim.enableUpdate = true;
            //anim.onUpdate.add(this.moveHero, this);
            //this.hero.play('walk');

            


            

            

        }
        preRender() {
            //this.hero.visible = false;
        }
        getTile(x, y) {

            if (x < 0 || x >= 40 || y < 0 || y >= 20)
                return '?';
            var tile = this.roomsJSON[this.game.roomNum].layout[y].rowData;
            tile = tile.substring(x, x + 1);
            return tile;
        }
        handleMovement() {
            //if (this.keys.right.isDown) {
            //    this.box.x += 4;
            //}

            //var tileX = (this.box.x >> 4);
            //var tileY = (this.box.y >> 4)-1;

            //var tile = this.getTile(tileX, tileY);
            //if (tile === '!') {
            //    // if previous was A or C and above is C or B, then step up...
            //    var previousX = this.getTile(tileX - 1, tileY);
            //    if (previousX == 'A' || previousX == 'C') {
            //        var upY = this.getTile(tileX, tileY - 1)
            //        if (upY == 'C' || upY == 'B') {
            //            this.box.y -= 16;
            //        }
            //    }
            //}

            //var tile = this.getTile(this.hero.tilePos.x, this.hero.tilePos.y);
            //if (tile === '3' && this.hero.fsm.getCurrentStateName != 'HitWall')
            //    this.hero.fsm.transition('HitWall');
            //this.tile = tile;

            if (this.hero.x >= this.world.width && this.hero.direction == Direction.Right) {
                this.nextRoom(Direction.Right);
                this.hero.x = 0;
                this.hero.tilePos.x = 0;
            } else if (this.hero.x <= -16 && this.hero.direction == Direction.Left) {
                this.nextRoom(Direction.Left);
                this.hero.x = 640;
                this.hero.tilePos.x = 39;
            } else if (this.hero.y <= 0 && this.hero.direction == Direction.Up) {
                this.nextRoom(Direction.Up);
                this.hero.y = 160;
                this.hero.tilePos.y = 19;
            } else if (this.hero.y >= this.world.height && this.hero.direction == Direction.Down) {
                this.nextRoom(Direction.Down);
                this.hero.y = 0;
                this.hero.tilePos.y = 0;
            }
            //if (this.box.x >= 640) {
            //    this.nextRoom(1);
            //    this.box.x = 8;
            //}
        }
        update() {
            this.handleMovement();
            
            //var frameNum = this.hero.animations.currentFrame.index;
           

            //if (this.tmpHero != null)
            //    this.tmpHero.destroy(true);

            //var tmpGroup: Phaser.Group = this.add.group();
            //tmpGroup.x = this.hero.x;
            //tmpGroup.y = this.hero.y;
            //var anims = this.cache.getJSON('hero');

            //for (var part of anims[43].frames[frameNum].parts) {
            //    var weapon = part.flags >> 4;
            //    if (part.flags < 5 || weapon == 2) {
            //        //var spr: Phaser.Sprite =  this.hero.create(part.x+(i*100), part.y, 'hero', part.index);
            //        //var spr: Phaser.Sprite = this.add.sprite(part.x + (i * 100)+50, part.y + 100, 'hero', part.index);
            //        var spr: Phaser.Sprite = tmpGroup.create(part.x, part.y, 'hero', part.index);

            //         //The bottom of his shoes don't show unless I substract 2... 1*SCALE
            //        spr.x += spr.width / 2;
            //        spr.y += spr.height / 2;
            //        spr.anchor.setTo(0.5);
            //        var xScale = part.flags & 1 ? -1 : 1;
            //        var yScale = part.flags & 2 ? -1 : 1;

            //        spr.scale.setTo(xScale, yScale);


            //    }
            //}

            //this.tmpHero = tmpGroup;
            //var bounds = this.tmpHero.getLocalBounds();
        }
        moveHero() {

           

            //var frameNum = this.hero.animations.currentFrame.index;
            //if (frameNum == 1 || frameNum == 4) {


            //    //this.hero.x += 16;
            //} else {
            //      //  this.hero.x += 16;
            //}

          
            
        }

        render() {
            //this.game.debug.text(this.game.roomNum.toString(), 20, 20);
            ////this.game.debug.spriteCoords(this.hero, 20, 40);
            //this.game.debug.text(this.getTile(this.hero.tilePos.x, this.hero.tilePos.y), 20, 40);
            //this.game.debug.text(this.hero.tilePos.x.toString(),20,60);
            //this.hero.visible = true;
        }



    }
}