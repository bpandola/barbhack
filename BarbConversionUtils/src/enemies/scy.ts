/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Scythe extends Enemy {

        update() {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Enemy.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Enemy.FIXED_TIMESTEP; // save remainder

                if ((this.animNum == 1 && this.frame === 2) || this.animNum == 2) {
                    this.animNum = 2;
                    this.frame = 0;
                } else if (this.animNum == 0) {
                    if (this.game.hero.x - this.x < 100) {
                        this.animNum = 1;
                        this.frame = 0;
                    }
                } else {
                    this.animate();
                }
            }

            this.drawEnemy();
        }

    }

}