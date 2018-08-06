/// <reference path="enemies/enemy.ts" />
namespace Barbarian {

    export class Ghost extends Phaser.Sprite {

        static FRAMES = [20, 21, 22, 21, 20, 23, 24, 25, 26, 27];

        private deathAnim: Phaser.Animation;

        constructor(entity: EntityOld) {
            super(entity.game, entity.x, entity.y - TILE_SIZE, 'misc', 20);
            // Set the x anchor based on which way the enemy was facing.
            this.anchor.setTo(entity.facing == Facing.Left ? 0 : 1, 1);
            // Create a Phaser animation that plays at our fixed timestep.
            this.deathAnim = this.animations.add('rise', Ghost.FRAMES, FRAMERATE, false, true);
            // Decrease the y value on each frame, so the ghost rises into the air.
            this.deathAnim.enableUpdate = true;
            this.deathAnim.onUpdate.add(() => { this.y -= TILE_SIZE; }, this);
            // Remove the ghost when the animation completes.
            this.deathAnim.killOnComplete = true;
            this.deathAnim.play();
        }
    }

    export class Spirit extends Enemies.Enemy {
        constructor(entity: EntityOld) {
            var dataBlob: Enemies.EnemyJSON = {
                id: Enemies.EnemyKeys.misc,
                xOff: [entity.x,entity.x,entity.x,entity.x,entity.x],
                yOff: entity.y,
                xMax: 0,
                xMin: 0,
                flags: [0,0,0,0,0]
            }
            super(<Barbarian.Game>entity.game, dataBlob, entity.direction);

        }

        tick() {
            this.y -= TILE_SIZE;
            this.animate();
            this.render();
        }

    }
}