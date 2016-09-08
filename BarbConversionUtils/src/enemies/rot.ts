/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Rotate extends Enemy {

        getBodyBounds(): Phaser.Rectangle {


            var bounds = new Phaser.Rectangle(0, 0, 0, 0);

            for (var part of this.children) {
                var partCast: any = part;
                if (partCast.frame === 7 || partCast.frame === 6) {
                    var pbounds = part.getBounds();
                    bounds = new Phaser.Rectangle(pbounds.x, pbounds.y, pbounds.width, pbounds.height);
                }
            }

            return bounds;
        }

        update() {



            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Enemy.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Enemy.FIXED_TIMESTEP; // save remainder

                var heroBounds: Phaser.Rectangle = this.game.hero.getBodyBounds();
                var thisBounds: any = this.getBounds();

                //if (this.frame >= 2 && this.frame <= 7) {
                //if (heroBounds.intersects(this.getBodyBounds(),0)) {
                if (Phaser.Rectangle.intersects(heroBounds, thisBounds)) {
                    //if (this.game.hero.x > 300 && this.game.hero.x < 400) {

                    this.game.hero.fsm.transition('FallDeath');
                    //}
                }


                this.animate();
            }


            this.render();

        }

    }

}