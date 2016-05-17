var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BarbConversionUtils;
(function (BarbConversionUtils) {
    var Util = (function (_super) {
        __extends(Util, _super);
        function Util() {
            _super.call(this, 640, 400, Phaser.CANVAS, 'content', null);
            this.state.add('Boot', new BarbConversionUtils.Boot());
            this.state.add('Test', new BarbConversionUtils.Test());
            this.state.add('Layout', new BarbConversionUtils.Layout());
            this.state.start('Boot', true, true, 'Layout');
        }
        return Util;
    }(Phaser.Game));
    BarbConversionUtils.Util = Util;
})(BarbConversionUtils || (BarbConversionUtils = {}));
window.onload = function () {
    var game = new BarbConversionUtils.Util();
};
var BarbConversionUtils;
(function (BarbConversionUtils) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.init = function (stateToStart) {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.setMinMax(640, 400, 1280, 800);
            this.game.time.advancedTiming = true;
            this.stage.smoothed = false;
            this.game.renderer.renderSession.roundPixels = true;
            this.game.state.start(stateToStart);
        };
        return Boot;
    }(Phaser.State));
    BarbConversionUtils.Boot = Boot;
})(BarbConversionUtils || (BarbConversionUtils = {}));
var BarbConversionUtils;
(function (BarbConversionUtils) {
    var Layout = (function (_super) {
        __extends(Layout, _super);
        function Layout() {
            _super.apply(this, arguments);
            this.room = 0;
        }
        Layout.prototype.preload = function () {
            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
        };
        Layout.prototype.create = function () {
            var _this = this;
            this.roomsJSON = this.cache.getJSON('rooms');
            this.stage.smoothed = false;
            this.drawRoom();
            var key;
            key = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            key.onDown.add(function () { _this.nextRoom(0); }, this);
            key = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            key.onDown.add(function () { _this.nextRoom(1); }, this);
            key = this.input.keyboard.addKey(Phaser.Keyboard.UP);
            key.onDown.add(function () { _this.nextRoom(2); }, this);
            key = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            key.onDown.add(function () { _this.nextRoom(3); }, this);
        };
        Layout.prototype.nextRoom = function (direction) {
            var newRoom;
            switch (direction) {
                case 0:
                    newRoom = this.roomsJSON[this.room].mapData.left;
                    break;
                case 1:
                    newRoom = this.roomsJSON[this.room].mapData.right;
                    break;
                case 2:
                    newRoom = this.roomsJSON[this.room].mapData.up;
                    break;
                case 3:
                    newRoom = this.roomsJSON[this.room].mapData.down;
                    break;
            }
            if (newRoom !== -1) {
                this.room = newRoom;
                this.drawRoom();
            }
        };
        Layout.prototype.drawRoom = function () {
            this.world.removeAll();
            for (var _i = 0, _a = this.roomsJSON[this.room].area; _i < _a.length; _i++) {
                var o = _a[_i];
                var obj = o;
                var spr;
                if (obj.flags !== 5) {
                    spr = this.add.sprite(obj.xOff, obj.yOff, 'area', obj.imageId);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = obj.flags & 1 ? -1 : 1;
                    var yScale = obj.flags & 2 ? -1 : 1;
                    spr.scale.setTo(xScale, yScale);
                }
                else {
                    var rect = this.add.bitmapData(16 * obj.unknown, 16);
                    rect.fill(0, 0, 0, 1);
                    rect.addToWorld(obj.xOff, obj.yOff);
                }
            }
        };
        return Layout;
    }(Phaser.State));
    BarbConversionUtils.Layout = Layout;
})(BarbConversionUtils || (BarbConversionUtils = {}));
var BarbConversionUtils;
(function (BarbConversionUtils) {
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
    var Test = (function (_super) {
        __extends(Test, _super);
        function Test() {
            _super.apply(this, arguments);
            this.firstTime = false;
            this.index = 0;
        }
        Test.prototype.init = function () {
        };
        Test.prototype.preload = function () {
            this.load.image('test', 'assets/SteveScratch.png');
            this.load.binary('area', 'assets/AREA.BIN', this.binaryLoadCallback, this);
        };
        Test.prototype.create = function () {
            this.stage.backgroundColor = '#0072bc';
            this.stage.smoothed = false;
            this.add.sprite(0, 0, 'test');
            var buffer = this.cache.getBinary('area');
            this.createTestBMP(this.index);
            this.testBMP.addToWorld(100, 100, 0, 0, 1, 1);
            this.time.events.loop(500, this.updateTest, this);
        };
        Test.prototype.createAreaData = function (i) {
            this.createTestBMP(i);
            var canvas = this.testBMP.canvas;
            var indexStr = "0000" + i.toString();
            canvas.toBlob(function (blob) {
                saveAs(blob, "area_" + indexStr.slice(-4) + ".png");
            });
            this.testBMP.destroy();
        };
        Test.prototype.updateTest = function () {
            this.index++;
            if (this.index > 122) {
                this.index = 0;
                this.firstTime = false;
            }
            this.testBMP.destroy();
            this.createTestBMP(this.index);
            this.testBMP.addToWorld(100, 100, 0, 0, 1, 1);
        };
        Test.prototype.render = function () {
        };
        Test.prototype.binaryLoadCallback = function (key, data) {
            return new Uint8Array(data);
        };
        Test.prototype.createTestBMP = function (index, scale) {
            if (scale === undefined)
                scale = 2;
            var buffer = this.cache.getBinary('area');
            var offset = (buffer[(index * 2) + 1] * 256) + buffer[(index * 2)];
            var width = buffer[offset++] * scale;
            var height = buffer[offset++] * scale;
            offset++;
            this.testBMP = this.make.bitmapData(width, height);
            this.testBMP.smoothed = false;
            for (var y = 0; y < height / scale; y++) {
                for (var x = 0; x < width / scale;) {
                    var data = buffer[offset];
                    var colorLen = (data >> 4);
                    var colorIndex = data & 0x0F;
                    var alpha = 255;
                    if (colorIndex === 0) {
                        colorIndex = 13;
                        alpha = 0;
                    }
                    else if (colorIndex === 13) {
                        colorIndex = 0;
                    }
                    var c = Phaser.Color.hexToColor(egaColors[colorIndex]);
                    for (var j = 0; j <= colorLen; j++) {
                        for (var sx = 0; sx < scale; sx++) {
                            for (var sy = 0; sy < scale; sy++) {
                                this.testBMP.setPixel32((x * scale) + sx, (y * scale) + sy, c.r, c.g, c.b, alpha);
                            }
                        }
                        x++;
                    }
                    offset++;
                }
            }
            this.testBMP.update();
        };
        return Test;
    }(Phaser.State));
    BarbConversionUtils.Test = Test;
})(BarbConversionUtils || (BarbConversionUtils = {}));
//# sourceMappingURL=barbutils.js.map