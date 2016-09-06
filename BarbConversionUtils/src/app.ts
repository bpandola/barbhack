namespace Barbarian {

    export const SCALE = 2;
    export const TILE_SIZE = 16;
    export const TILE_SHIFT = 4; // 2^4 is 16

    export const FIXED_TIMESTEP = 120;

    export class Game extends Phaser.Game {

        roomNum: number = 0x10;
        hero: Hero;
        debugOn: boolean = true;
        level: Level;

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