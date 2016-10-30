namespace Barbarian {

    export class Ghost extends Phaser.Sprite {

        timeStep: number = 0;
        frameNums: number[] = [20, 21, 22, 21, 20, 23, 24, 25, 26, 27];
        frameNum: number;

        constructor(game: Barbarian.Game, enemy: Barbarian.Enemies.Enemy) {
            super(game, enemy.x, enemy.y - TILE_SIZE, 'misc', 20);
            var xAnchor = enemy.facing == Direction.Left ? 0 : 1;
            this.anchor.setTo(xAnchor, 1);
            this.frameNum = 1;
        }

        update() {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % FIXED_TIMESTEP;

                if (this.frameNum > 9) {
                    this.destroy();
                    return;
                }

                this.y -= TILE_SIZE;
                this.frame = this.frameNums[this.frameNum];
                this.frameNum++
            }
        }
    }
}