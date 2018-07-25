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
        debugRoomWarp: number = 0;
        
        constructor(queryParams: {}) {
            super(640, 400, Phaser.CANVAS, 'game', null);

            this.state.add('Boot', new Barbarian.Boot());
            this.state.add('Play', new Barbarian.Play());

            this.state.start('Boot', true, true, 'Play');  // pass in the state to start after boot

            if ('debugOn' in queryParams) {
                this.debugOn = true;
            }

            if ('debugRoomWarp' in queryParams) {
                this.debugRoomWarp = parseInt(queryParams['debugRoomWarp']);
            }
        }

    }
}

window.onload = () => {
    var queryParams = getUrlQueryParams();
    console.log(queryParams);
    var game = new Barbarian.Game(queryParams);
};

function getUrlQueryParams() {
    var queryParams = {}, param;
    // http://example.com/?id=123456&name=amy
    // window.location.search="?id=123456&name=amy"
    var params = window.location.search.substring(1).split("&");
    for (var i = 0; i < params.length; i++) {
        param = params[i].split('=');
        queryParams[param[0]] = param[1];
    }
    return queryParams;
}

