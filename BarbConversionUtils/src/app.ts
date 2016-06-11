namespace Barbarian {

    export const SCALE = 2;
    export const TILE_SIZE = 16;

    export class Game extends Phaser.Game {

        roomNum: number = 0;

        constructor() {
            super(640, 400, Phaser.CANVAS, 'game', null);

            this.state.add('Boot', new Barbarian.Boot());
            this.state.add('Layout', new Barbarian.Layout());

            this.state.start('Boot',true,true,'Layout');  // pass in the state to start after boot

        }

    }
}

window.onload = () => {
    var game = new Barbarian.Game();
};