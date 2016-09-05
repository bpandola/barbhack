namespace Barbarian {

    export class Ghost extends Phaser.Sprite {

        static FIXED_TIMESTEP: number = FIXED_TIMESTEP*1.3;

        timeStep: number = 0;

        constructor(game: Barbarian.Game, enemy: Barbarian.Enemies.Enemy) {
            super(game, enemy.x, enemy.y, 'misc', 20);
            var xAnchor = enemy.rotate ? 0 : 1;
            this.anchor.setTo(xAnchor, 1);
        }

        update() {



            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Ghost.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Ghost.FIXED_TIMESTEP; // save remainder

                this.y -= TILE_SIZE;
                this.frame = <number>this.frame + 1;

                if (this.frame > 27)
                    this.destroy();
                
            }


        }

    }



}