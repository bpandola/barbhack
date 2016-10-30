namespace Barbarian {

    export class Play extends Phaser.State {

        game: Barbarian.Game;

        background: Phaser.BitmapData;
        enemies: Barbarian.Enemies.Enemy[];
        changeFrameRate: any;

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
                var key:string = Enemies.EnemyKeys[i];
                this.load.atlasJSONArray(key, 'assets/enemies/'+key+'.png', 'assets/enemies/'+key+'.json');
            }
        }

        create() {

            // Get this line out of here and set the value in a menu state or something (like when you click the play button)
            this.game.level = new Level(this.game, this.cache.getJSON('rooms'));
            // A room change will trigger a redraw.
            this.game.level.onRoomChange.add(this.drawRoom, this);



            this.stage.smoothed = false;
            this.game.renderer.renderSession.roundPixels = false;

            

            this.changeFrameRate = this.input.keyboard.addKeys({ 'fast': Phaser.KeyCode.PLUS, 'slow': Phaser.KeyCode.MINUS });
           
            var startPos = this.game.level.getStartPosition();
            this.game.hero = new Barbarian.Hero(this.game, startPos.tileX, startPos.tileY);
            this.game.hero.onDied.add(this.heroDied, this);

            // Use one background and constantly overwrite so no GC.
            this.background = this.add.bitmapData(640, 320);
            this.drawRoom(Direction.Right);
            // draw hud
            var hud = this.make.sprite(0, 320, 'hud');
            this.stage.addChild(hud);


            // Button Test
            hud.inputEnabled = true;
            hud.input.enableDrag();
            hud.input.allowVerticalDrag = false;
            hud.input.enableSnap(160, 80);
            hud.events.onInputDown.add((sprite, pointer) => {
                console.log('here');

                if (pointer.x >= 120 && pointer.x < 160) {
                    this.game.hero.keys.right.isDown = true;
                } else if (pointer.x >= 160 && pointer.x < 240) {
                    this.game.hero.keys.right.isDown = false;
                }
            }, this);

            
           
            
        }

        createEffect(x: number, y: number, name: string): void {

            var effect: Phaser.Sprite = this.add.sprite(x, y, 'misc');

            switch (name) {
                case 'bat':
                    effect.scale.setTo(-1, 1);
                    effect.animations.add(name, [33, 34], 4, true, true);
                    var tween: Phaser.Tween = this.game.add.tween(effect).to({ x: -40 }, 10000, Phaser.Easing.Linear.None, true, 500);
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
                    var tween: Phaser.Tween = this.game.add.tween(effect).to({ y: 320 }, 1200, Phaser.Easing.Exponential.In, true);
                    tween.repeat(-1, 1000);
                    break;
            }
            
            if (name != 'blood_drip') {
                effect.animations.play(name);
            }

        }

        heroDied() {
            // Restart room after a half-second delay.
            this.game.time.events.add(Phaser.Timer.SECOND/2, () => {
                this.game.time.reset();
                this.game.hero.reset(this.game.level.getStartPosition().tileX, this.game.level.getStartPosition().tileY);
                this.drawRoom(Direction.None);
            }, this);
        }

        drawRoom(direction: Direction) {
            // Clear world.
            this.world.removeAll();
            // Render background.
            this.background.clear();
            for (var obj of this.game.level.currentRoom.area) {

                if (obj.flags !== 5) {
                    var spr: Phaser.Sprite;

                    spr = this.make.sprite(obj.xOff, obj.yOff, 'area', obj.imageId);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);

                    var xScale = obj.flags & 1 ? -1 : 1;
                    var yScale = obj.flags & 2 ? -1 : 1;

                    spr.scale.setTo(xScale, yScale);

                    this.background.draw(spr, spr.x, spr.y);
                }
                else {
                    // Black out area of background with height of a single tile and width of tile * obj.unknown.
                    this.background.rect(obj.xOff, obj.yOff, TILE_SIZE * obj.unknown, TILE_SIZE, '#000');
                }

            }
            // Order is important here to maintain correct z-ordering of entities.
            this.background.addToWorld(0, 0);
            // Add any room effects.
            for (var effect of this.game.level.currentRoom.effects) {

                this.createEffect(effect.x, effect.y, effect.name);
            }
            // Add enemies.
            this.enemies = [];
            for (var enemy of this.game.level.currentRoom.enemies) {
                var createdEnemy = Enemies.Enemy.createEnemy(this.game, enemy, direction);
                this.world.add(createdEnemy);
                this.enemies.push(createdEnemy);
            }
            // Add Hegor the Barbarian.
            this.world.add(this.game.hero);
            // Add static items.
            for (var item of this.game.level.getRoomItems()) {
                this.world.add(item);               
            }
        }
       
        handleMovement() {


            if (this.game.hero.x >= this.world.width + TILE_SIZE && this.game.hero.direction == Direction.Right) {
                this.game.level.nextRoom(Direction.Right);
                this.game.hero.x = 0;
                this.game.hero.tilePos.x = 0;
            } else if (this.game.hero.x <= -16 && this.game.hero.direction == Direction.Left) {
                this.game.level.nextRoom(Direction.Left);
                this.game.hero.x = 640;
                this.game.hero.tilePos.x = 39;
            } else if (this.game.hero.y <= 0 && this.game.hero.direction == Direction.Up) {
                this.game.level.nextRoom(Direction.Up);
                this.game.hero.y = 320;
                this.game.hero.tilePos.y = 19;
            } else if (this.game.hero.y >= this.world.height - (TILE_SIZE * 1.5)/* && this.game.hero.direction == Direction.Down*/) {
                this.game.level.nextRoom(Direction.Down);
                this.game.hero.y = TILE_SIZE;
                this.game.hero.tilePos.y = 1;
            }

        }

        
        update() {
            this.handleMovement();

            if (this.changeFrameRate.fast.isDown) {
                console.log('faster');
                Hero.FIXED_TIMESTEP -= 5;
            }
            else if (this.changeFrameRate.slow.isDown) {
                console.log('slower');
                Hero.FIXED_TIMESTEP += 5;
            }

            // Basic sword killing test
            if (this.game.hero.isAttackingWithSword) {
                for (var enemy of this.enemies.filter((e) => { return e.isKillable })) {
                    var enemyBounds = new Phaser.Rectangle().copyFrom(enemy.getBounds())

                    if (enemyBounds.intersects(this.game.hero.getSwordBounds(), 0)) {
                        enemy.kill();
                    }
                }
            }
            // Basic arrow kill test.
            for (var arrow of <Arrow[]>this.world.children.filter((obj) => { return obj instanceof Arrow && obj.alive; })) {
                for (var enemy of this.enemies.filter((e) => { return e.isKillable })) {
                    // Inflate the enemyBounds so it doesn't go over their head without a hit.
                    var enemyBounds = new Phaser.Rectangle().copyFrom(enemy.getBounds()).inflate(TILE_SIZE / 2, TILE_SIZE * 2);
                    var arrowBounds = new Phaser.Rectangle().copyFrom(arrow.getBounds());

                    if (enemyBounds.containsRect(arrowBounds)) {
                        enemy.kill();
                        arrow.kill();
                    }
                }
            }

            
            
        }

        render() {
            //this.game.debug.text(this.game.hero.frame.toString(), 20, 20);

            
            if (this.game.debugOn) {
                this.game.debug.text(this.game.level.currentRoom.id.toString(), 20, 20);

                this.game.debug.text(this.game.hero.tileMap.getTile(), 20, 40);
                // Draw Gridlines
                for (var i = 0; i < 40; i++)
                    for (var j = 0; j < 20; j++)
                        this.game.debug.rectangle(new Phaser.Rectangle(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE), null, false);

                var dumbAdjust = this.game.hero.direction == Direction.Right ? -TILE_SIZE : 0;
                this.game.debug.rectangle(new Phaser.Rectangle(this.game.hero.x + dumbAdjust, this.game.hero.y - TILE_SIZE, TILE_SIZE, TILE_SIZE), "green", true);

                this.game.debug.pixel(this.game.hero.x, this.game.hero.y, 'rgba(0,255,255,1)');


                var bounds: any = this.game.hero.getBodyBounds();
                this.game.debug.rectangle(new Phaser.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));

                // Sword bounding box
                this.game.debug.rectangle(this.game.hero.getSwordBounds(), 'red', false);
                

                for (var enemy of this.enemies) {
                    if (enemy != null) {
                        bounds = enemy.getBounds();
                        this.game.debug.rectangle(new Phaser.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
                    }
                }
            }
        }

    }
}