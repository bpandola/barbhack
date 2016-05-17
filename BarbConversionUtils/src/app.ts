namespace BarbConversionUtils {

    export class Util extends Phaser.Game {

        constructor() {
            super(640, 400, Phaser.CANVAS, 'content', null);

            this.state.add('Boot', new BarbConversionUtils.Boot());
            this.state.add('Test', new BarbConversionUtils.Test());
            this.state.add('Layout', new BarbConversionUtils.Layout());

            this.state.start('Boot',true,true,'Layout');  // pass in the state to start after boot

        }

    }
}

window.onload = () => {
    var game = new BarbConversionUtils.Util();
};