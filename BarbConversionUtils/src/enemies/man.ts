/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Man extends Enemy {

        isWithinStrikingDistance(): boolean {
            if (this.game.hero.y == this.y) {
                var delta = this.game.hero.x - this.x;
                if (Math.abs(delta) > 0 && Math.abs(delta) <= TILE_SIZE * 2)
                    return true;
            }
            return false;
        }

        hasNoticedHero(): boolean {
            if (this.game.hero.y == this.y) {
                var delta = this.game.hero.x - this.x;
                if (Math.abs(delta) < 288 && Math.abs(delta) >= 0)
                    return true;
            }
            return false;
        }

        tick() {

            
            switch (this.animNum) {
                case 0:
                case 1:
                    if (this.hasNoticedHero()) {
                        if (this.isWithinStrikingDistance()) {
                            this.animNum = this.game.rnd.integerInRange(2, this.animData.length == 3 ? 2 : 3);
                            this.frame = 0;
                        } else {
                            if (this.animNum != 1) {
                                this.animNum = 1;
                                this.frame = 0;
                            } else {
                                if (this.facing == Direction.Left) {
                                    this.x -= TILE_SIZE;
                                } else {
                                    this.x += TILE_SIZE;
                                }
                            }
                        }
                    } else {
                        this.animNum = 0;
                        this.frame = 0;
                    }
                    break;
                case 2:
                case 3:
                    if (this.isWithinStrikingDistance()) {
                        if (this.frame == 2) {
                            this.game.hero.fsm.transition('Die');
                        }
                    } else {
                        this.animNum = 0;
                        this.frame = 0;
                    }
                
            }

            if (this.x < this.game.hero.x)
                this.facing = Direction.Right;
            else
                this.facing = Direction.Left;

            if (this.x < this.dataBlob.xMin)
                this.x = this.dataBlob.xMin;
            if (this.x > this.dataBlob.xMax)
                this.x = this.dataBlob.xMax;

            this.animate();

            this.render();

        }

    }

}