namespace BarbConversionUtils {

    export class Boot extends Phaser.State {

        game: BarbConversionUtils.Util;

        init(stateToStart) {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;

           
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                //this.scale.setMinMax(640, 400, 1280, 800);
           

            this.game.time.advancedTiming = true;
            //this.sound.mute = true;
            this.stage.smoothed = false;
            this.game.renderer.renderSession.roundPixels = true;

           
            this.game.state.start(stateToStart);
        }

      
    }
}