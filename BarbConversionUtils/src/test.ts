namespace Barbarian {

    export interface SpritePart {
        flags: number;
        index: number;
        x: number;
        y: number;
        rx: number;
        ry: number;
    }

    export interface SpriteFrame {
        unknown: number;
        parts: SpritePart[];
    }

    export interface SpriteAnimation {
        id: number;
        frames: SpriteFrame[];
    }

    class AnimationManager extends Phaser.AnimationManager {

        private data: SpriteAnimation[];

        constructor(sprite: Phaser.Sprite, animData: SpriteAnimation[]) {
            super(sprite);
            this.data = animData;
            this._frameData = sprite.animations._frameData;

            for (var anim of this.data) {
                var frames = [];
                for (var i = 0; i < anim.frames.length; i++) {
                    frames[i] = 0;
                }
                this.add(anim.id.toString(), frames, FRAMERATE, true, true);
            }
            this.updateIfVisible = false;
        }

        play(name, frameRate?, loop?, killOnComplete?) {
            return super.play(name.toString(), frameRate, loop, killOnComplete);
        }

        nextAnim() {
            var next = 0;
            if (this.currentAnim) {
                next = this.animNum + 1;
                if (next > this.data.length) {
                    next = this.data.length -1;
                }
            }
            this.play(next.toString());
        }

        previousAnim() {
            var previous = 0;
            if (this.currentAnim) {
                previous = this.animNum - 1;
                if (previous < 0) {
                    previous = 0;
                }
            }
            this.play(previous.toString());
        }

        get currentParts() {
            if (this.currentAnim) {
                return this.data[this.animNum].frames[this.frameIndex].parts; 
            } else {
                return [];
            }
        }
        get frameIndex() {
            if (this.currentAnim) {
                return this.currentAnim._frameIndex;
            }
            return 0;
        }

        get animNum() {
            if (this.currentAnim) {
                return parseInt(this.currentAnim.name, 10);
            } else {
                return 0;
            }
        }
    }

    export enum Entity {
        NLL,
        AXE,
        THR,
        POP,
        DOG,
        HOP,
        REP,
        ARO,
        MET,
        REN,
        VER,
        BAD,
        ROC,
        APE,
        SCY,
        RHI,
        MN1,
        MN2,
        MN3,
        MN4,
        MN5,
        MN6,
        MN7,
        MOR,
        OC1,
        OC2,
        NT1,
        NT2,
        NT3,
        AC1,
        AC2,
        AC3,
        BLK,
        SPK,
        STN,
        DRA,
        ROT,
        VSP,
        HERO
    }

    export class EntityFactory {

        game: Barbarian.Game;

        constructor(game: Barbarian.Game) {
            this.game = game;
        }

        create(id: Entity, x, y): GameEntity {
            var anim_data = [];
            if (id == Entity.HERO) {
                anim_data = this.game.cache.getJSON('heroanims');
            } else {
                anim_data = this.game.cache.getJSON('enemies')[id].animations
            }
            return new GameEntity(this.game, x, y, Entity[id], anim_data);
        }
    }

    export class GameEntity extends Phaser.Sprite {

        game: Barbarian.Game;

        timeStep: number = 0;

        facing: Facing;      // Which way the entity is facing (left or right).
        direction: Direction;   // Which way the entity is moving (up, down, left, right).

        animator: AnimationManager;
        animations: AnimationManager;
        constructor(game: Barbarian.Game, x = 0, y = 0, key: string, anim_data) {
            // Null sprite backing this...
            super(game, x, y, 'NLL');
            // Add all parts as child sprites
            for (var i = 0; i < game.cache.getFrameCount(key); i++) {
                var part = <Phaser.Sprite>this.addChild(game.make.sprite(0, 0, key, i));
                // Set default properties.
                part.anchor.setTo(0.5);
                part.visible = false;
            }
            this.animator = new AnimationManager(this, anim_data);
            this.animations = this.animator;
        }

        get currentParts() {
            return this.animator.currentParts;
        }

        // arguments can be decimals, e.g. 0.5 for a half-tile movement.
        moveRelative(numTilesX: number, numTilesY: number): void {

            var xMovement = this.facing == Facing.Right ? TILE_SIZE : -TILE_SIZE;
            var yMovement = this.direction == Direction.Up ? -TILE_SIZE : TILE_SIZE;

            this.x += xMovement * numTilesX;
            this.y += yMovement * numTilesY;

        }

        update() {
            // Call derived objects' tick function on a fixed timebase.
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % FIXED_TIMESTEP;
                this.animator.update();
                this.tick()
            }
        }

        // should be overridden by subclasses
        tick() {
            
        }

        postUpdate() {
            // This is called automatically by the Phaser Game Loop.
            // Start from scratch every time.
            this.children.forEach((part) => { part.visible = false; });
            // For each currently visible part, reset properties and set visible to true.
            for (var i = 0, parts = this.currentParts; i < parts.length; i++) {
                // Get a reference to the sprite for this part.
                var part = parts[i];
                // There are a couple of anomalous parts in the Barbarian data (e.g. ShootArrow animation).
                if (part.index < 0) {
                    continue;
                }
                var spr = <Phaser.Sprite>this.getChildAt(part.index);
                // Need to reset the scale here or we may get negative sprite width/height,
                // which will throw off the x/y calculations.
                // {@link https://github.com/photonstorm/phaser/issues/1210 Issue}
                spr.scale.setTo(1, 1);
                // Reset coordinates for this part.
                spr.x = this.facing === Facing.Left ? part.rx : part.x;
                spr.y = this.facing === Facing.Left ? part.ry : part.y;
                // Translate Barbarian part x/y data for use with a Phaser middle anchor.
                spr.x += spr.width / 2;
                spr.y += spr.height / 2;
                // Set z relative to when the part was added for proper overlap.
                spr.z = i;
                // Part bit flags specify whether to flip the sprite part horizontally or vertically.
                var xScale = part.flags & 1 ? -1 : 1;
                var yScale = part.flags & 2 ? -1 : 1;
                // Flip the part horizontally again based on which way the *entity* is facing.
                xScale = this.facing === Facing.Left ? -xScale : xScale
                spr.scale.setTo(xScale, yScale);
                // And finally, make sure this sprite part is rendered by Phaser.
                spr.visible = true;
            }
        }

    }

    export class Test extends Phaser.State {

        game: Barbarian.Game;

        entities: GameEntity[];
        entityFactory: EntityFactory;

        currentEntityId: Entity = Entity.HERO;

        preload() {

            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
            this.load.atlasJSONArray('HERO', 'assets/hero.png', 'assets/hero.json');
            this.load.json('heroanims', 'assets/heroanims.json');

            // Enemies
            this.load.json('enemies', 'assets/enemyanims.json');

            // Loop to load enemies
            for (var i = 0; i < 38; i++) {
                var key: string = Enemies.EnemyKeys[i].toLowerCase();
                this.load.atlasJSONArray(key.toUpperCase(), 'assets/enemies/' + key + '.png', 'assets/enemies/' + key + '.json');
            }

            
        }

        create() {
            this.entityFactory = new EntityFactory(this.game);
            this.placeEntities(this.currentEntityId);

            // Hot Keys
            var key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            key1.onDown.add(() => {
                this.entities.forEach((entity) => {
                    entity.animator.previousAnim();
                })
            });

            var key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            key2.onDown.add(() => {
                this.entities.forEach((entity) => {
                    entity.animator.nextAnim();
                })
            });

            var key3 = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            key3.onDown.add(() => { this.nextEntity() });

            var key4 = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            key4.onDown.add(() => { this.previousEntity() });
           
        }

        placeEntities(entityId) {
            this.game.stage.backgroundColor = Phaser.Color.getRandomColor();
            this.world.removeAll();

            // Draw room.
            this.entities = [];

            this.entities.push(this.entityFactory.create(entityId, 240, 300));
            this.entities.push(this.entityFactory.create(entityId, 400, 300));
            this.entities[1].facing = Facing.Left;

            this.entities.forEach((entity) => {
                this.world.add(entity);
                entity.animator.play('0');
            });
        }

        previousEntity() {
            this.currentEntityId--;
            if (this.currentEntityId < 0) {
                this.currentEntityId = 0;
                return;
            }
            this.placeEntities(this.currentEntityId);
        }

        nextEntity() {
            this.currentEntityId++;
            if (this.currentEntityId > Entity.HERO) {
                this.currentEntityId = Entity.HERO;
                return;
            }
            this.placeEntities(this.currentEntityId);
        }

        update() {

            //this.entities[0].x += 1;
            //this.entities[0].y -= 1;


        }


    }

   
}