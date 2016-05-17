namespace BarbConversionUtils {

    // Declare the external lib function to keep Typescript happy
    declare var saveAs: any;

    var egaColors = [
        '#000000',
        '#0000A8',
        '#00A800',
        '#00A8A8',
        '#A80000',
        '#A800A8',
        '#A85400',
        '#A8A8A8',
        '#545454',
        '#5454FE',
        '#54FE54',
        '#54FEFE',
        '#FE5454',
        '#FE54FE',
        '#FEFE54',
        '#FEFEFE'];

    export class Test extends Phaser.State {

        game: BarbConversionUtils.Util;
        firstTime: boolean = false;

        testBMP: Phaser.BitmapData;
        index: number = 0;

        init() {
            
           
        }

        preload() {
            this.load.image('test', 'assets/SteveScratch.png');

            this.load.binary('area', 'assets/AREA.BIN', this.binaryLoadCallback, this);
        }


        create() {

            this.stage.backgroundColor = '#0072bc';
            this.stage.smoothed = false;

            this.add.sprite(0, 0, 'test');

            var buffer = this.cache.getBinary('area');


           // this.createAreaData();

            this.createTestBMP(this.index);

            this.testBMP.addToWorld(100, 100, 0, 0, 1, 1);
            

           this.time.events.loop(500, this.updateTest, this);
        }

        createAreaData(i:number) {

            //for (var i = 0; i < 124; i++) {
                this.createTestBMP(i);

                var canvas: any = this.testBMP.canvas; // this.game.canvas; 

                var indexStr: string = "0000" + i.toString();
                // draw to canvas...
                canvas.toBlob(function (blob) {
                    saveAs(blob, "area_" + indexStr.slice(-4) + ".png");
                });

                this.testBMP.destroy();


            //}
        }

        updateTest() {
            //if (this.index > 122) 
            //    return;

            //this.createAreaData(this.index);
            this.index++;
            if (this.index > 122) {
                this.index = 0;
                this.firstTime = false;
            }

            this.testBMP.destroy();
            this.createTestBMP(this.index);
            this.testBMP.addToWorld(100, 100, 0, 0, 1, 1);

        }

       

        render() {

            

            //if (this.firstTime) {
            //    var canvas: any = this.testBMP.canvas; // this.game.canvas; 

            //    var indexStr:string = "0000" + this.index.toString();
            //    // draw to canvas...
            //    canvas.toBlob(function (blob) {
            //        saveAs(blob, "area_" + indexStr +".png");
            //    });

            //    this.firstTime = false;
            //}
        }

       
        binaryLoadCallback(key, data) {
            //  Convert our binary file into a Uint8Array
            //  We must return the data value or nothing will be added to the cache, even if you don't modify it.
            return new Uint8Array(data);
        }

        createTestBMP(index: number, scale?: number) {

            if (scale === undefined)
                scale = 2;

            var buffer = this.cache.getBinary('area');

            var offset: number = (buffer[(index * 2) + 1] * 256) + buffer[(index * 2)];

            var width = buffer[offset++] * scale;
            var height = buffer[offset++] * scale;

            offset++; // skip past unknown byte (always zero)

            this.testBMP = this.make.bitmapData(width, height);
            this.testBMP.smoothed = false;
            
            for (var y = 0; y < height/scale; y++) {
                for (var x = 0; x < width/scale; /*x++*/) {
                    
                    var data: number = buffer[offset];
                    
                    // RLE length is in the high 4 bits; color is in the low bits.
                    var colorLen = (data >> 4);
                    var colorIndex = data & 0x0F;

                    // Transparency
                    var alpha = 255;
                    if (colorIndex === 0) {
                        colorIndex = 13
                        alpha = 0;
                    }
                    else if (colorIndex === 13) {
                        colorIndex = 0;
                       
                    }
                    var c: any = Phaser.Color.hexToColor(egaColors[colorIndex]);
                    
                    for (var j = 0; j <= colorLen; j++) {
                        //this.testBMP.setPixel(x, y, c.r, c.g, c.b);
                        //this.testBMP.setPixel32(x, y, c.r, c.g, c.b, alpha);

                        //scale our pixel
                        for (var sx = 0; sx < scale; sx++) {
                            for (var sy = 0; sy < scale; sy++) {
                                this.testBMP.setPixel32((x*scale)+sx, (y*scale)+sy, c.r, c.g, c.b, alpha);
                            }
                        }


                        x++;
                    }

                    offset++;
                }

            }
            
            
            this.testBMP.update();

        }
      

    }
}