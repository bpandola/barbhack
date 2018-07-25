namespace Barbarian {

    export const SCALE = 2;
    export const TILE_SIZE = 16;
    export const TILE_SHIFT = 4; // 2^4 is 16

    export var FIXED_TIMESTEP = 140;
    export var FRAMERATE = 1000 / FIXED_TIMESTEP;

    export class Game extends Phaser.Game {

        level: Level;
        hero: Hero;
        lives: number = 3;
        inputManager: Barbarian.Input.InputManager;

        debugOn: boolean = false;
        
        constructor() {
            super(640, 400, Phaser.CANVAS, 'game', null);

            this.state.add('Boot', new Barbarian.Boot());
            this.state.add('Play', new Barbarian.Play());

            this.state.start('Boot', true, true, 'Play');  // pass in the state to start after boot
        }

    }
}

window.onload = () => {
    var game = new Barbarian.Game();
};