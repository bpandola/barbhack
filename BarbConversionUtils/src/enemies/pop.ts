/// <reference path="enemy.ts" />
/// <reference path="../game.ts" />
namespace Barbarian.Enemies {

    export class SmallArrow extends Phaser.Sprite {

        private velocity: number;
        private flightAnim: Phaser.Animation;

        constructor(entity: EntityOld) {
            super(entity.game, entity.x, entity.y - 28, 'POP', 9);
            // Set the arrow movement and initial position based on which way the Hero is facing.
            this.velocity = entity.facing == Facing.Left ? -TILE_SIZE * 2 : TILE_SIZE * 2;
            this.scale.x = entity.facing == Facing.Left ? -1 : 1;
            this.x += this.velocity * 2;
            // Kill the arrow if it goes off the edge of the screen.
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;
            // Create a single frame Phaser animation that loops indefinitely.
            this.flightAnim = this.animations.add('fly', [9], FRAMERATE, true, true);
            // Move the x value on each frame, so the arrow flies through the air.
            this.flightAnim.enableUpdate = true;
            this.flightAnim.onUpdate.add(() => { this.x += this.velocity; }, this);
            this.flightAnim.play();
        }
    }

    export class Pop2 extends Enemy {

        hasAlreadyPopped: boolean = false;

        private nllSprite: Phaser.Sprite;
        private idleAnim: Phaser.Animation;
        private popAnim: Phaser.Animation;

        constructor(game: Barbarian.Game, dataBlob: EnemyJSON, direction: Direction) {
            super(game, dataBlob, direction);

            this.createAnimations();
            this.idleAnim.play(FRAMERATE);
        }

        get currentParts() {
            var animName = this.nllSprite.animations.currentAnim.name;
            var animFrame = this.nllSprite.animations.currentFrame.index;
            var animNum = 0;
            if (animName == 'pop')
                animNum = 1;

            return this.animData[animNum].frames[animFrame].parts;
        }

        createAnimations() {
            // Create Null sprite.
            this.nllSprite = this.create(0, 0, 'POP', 0);
            // Create a single frame (NLL sprite) Phaser animation that loops indefinitely.
            this.idleAnim = this.nllSprite.animations.add('idle', [0], FRAMERATE, true, true);
            // Create a multi-frame (NLL sprite) Phaser animation.
            this.popAnim = this.nllSprite.animations.add('pop', [0, 0, 0, 0, 0, 0, 0, 0], FRAMERATE, false, true);
            // Decrease the y value on each frame, so the ghost rises into the air.
            this.popAnim.enableUpdate = true;
            this.popAnim.onUpdate.add(() => {
                if (this.nllSprite.animations.currentAnim.currentFrame.index == 3) {
                    var arrow = new SmallArrow(this);
                    this.game.world.add(arrow);

                    this.hasAlreadyPopped = true;
                }
            }, this);
            this.popAnim.onComplete.add(() => {
                this.hasAlreadyPopped = true;
                this.nllSprite.play('idle');
            }, this);
        }

        isWithinStrikingDistance(): boolean {
            if (this.game.hero.y + TILE_SIZE == this.y) {
                var delta = this.x - this.game.hero.x;
                // This enemy only faces left, so only pop up if Hero is to the left.
                if (delta >= 0 && delta <= TILE_SIZE * 15)
                    return true;
            }
            return false;
        }
        
        update() {
            if (this.isWithinStrikingDistance() && !this.hasAlreadyPopped) {
                this.nllSprite.play('pop');
            }
            this.render();

           
        }

    }

    export class PopArrow extends Phaser.Sprite {

        private velocity: number = 0;
        private flightAnim: Phaser.Animation;
        private entity: GameEntity;

        constructor(entity: GameEntity) {
            super(entity.game, 0, 0, 'POP', 9);
            this.entity = entity;
            // Kill the arrow if it goes off the edge of the screen.
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;
            // Create a single frame Phaser animation that loops indefinitely.
            this.flightAnim = this.animations.add('fly', [9], FRAMERATE, true, true);
            // Move the x value on each frame, so the arrow flies through the air.
            this.flightAnim.enableUpdate = true;
            this.flightAnim.onUpdate.add(() => { this.x += this.velocity; }, this);
            // Hide until launched.
            this.game.world.add(this);
            this.visible = false;
        }

        launch() {
            this.reset(this.entity.x, this.entity.y - 28);
            this.x += this.velocity * 2;
            // Set the arrow movement and initial position based on which way the entity is facing.
            this.velocity = this.entity.adjustForFacing(TILE_SIZE * 2);
            this.scale.x = this.entity.adjustForFacing(1);
            this.flightAnim.play();
        }
    }

    export class Pop extends GameEntity {

        static IDLE = 0;
        static ATTACK = 1;

        arrow: PopArrow;
        hasAlreadyPopped: boolean = false;

        constructor(game: Barbarian.Game, x = 0, y = 0, key: string, anim_data) {
            super(game, x, y, key, anim_data);

            this.arrow = new PopArrow(this);

            var attack = this.animations.getAnimation(Pop.ATTACK);
            attack.loop = false;
            attack.enableUpdate = true;
            attack.onUpdate.add(() => {
                if (this.animations.frameIndex == 3) {
                    this.arrow.launch();
                    this.hasAlreadyPopped = true;
                }
            });
            attack.onComplete.add(() => {
                this.hasAlreadyPopped = true;
                this.animations.play(Pop.IDLE);
            });
            this.animations.play(Pop.IDLE);
        }

        isWithinStrikingDistance(): boolean {
            if (this.game.hero.y + TILE_SIZE == this.y) {
                let delta = Math.abs(this.x - this.game.hero.x);
                if (delta >= 0 && delta <= TILE_SIZE * 15)
                    return true;
            }
            return false;
        }

        update() {
            if (this.isWithinStrikingDistance() && !this.hasAlreadyPopped) {
                this.animations.play(Pop.ATTACK);
            }
            if (this.arrow.visible) {
                if (this.game.hero.y == 0x90 * SCALE) {
                    if (Math.abs(this.game.hero.x - this.arrow.x) < TILE_SIZE * 1.5) {
                        // Eh, we don't want to use distance... I just looked at the source. 
                        // We probably just want to write a calculateDelta helper method (with an optional abs=true)
                        let distance = Phaser.Point.distance(this.arrow.position, this.game.hero.position);
                        this.arrow.kill();
                        this.game.hero.fsm.transition('Die');
                    }
                }
            }
        }
    }

}