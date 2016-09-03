/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Block extends Enemy {

        static BLK_FALL_LEFT = 0xB0 * SCALE;
        static BLK_FALL_RIGHT = 0x100 * SCALE;

        static BLK_HIT_LEFT = 0xC0 * SCALE;
        static BLK_HIT_RIGHT = 0xF8 * SCALE;

        update() {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Enemy.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Enemy.FIXED_TIMESTEP; // save remainder

                if ((this.animNum == 1 && this.frame === 5) || this.animNum == 2) {
                    this.y = 208;
                    this.animNum = 2;
                    this.frame = 0;
                } else if (this.animNum == 0) {
                    if (this.game.hero.x > Block.BLK_FALL_LEFT && this.game.hero.x < Block.BLK_FALL_RIGHT) {
                        this.animNum = 1;
                        this.frame = 0;
                    }
                } else {
                    this.animate();
                    if (this.animNum == 1) {
                        this.y += 2 * TILE_SIZE;

                        if (this.frame >= 4) {
                            if (this.game.hero.x > Block.BLK_HIT_LEFT && this.game.hero.x < Block.BLK_HIT_RIGHT) {
                                this.game.hero.fsm.transition('Die');
                            }
                        }
                    }
                }
            }

            this.drawEnemy();
        }

    }

}