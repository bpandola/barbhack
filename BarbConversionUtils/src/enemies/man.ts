/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Man extends Enemy {

        isWithinStrikingDistance(): boolean {
            return false;
        }

        tick() {

            switch (this.animNum) {
                case 0:
                case 1:
                case 2:
                case 3:
            }

            if (this.game.hero.y == this.y) {
                var delta = this.game.hero.x - this.x;
                if (Math.abs(delta) < 288 && Math.abs(delta) > TILE_SIZE * 2) {
                    if (delta < 0) {
                        this.x -= TILE_SIZE;
                    } else {
                        this.x += TILE_SIZE;
                    }
                    this.animNum = 1;
                } else if (Math.abs(delta) > 0 && Math.abs(delta) <= TILE_SIZE * 2) {
                    this.animNum = this.game.rnd.integerInRange(2, 3);
                } else {
                    this.animNum = 0;
                }

            } else {
                this.animNum = 0;
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