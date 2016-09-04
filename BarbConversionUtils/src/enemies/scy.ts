/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Scythe extends Enemy {

        static TRIGGER_DISTANCE = 0x20 * SCALE;
        static HIT_DISTANCE = 0x10 * SCALE;

        update() {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Enemy.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Enemy.FIXED_TIMESTEP; // save remainder
                
                if ((this.animNum == 1 && this.frame === 2) || this.animNum == 2) {
                    this.animNum = 2;
                    this.frame = 0;
                } else if (this.animNum == 0) {
                    if (this.game.hero.x - this.x < Scythe.TRIGGER_DISTANCE) {
                        this.animNum = 1;
                        this.frame = 0;
                    }
                } else {
                    this.animate();
                    if (this.animNum == 1) {

                        if (this.game.hero.x - this.x < Scythe.HIT_DISTANCE) {
                            this.game.hero.fsm.transition('TripFall');
                        }

                    }
                }
            }

            this.drawEnemy();
        }

    }

}