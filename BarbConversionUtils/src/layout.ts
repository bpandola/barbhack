namespace Barbarian {

    export interface RoomObj {
        flags: number;
        yOff: number;
        xOff: number;
        imageId: number;
        unknown: number;

    }

    export enum EnemyKeys {
        nll,
        axe,
        thr,
        pop,
        dog,
        hop,
        rep,
        aro,
        met,
        ren,
        ver,
        bad,
        roc,
        ape,
        scy,
        rhi,
        mn1,
        mn2,
        mn3,
        mn4,
        mn5,
        mn6,
        mn7,
        mor,
        oc1,
        oc2,
        nt1,
        nt2,
        nt3,
        ac1,
        ac2,
        ac3,
        blk,
        spk,
        stn,
        dra,
        rot,
        vsp
    }

    export class Layout extends Phaser.State {

        game: Barbarian.Game;
        roomsJSON: any;
        hero: Barbarian.Hero;
        keys: Phaser.CursorKeys;
        changeFrameRate: any;

        tile: string;
       

        preload() {
            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
            this.load.atlasJSONArray('misc', 'assets/miscspr.png', 'assets/miscspr.json');
            this.load.atlasJSONArray('hero', 'assets/hero.png', 'assets/hero.json');
            this.load.json('hero', 'assets/heroanims.json');
            this.load.image('hud', 'assets/hud.png');

            // Enemies
            this.load.json('enemies', 'assets/enemyanims.json');

            // Loop to load enemies
            for (var i = 0; i < 38; i++) {
                var key:string = EnemyKeys[i];
                this.load.atlasJSONArray(key, 'assets/enemies/'+key+'.png', 'assets/enemies/'+key+'.json');
            }
            

        }

        create() {

            this.roomsJSON = this.cache.getJSON('rooms');

            this.stage.smoothed = false;
            //this.game.renderer.renderSession.roundPixels = true;
            //this.game.forceSingleUpdate = true;
            this.drawRoom(Direction.Right);

            
            this.changeFrameRate = this.input.keyboard.addKeys({ 'fast': Phaser.KeyCode.PLUS, 'slow': Phaser.KeyCode.MINUS });
           

            // Test
            var startPos: any = this.roomsJSON[this.game.roomNum].startPos;
            this.hero = new Barbarian.Hero(this.game, startPos.tileX, startPos.tileY);
            this.hero.tileMap = new TileMap(this.hero);
            // draw hud
            var hud = this.make.image(0, 320, 'hud');
            this.stage.addChild(hud);
           
            
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
                this.drawRoom(direction);
                this.world.add(this.hero);
                //this.world.add(this.box);
                //this.hero.x = 8;
            }

            
        }

        drawRoom(direction: Direction) {
            // clear world
            this.world.removeAll();
            // create bitmap to hold room background
            var background = this.add.bitmapData(640, 320);
            // loop through area data to create background
            for (var o of this.roomsJSON[this.game.roomNum].area) {

                var obj: RoomObj = o;
                var spr: Phaser.Sprite;

                if (obj.flags !== 5) {

                    spr = this.make.sprite(obj.xOff, obj.yOff, 'area', obj.imageId);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);

                    var xScale = obj.flags & 1 ? -1 : 1;
                    var yScale = obj.flags & 2 ? -1 : 1;

                    spr.scale.setTo(xScale, yScale);

                    background.draw(spr, spr.x, spr.y);
                }
                else {
                    // black out area of background with height of a single tile and width of tile * obj.unkonwn
                    background.rect(obj.xOff, obj.yOff, TILE_SIZE * obj.unknown, TILE_SIZE, '#000');
                }

            }
            // add background to world
            background.addToWorld(0, 0);

            // add effects to room
            for (var effect of this.roomsJSON[this.game.roomNum].effects) {

                this.createEffect(effect.x, effect.y, effect.name);
            }

            // add enemies to room
            for (var enemy of this.roomsJSON[this.game.roomNum].enemies) {
                if (enemy.id !== 0) {
                    this.drawEnemy(enemy, direction);
                }
            }

            // add static items
            // TODO: add these so they're always on top
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
               
            }

            
        }

        drawEnemy(enemy: any, direction: Direction) {
            var animData = this.game.cache.getJSON('enemies');
            
            var sprGrp: Phaser.Group = this.add.group();
            sprGrp.x = enemy.xOff[direction+1];
            sprGrp.y = enemy.yOff;

            var rotate = enemy.flags[direction + 1];

            for (var part of animData[enemy.id].animations[0].frames[0].parts) {
                
                    var x = rotate ? part.rx : part.x;
                    var y = rotate ? part.ry : part.y;

                    var spr: Phaser.Sprite = sprGrp.create(x, y, EnemyKeys[enemy.id], part.index);

                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = part.flags & 1 ? -1 : 1;
                    var yScale = part.flags & 2 ? -1 : 1;

                    xScale =rotate ? -xScale : xScale
                    //yScale = this.direction == Direction.Right ? yScale : -yScale
                    spr.scale.setTo(xScale, yScale);


            }

           
            
        }

        
        preRender() {
           
        }
       
        handleMovement() {
           

            if (this.hero.x >= this.world.width + TILE_SIZE && this.hero.direction == Direction.Right) {
                this.nextRoom(Direction.Right);
                this.hero.x = 0;
                this.hero.tilePos.x = 0;
            } else if (this.hero.x <= -16 && this.hero.direction == Direction.Left) {
                this.nextRoom(Direction.Left);
                this.hero.x = 640;
                this.hero.tilePos.x = 39;
            } else if (this.hero.y <= 0 && this.hero.direction == Direction.Up) {
                this.nextRoom(Direction.Up);
                this.hero.y = 320;
                this.hero.tilePos.y = 19;
            } else if (this.hero.y >= this.world.height/* && this.hero.direction == Direction.Down*/) {
                this.nextRoom(Direction.Down);
                this.hero.y = TILE_SIZE;
                this.hero.tilePos.y = 1;
            }
           
        }
        update() {
            this.handleMovement();


            if (this.changeFrameRate.fast.isDown) {
                Hero.FIXED_TIMESTEP -= 5;
            }
            else if (this.changeFrameRate.slow.isDown) {
                Hero.FIXED_TIMESTEP += 5;
            }
          
            //var bounds = this.tmpHero.getLocalBounds();
        }

        render() {
            
            this.game.debug.text(this.game.roomNum.toString(), 20, 20);
           
            this.game.debug.text(this.hero.getTile(), 20, 40);
           


            // Draw Gridlines
            for (var i = 0; i < 40; i++)
                for (var j = 0; j < 20; j++)
                    this.game.debug.rectangle(new Phaser.Rectangle(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE), null, false);

            var dumbAdjust = this.hero.direction == Direction.Right ? -TILE_SIZE : 0;
            this.game.debug.rectangle(new Phaser.Rectangle(this.hero.x+dumbAdjust, this.hero.y-TILE_SIZE, TILE_SIZE, TILE_SIZE), "green", true);

            this.game.debug.pixel(this.hero.x, this.hero.y, 'rgba(0,255,255,1)');
        }

    }
}