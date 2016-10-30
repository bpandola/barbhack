namespace Barbarian {

    export class Ghost extends Phaser.Sprite {

        static FRAMES = [20, 21, 22, 21, 20, 23, 24, 25, 26, 27];

        private deathAnim: Phaser.Animation;

        constructor(entity: Entity) {
            super(entity.game, entity.x, entity.y - TILE_SIZE, 'misc', 20);
            // Set the x anchor based on which way the enemy was facing.
            this.anchor.setTo(entity.facing == Direction.Left ? 0 : 1, 1);
            // Create a Phaser animation that plays at our fixed timestep.
            this.deathAnim = this.animations.add('rise', Ghost.FRAMES, 1000 / FIXED_TIMESTEP, false, true);
            // Decrease the y value on each frame, so the ghost rises into the air.
            this.deathAnim.enableUpdate = true;
            this.deathAnim.onUpdate.add(() => { this.y -= TILE_SIZE; }, this);
            this.deathAnim.killOnComplete = true;
            this.deathAnim.play();
        }
    }
}