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

    class TestEntity extends Entity {

        game: Barbarian.Game;
        fakeSprite: Phaser.Sprite;
        animations: Phaser.AnimationManager;
        animator: AnimationManager;

        constructor(game: Barbarian.Game, key: string, x: number, y: number) {
            super(game, key);
            this.x = x;
            this.y = y;

            
            this.fakeSprite = new Phaser.Sprite(game, -1000, -1000, key);
            this.animator = new AnimationManager(this.fakeSprite, game.cache.getJSON('enemies')[Enemies.EnemyKeys[key]].animations);
            this.animator.play("0");
            
        }

        get currentParts() {
            return this.animator.currentParts;
        }

        tick() {
            this.animator.update();
            this.render();
        }

    }


    class TestHero extends Entity {

        game: Barbarian.Game;
        fakeSprite: Phaser.Sprite;
        animations: Phaser.AnimationManager;
        animator: AnimationManager;

        constructor(game: Barbarian.Game, x: number, y: number) {
            super(game, 'hero');
            this.x = x;
            this.y = y;


            this.fakeSprite = new Phaser.Sprite(game, -1000, -1000, 'hero');
            this.animator = new AnimationManager(this.fakeSprite, game.cache.getJSON('hero'));
            this.animator.play("0");

        }

        get currentParts() {
            return this.animator.currentParts;
        }

        tick() {
            this.animator.update();
            this.render();
        }

    }
    export class Test extends Phaser.State {

        game: Barbarian.Game;
        enemyLeft: TestEntity;
        enemyRight: TestEntity;
        heroLeft: TestHero;
        heroRight: TestHero;

        preload() {
            this.load.atlasJSONArray('hero', 'assets/hero.png', 'assets/hero.json');
            this.load.json('hero', 'assets/heroanims.json');

            // Enemies
            this.load.json('enemies', 'assets/enemyanims.json');

            // Loop to load enemies
            for (var i = 0; i < 38; i++) {
                var key: string = Enemies.EnemyKeys[i].toLowerCase();
                this.load.atlasJSONArray(key.toUpperCase(), 'assets/enemies/' + key + '.png', 'assets/enemies/' + key + '.json');
            }
        }

        create() {

            this.placeEntities(0);

            // Hot Keys
            var key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            key1.onDown.add(() => {
                this.enemyLeft.animator.previousAnim();
                this.enemyRight.animator.previousAnim();
                this.heroLeft.animator.previousAnim();
                this.heroRight.animator.previousAnim();
            });

            var key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            key2.onDown.add(() => {
                this.enemyLeft.animator.nextAnim();
                this.enemyRight.animator.nextAnim();
                this.heroLeft.animator.nextAnim();
                this.heroRight.animator.nextAnim();
            });

            var key3 = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            key3.onDown.add(() => { this.nextEnemy() });

            var key4 = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            key4.onDown.add(() => { this.previousEnemy() });
           
        }

        placeEntities(currentEnemy) {
            this.game.stage.backgroundColor = Phaser.Color.getRandomColor();
            this.world.removeAll();

            this.enemyLeft = new TestEntity(this.game, Enemies.EnemyKeys[currentEnemy], 200, 300);
            this.enemyRight = new TestEntity(this.game, Enemies.EnemyKeys[currentEnemy], 400, 300);
            this.enemyRight.facing = Facing.Left;
            this.world.add(this.enemyLeft);
            this.world.add(this.enemyRight);

            if (!currentEnemy) {
                this.heroLeft = new TestHero(this.game, 200, 300);
                this.heroRight = new TestHero(this.game, 400, 300);
                this.heroRight.facing = Facing.Left;
                this.world.add(this.heroLeft);
                this.world.add(this.heroRight);
            }
        }

        previousEnemy() {
            var currentEnemy = Enemies.EnemyKeys[<string>this.enemyLeft.fakeSprite.key];
            currentEnemy--;
            if (currentEnemy < 0) {
                currentEnemy = 0;
            }
            this.placeEntities(currentEnemy);
        }

        nextEnemy() {
            var currentEnemy = Enemies.EnemyKeys[<string>this.enemyLeft.fakeSprite.key];
            currentEnemy++;
            if (currentEnemy > Enemies.EnemyKeys.VSP) {
                currentEnemy = Enemies.EnemyKeys.VSP;
            }
            this.placeEntities(currentEnemy);

        }

        update() {

         


        }

        render() {
        
        }

    }

   
}