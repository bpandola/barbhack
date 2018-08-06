var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Barbarian;
(function (Barbarian) {
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
            this.game.time.advancedTiming = true;
            this.stage.smoothed = false;
            this.game.renderer.renderSession.roundPixels = true;
            this.game.state.start(stateToStart);
        };
        return Boot;
    }(Phaser.State));
    Barbarian.Boot = Boot;
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    Barbarian.SCALE = 2;
    Barbarian.TILE_SIZE = 16;
    Barbarian.TILE_SHIFT = 4;
    Barbarian.FIXED_TIMESTEP = 140;
    Barbarian.FRAMERATE = 1000 / Barbarian.FIXED_TIMESTEP;
    Barbarian.EGA_COLORS = [
        0x000000FF,
        0x0000AAFF,
        0x00AA00FF,
        0x00AAAAFF,
        0xAA0000FF,
        0xAA00AAFF,
        0xAA5500FF,
        0xAAAAAAFF,
        0x555555FF,
        0x5555FFFF,
        0x55FF55FF,
        0x55FFFFFF,
        0xFF5555FF,
        0xFF55FFFF,
        0xFFFF55FF,
        0xFFFFFFFF
    ];
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game(queryParams) {
            _super.call(this, 640, 400, Phaser.CANVAS, 'game', null);
            this.lives = 3;
            this.debugOn = false;
            this.debugRoomWarp = 0;
            this.state.add('Boot', new Barbarian.Boot());
            this.state.add('Play', new Barbarian.Play());
            this.state.add('Test', new Barbarian.Test());
            var net = new Phaser.Net(this);
            var params = net.getQueryString();
            if (!('startingState' in params)) {
                params['startingState'] = 'Play';
            }
            this.state.start('Boot', true, true, params['startingState']);
            if ('debugOn' in queryParams) {
                this.debugOn = true;
            }
            if ('debugRoomWarp' in queryParams) {
                this.debugRoomWarp = parseInt(queryParams['debugRoomWarp']);
            }
        }
        return Game;
    }(Phaser.Game));
    Barbarian.Game = Game;
})(Barbarian || (Barbarian = {}));
window.onload = function () {
    var queryParams = getUrlQueryParams();
    console.log(queryParams);
    var game = new Barbarian.Game(queryParams);
};
function getUrlQueryParams() {
    var queryParams = {}, param;
    var params = window.location.search.substring(1).split("&");
    for (var i = 0; i < params.length; i++) {
        param = params[i].split('=');
        queryParams[param[0]] = param[1];
    }
    return queryParams;
}
var Barbarian;
(function (Barbarian) {
    var EntityOld = (function (_super) {
        __extends(EntityOld, _super);
        function EntityOld(game, key) {
            _super.call(this, game);
            this.timeStep = 0;
            for (var i = 0; i < game.cache.getFrameCount(key); i++) {
                var part = this.create(0, 0, key, i);
                part.anchor.setTo(0.5);
                part.visible = false;
            }
        }
        Object.defineProperty(EntityOld.prototype, "currentParts", {
            get: function () {
                return [];
            },
            enumerable: true,
            configurable: true
        });
        EntityOld.prototype.moveRelative = function (numTilesX, numTilesY) {
            var xMovement = this.facing == Barbarian.Facing.Right ? Barbarian.TILE_SIZE : -Barbarian.TILE_SIZE;
            var yMovement = this.direction == Barbarian.Direction.Up ? -Barbarian.TILE_SIZE : Barbarian.TILE_SIZE;
            this.x += xMovement * numTilesX;
            this.y += yMovement * numTilesY;
        };
        EntityOld.prototype.update = function () {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Barbarian.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Barbarian.FIXED_TIMESTEP;
                this.tick();
            }
        };
        EntityOld.prototype.tick = function () { };
        EntityOld.prototype.render = function () {
            this.forEach(function (part) { part.visible = false; }, this);
            for (var i = 0, parts = this.currentParts; i < parts.length; i++) {
                var part = parts[i];
                if (part.index < 0) {
                    continue;
                }
                var spr = this.getChildAt(part.index);
                spr.scale.setTo(1, 1);
                spr.x = this.facing === Barbarian.Facing.Left ? part.rx : part.x;
                spr.y = this.facing === Barbarian.Facing.Left ? part.ry : part.y;
                spr.x += spr.width / 2;
                spr.y += spr.height / 2;
                spr.z = i;
                var xScale = part.flags & 1 ? -1 : 1;
                var yScale = part.flags & 2 ? -1 : 1;
                xScale = this.facing === Barbarian.Facing.Left ? -xScale : xScale;
                spr.scale.setTo(xScale, yScale);
                spr.visible = true;
            }
        };
        return EntityOld;
    }(Phaser.Group));
    Barbarian.EntityOld = EntityOld;
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var AnimationManager = (function (_super) {
        __extends(AnimationManager, _super);
        function AnimationManager(sprite, animData) {
            _super.call(this, sprite);
            this.data = animData;
            this._frameData = sprite.animations._frameData;
            for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
                var anim = _a[_i];
                var frames = [];
                for (var i = 0; i < anim.frames.length; i++) {
                    frames[i] = 0;
                }
                this.add(anim.id.toString(), frames, Barbarian.FRAMERATE, true, true);
            }
            this.updateIfVisible = false;
        }
        AnimationManager.prototype.play = function (name, frameRate, loop, killOnComplete) {
            return _super.prototype.play.call(this, name.toString(), frameRate, loop, killOnComplete);
        };
        AnimationManager.prototype.nextAnim = function () {
            var next = 0;
            if (this.currentAnim) {
                next = this.animNum + 1;
                if (next > this.data.length) {
                    next = this.data.length - 1;
                }
            }
            this.play(next.toString());
        };
        AnimationManager.prototype.previousAnim = function () {
            var previous = 0;
            if (this.currentAnim) {
                previous = this.animNum - 1;
                if (previous < 0) {
                    previous = 0;
                }
            }
            this.play(previous.toString());
        };
        Object.defineProperty(AnimationManager.prototype, "currentParts", {
            get: function () {
                if (this.currentAnim) {
                    return this.data[this.animNum].frames[this.frameIndex].parts;
                }
                else {
                    return [];
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationManager.prototype, "frameIndex", {
            get: function () {
                if (this.currentAnim) {
                    return this.currentAnim._frameIndex;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationManager.prototype, "animNum", {
            get: function () {
                if (this.currentAnim) {
                    return parseInt(this.currentAnim.name, 10);
                }
                else {
                    return 0;
                }
            },
            enumerable: true,
            configurable: true
        });
        return AnimationManager;
    }(Phaser.AnimationManager));
    (function (Entity) {
        Entity[Entity["NLL"] = 0] = "NLL";
        Entity[Entity["AXE"] = 1] = "AXE";
        Entity[Entity["THR"] = 2] = "THR";
        Entity[Entity["POP"] = 3] = "POP";
        Entity[Entity["DOG"] = 4] = "DOG";
        Entity[Entity["HOP"] = 5] = "HOP";
        Entity[Entity["REP"] = 6] = "REP";
        Entity[Entity["ARO"] = 7] = "ARO";
        Entity[Entity["MET"] = 8] = "MET";
        Entity[Entity["REN"] = 9] = "REN";
        Entity[Entity["VER"] = 10] = "VER";
        Entity[Entity["BAD"] = 11] = "BAD";
        Entity[Entity["ROC"] = 12] = "ROC";
        Entity[Entity["APE"] = 13] = "APE";
        Entity[Entity["SCY"] = 14] = "SCY";
        Entity[Entity["RHI"] = 15] = "RHI";
        Entity[Entity["MN1"] = 16] = "MN1";
        Entity[Entity["MN2"] = 17] = "MN2";
        Entity[Entity["MN3"] = 18] = "MN3";
        Entity[Entity["MN4"] = 19] = "MN4";
        Entity[Entity["MN5"] = 20] = "MN5";
        Entity[Entity["MN6"] = 21] = "MN6";
        Entity[Entity["MN7"] = 22] = "MN7";
        Entity[Entity["MOR"] = 23] = "MOR";
        Entity[Entity["OC1"] = 24] = "OC1";
        Entity[Entity["OC2"] = 25] = "OC2";
        Entity[Entity["NT1"] = 26] = "NT1";
        Entity[Entity["NT2"] = 27] = "NT2";
        Entity[Entity["NT3"] = 28] = "NT3";
        Entity[Entity["AC1"] = 29] = "AC1";
        Entity[Entity["AC2"] = 30] = "AC2";
        Entity[Entity["AC3"] = 31] = "AC3";
        Entity[Entity["BLK"] = 32] = "BLK";
        Entity[Entity["SPK"] = 33] = "SPK";
        Entity[Entity["STN"] = 34] = "STN";
        Entity[Entity["DRA"] = 35] = "DRA";
        Entity[Entity["ROT"] = 36] = "ROT";
        Entity[Entity["VSP"] = 37] = "VSP";
        Entity[Entity["HERO"] = 38] = "HERO";
    })(Barbarian.Entity || (Barbarian.Entity = {}));
    var Entity = Barbarian.Entity;
    var EntityFactory = (function () {
        function EntityFactory(game) {
            this.game = game;
        }
        EntityFactory.prototype.create = function (id, x, y) {
            var anim_data = [];
            if (id == Entity.HERO) {
                anim_data = this.game.cache.getJSON('heroanims');
            }
            else {
                anim_data = this.game.cache.getJSON('enemies')[id].animations;
            }
            return new GameEntity(this.game, x, y, Entity[id], anim_data);
        };
        return EntityFactory;
    }());
    Barbarian.EntityFactory = EntityFactory;
    var GameEntity = (function (_super) {
        __extends(GameEntity, _super);
        function GameEntity(game, x, y, key, anim_data) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            _super.call(this, game, x, y, 'NLL');
            this.timeStep = 0;
            for (var i = 0; i < game.cache.getFrameCount(key); i++) {
                var part = this.addChild(game.make.sprite(0, 0, key, i));
                part.anchor.setTo(0.5);
                part.visible = false;
            }
            this.animator = new AnimationManager(this, anim_data);
            this.animations = this.animator;
        }
        Object.defineProperty(GameEntity.prototype, "currentParts", {
            get: function () {
                return this.animator.currentParts;
            },
            enumerable: true,
            configurable: true
        });
        GameEntity.prototype.moveRelative = function (numTilesX, numTilesY) {
            var xMovement = this.facing == Barbarian.Facing.Right ? Barbarian.TILE_SIZE : -Barbarian.TILE_SIZE;
            var yMovement = this.direction == Barbarian.Direction.Up ? -Barbarian.TILE_SIZE : Barbarian.TILE_SIZE;
            this.x += xMovement * numTilesX;
            this.y += yMovement * numTilesY;
        };
        GameEntity.prototype.update = function () {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Barbarian.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Barbarian.FIXED_TIMESTEP;
                this.animator.update();
                this.tick();
            }
        };
        GameEntity.prototype.tick = function () {
        };
        GameEntity.prototype.postUpdate = function () {
            this.children.forEach(function (part) { part.visible = false; });
            for (var i = 0, parts = this.currentParts; i < parts.length; i++) {
                var part = parts[i];
                if (part.index < 0) {
                    continue;
                }
                var spr = this.getChildAt(part.index);
                spr.scale.setTo(1, 1);
                spr.x = this.facing === Barbarian.Facing.Left ? part.rx : part.x;
                spr.y = this.facing === Barbarian.Facing.Left ? part.ry : part.y;
                spr.x += spr.width / 2;
                spr.y += spr.height / 2;
                spr.z = i;
                var xScale = part.flags & 1 ? -1 : 1;
                var yScale = part.flags & 2 ? -1 : 1;
                xScale = this.facing === Barbarian.Facing.Left ? -xScale : xScale;
                spr.scale.setTo(xScale, yScale);
                spr.visible = true;
            }
        };
        return GameEntity;
    }(Phaser.Sprite));
    Barbarian.GameEntity = GameEntity;
    var Test = (function (_super) {
        __extends(Test, _super);
        function Test() {
            _super.apply(this, arguments);
            this.currentEntityId = Entity.HERO;
        }
        Test.prototype.preload = function () {
            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
            this.load.atlasJSONArray('HERO', 'assets/hero.png', 'assets/hero.json');
            this.load.json('heroanims', 'assets/heroanims.json');
            this.load.json('enemies', 'assets/enemyanims.json');
            for (var i = 0; i < 38; i++) {
                var key = Barbarian.Enemies.EnemyKeys[i].toLowerCase();
                this.load.atlasJSONArray(key.toUpperCase(), 'assets/enemies/' + key + '.png', 'assets/enemies/' + key + '.json');
            }
        };
        Test.prototype.create = function () {
            var _this = this;
            this.entityFactory = new EntityFactory(this.game);
            this.placeEntities(this.currentEntityId);
            var key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            key1.onDown.add(function () {
                _this.entities.forEach(function (entity) {
                    entity.animator.previousAnim();
                });
            });
            var key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            key2.onDown.add(function () {
                _this.entities.forEach(function (entity) {
                    entity.animator.nextAnim();
                });
            });
            var key3 = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            key3.onDown.add(function () { _this.nextEntity(); });
            var key4 = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            key4.onDown.add(function () { _this.previousEntity(); });
        };
        Test.prototype.placeEntities = function (entityId) {
            var _this = this;
            this.game.stage.backgroundColor = Phaser.Color.getRandomColor();
            this.world.removeAll();
            this.entities = [];
            this.entities.push(this.entityFactory.create(entityId, 240, 300));
            this.entities.push(this.entityFactory.create(entityId, 400, 300));
            this.entities[1].facing = Barbarian.Facing.Left;
            this.entities.forEach(function (entity) {
                _this.world.add(entity);
                entity.animator.play('0');
            });
        };
        Test.prototype.previousEntity = function () {
            this.currentEntityId--;
            if (this.currentEntityId < 0) {
                this.currentEntityId = 0;
                return;
            }
            this.placeEntities(this.currentEntityId);
        };
        Test.prototype.nextEntity = function () {
            this.currentEntityId++;
            if (this.currentEntityId > Entity.HERO) {
                this.currentEntityId = Entity.HERO;
                return;
            }
            this.placeEntities(this.currentEntityId);
        };
        Test.prototype.update = function () {
        };
        return Test;
    }(Phaser.State));
    Barbarian.Test = Test;
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        (function (EnemyKeys) {
            EnemyKeys[EnemyKeys["NLL"] = 0] = "NLL";
            EnemyKeys[EnemyKeys["AXE"] = 1] = "AXE";
            EnemyKeys[EnemyKeys["THR"] = 2] = "THR";
            EnemyKeys[EnemyKeys["POP"] = 3] = "POP";
            EnemyKeys[EnemyKeys["DOG"] = 4] = "DOG";
            EnemyKeys[EnemyKeys["HOP"] = 5] = "HOP";
            EnemyKeys[EnemyKeys["REP"] = 6] = "REP";
            EnemyKeys[EnemyKeys["ARO"] = 7] = "ARO";
            EnemyKeys[EnemyKeys["MET"] = 8] = "MET";
            EnemyKeys[EnemyKeys["REN"] = 9] = "REN";
            EnemyKeys[EnemyKeys["VER"] = 10] = "VER";
            EnemyKeys[EnemyKeys["BAD"] = 11] = "BAD";
            EnemyKeys[EnemyKeys["ROC"] = 12] = "ROC";
            EnemyKeys[EnemyKeys["APE"] = 13] = "APE";
            EnemyKeys[EnemyKeys["SCY"] = 14] = "SCY";
            EnemyKeys[EnemyKeys["RHI"] = 15] = "RHI";
            EnemyKeys[EnemyKeys["MN1"] = 16] = "MN1";
            EnemyKeys[EnemyKeys["MN2"] = 17] = "MN2";
            EnemyKeys[EnemyKeys["MN3"] = 18] = "MN3";
            EnemyKeys[EnemyKeys["MN4"] = 19] = "MN4";
            EnemyKeys[EnemyKeys["MN5"] = 20] = "MN5";
            EnemyKeys[EnemyKeys["MN6"] = 21] = "MN6";
            EnemyKeys[EnemyKeys["MN7"] = 22] = "MN7";
            EnemyKeys[EnemyKeys["MOR"] = 23] = "MOR";
            EnemyKeys[EnemyKeys["OC1"] = 24] = "OC1";
            EnemyKeys[EnemyKeys["OC2"] = 25] = "OC2";
            EnemyKeys[EnemyKeys["NT1"] = 26] = "NT1";
            EnemyKeys[EnemyKeys["NT2"] = 27] = "NT2";
            EnemyKeys[EnemyKeys["NT3"] = 28] = "NT3";
            EnemyKeys[EnemyKeys["AC1"] = 29] = "AC1";
            EnemyKeys[EnemyKeys["AC2"] = 30] = "AC2";
            EnemyKeys[EnemyKeys["AC3"] = 31] = "AC3";
            EnemyKeys[EnemyKeys["BLK"] = 32] = "BLK";
            EnemyKeys[EnemyKeys["SPK"] = 33] = "SPK";
            EnemyKeys[EnemyKeys["STN"] = 34] = "STN";
            EnemyKeys[EnemyKeys["DRA"] = 35] = "DRA";
            EnemyKeys[EnemyKeys["ROT"] = 36] = "ROT";
            EnemyKeys[EnemyKeys["VSP"] = 37] = "VSP";
            EnemyKeys[EnemyKeys["misc"] = 38] = "misc";
        })(Enemies.EnemyKeys || (Enemies.EnemyKeys = {}));
        var EnemyKeys = Enemies.EnemyKeys;
        var Enemy = (function (_super) {
            __extends(Enemy, _super);
            function Enemy(game, dataBlob, direction) {
                _super.call(this, game, EnemyKeys[dataBlob.id]);
                this.tilePos = new Phaser.Point();
                this.dataBlob = dataBlob;
                this.x = dataBlob.xOff[direction + 1];
                this.y = dataBlob.yOff;
                this.animData = this.game.cache.getJSON('enemies')[dataBlob.id].animations;
                this.animNum = 0;
                this.frame = 0;
                this.direction = direction;
                this.facing = this.dataBlob.flags[this.direction + 1] ? Barbarian.Facing.Left : Barbarian.Facing.Right;
                this.timeStep = Barbarian.FIXED_TIMESTEP;
            }
            Enemy.createEnemy = function (game, data, direction) {
                switch (data.id) {
                    case EnemyKeys.THR:
                        var anim_data = game.cache.getJSON('enemies')[data.id].animations;
                        var x = data.xOff[direction + 1];
                        var y = data.yOff;
                        var thr = new Enemies.Thr(game, x, y, Barbarian.Entity[data.id], anim_data);
                        thr.facing = data.flags[direction + 1] ? Barbarian.Facing.Left : Barbarian.Facing.Right;
                        return thr;
                    case EnemyKeys.AXE:
                        var anim_data = game.cache.getJSON('enemies')[data.id].animations;
                        var x = data.xOff[direction + 1];
                        var y = data.yOff;
                        var axe = new Enemies.Axe(game, x, y, Barbarian.Entity[data.id], anim_data);
                        axe.facing = data.flags[direction + 1] ? Barbarian.Facing.Left : Barbarian.Facing.Right;
                        return axe;
                    case EnemyKeys.ROT:
                        return new Enemies.Rotate(game, data, direction);
                    case EnemyKeys.SCY:
                        var anim_data = game.cache.getJSON('enemies')[data.id].animations;
                        var x = data.xOff[direction + 1];
                        var y = data.yOff;
                        var scy = new Enemies.Scythe(game, x, y, Barbarian.Entity[data.id], anim_data);
                        scy.facing = data.flags[direction + 1] ? Barbarian.Facing.Left : Barbarian.Facing.Right;
                        return scy;
                    case EnemyKeys.BLK:
                        return new Enemies.Block(game, data, direction);
                    case EnemyKeys.SPK:
                        return new Enemies.Spikes(game, data, direction);
                    case EnemyKeys.POP:
                        return new Enemies.Pop(game, data, direction);
                    case EnemyKeys.MN1:
                    case EnemyKeys.MN2:
                    case EnemyKeys.MN3:
                    case EnemyKeys.MN4:
                    case EnemyKeys.MN5:
                    case EnemyKeys.MN6:
                    case EnemyKeys.MN7:
                    case EnemyKeys.APE:
                    case EnemyKeys.OC1:
                    case EnemyKeys.OC2:
                    case EnemyKeys.NT1:
                    case EnemyKeys.NT2:
                    case EnemyKeys.NT3:
                        return new Enemies.Man(game, data, direction);
                    default:
                        return new Enemy(game, data, direction);
                }
            };
            Object.defineProperty(Enemy.prototype, "currentParts", {
                get: function () {
                    if (this.dataBlob.id === EnemyKeys.NLL)
                        return [];
                    return this.animData[this.animNum].frames[this.frame].parts;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Enemy.prototype, "isKillable", {
                get: function () {
                    return this.dataBlob.xMin > 0
                        && this.dataBlob.xMax > 0
                        && this.children.length > 0
                        && this.alive;
                },
                enumerable: true,
                configurable: true
            });
            Enemy.prototype.kill = function () {
                this.game.world.add(new Barbarian.Spirit(this));
                this.destroy();
            };
            Enemy.prototype.animate = function () {
                if (this.animData.length === 0)
                    return;
                var numFrames = this.animData[this.animNum].frames.length;
                this.frame++;
                if (this.frame >= numFrames)
                    this.frame = 0;
            };
            Enemy.prototype.tick = function () {
                if (this.dataBlob.xMin > 0 && this.dataBlob.xMax > 0) {
                    if (this.game.hero.y == this.y) {
                        var delta = this.game.hero.x - this.x;
                        if (Math.abs(delta) < 320 && Math.abs(delta) > Barbarian.TILE_SIZE * 2) {
                            if (delta < 0) {
                                this.x -= Barbarian.TILE_SIZE;
                            }
                            else {
                                this.x += Barbarian.TILE_SIZE;
                            }
                            this.animNum = 1;
                        }
                        else if (Math.abs(delta) > 0 && Math.abs(delta) <= Barbarian.TILE_SIZE * 2) {
                        }
                        else {
                            this.animNum = 0;
                        }
                    }
                    else {
                        this.animNum = 0;
                    }
                    if (this.x < this.game.hero.x)
                        this.facing = Barbarian.Facing.Right;
                    else
                        this.facing = Barbarian.Facing.Left;
                    if (this.x < this.dataBlob.xMin)
                        this.x = this.dataBlob.xMin;
                    if (this.x > this.dataBlob.xMax)
                        this.x = this.dataBlob.xMax;
                }
                if (this.dataBlob.id == EnemyKeys.THR)
                    this.animNum = 1;
                this.animate();
                this.render();
            };
            return Enemy;
        }(Barbarian.EntityOld));
        Enemies.Enemy = Enemy;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        var Axe = (function (_super) {
            __extends(Axe, _super);
            function Axe(game, x, y, key, anim_data) {
                var _this = this;
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                _super.call(this, game, x, y, key, anim_data);
                var attack = this.animations.getAnimation("1");
                attack.loop = false;
                attack.onComplete.add(function () { return _this.animations.play(Axe.IDLE); });
                this.animations.play('0');
            }
            Axe.prototype.update = function () {
                if (this.animations.animNum == Axe.IDLE) {
                    if (this.game.hero.x >= Axe.TRIGGER_X_MIN && this.game.hero.x < Axe.TRIGGER_X_MAX) {
                        this.animations.play(Axe.ATTACK_SLOW);
                    }
                }
                else if (this.animations.animNum == Axe.ATTACK_SLOW) {
                    var hitBox = new Phaser.Rectangle(Axe.KILL_X_MIN, Axe.KILL_Y_MIN, Axe.KILL_X_MAX - Axe.KILL_X_MIN + 1, Axe.KILL_Y_MAX - Axe.KILL_Y_MIN + 1);
                    if (hitBox.contains(this.game.hero.x, this.game.hero.y)) {
                        if (Axe.KILL_FRAMES.indexOf(this.animations.frameIndex) != -1) {
                            this.game.hero.fsm.transition('Die');
                        }
                    }
                }
            };
            Axe.TRIGGER_X_MIN = 0x28 * Barbarian.SCALE;
            Axe.TRIGGER_X_MAX = 0x50 * Barbarian.SCALE;
            Axe.IDLE = 0;
            Axe.ATTACK_SLOW = 1;
            Axe.ATTACK_FAST = 2;
            Axe.KILL_FRAMES = [2, 3, 4, 5];
            Axe.KILL_X_MIN = 0x30 * Barbarian.SCALE;
            Axe.KILL_X_MAX = 0x48 * Barbarian.SCALE;
            Axe.KILL_Y_MIN = 0x80 * Barbarian.SCALE;
            Axe.KILL_Y_MAX = 0x90 * Barbarian.SCALE;
            return Axe;
        }(Barbarian.GameEntity));
        Enemies.Axe = Axe;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        var Block = (function (_super) {
            __extends(Block, _super);
            function Block() {
                _super.apply(this, arguments);
            }
            Block.prototype.tick = function () {
                if ((this.animNum == 1 && this.frame === 5) || this.animNum == 2) {
                    this.y = 208;
                    this.animNum = 2;
                    this.frame = 0;
                }
                else if (this.animNum == 0) {
                    if (this.game.hero.x > Block.BLK_FALL_LEFT && this.game.hero.x < Block.BLK_FALL_RIGHT) {
                        this.animNum = 1;
                        this.frame = 0;
                    }
                }
                else {
                    this.animate();
                    if (this.animNum == 1) {
                        this.y += 2 * Barbarian.TILE_SIZE;
                        if (this.frame >= 4) {
                            if (this.game.hero.x > Block.BLK_HIT_LEFT && this.game.hero.x < Block.BLK_HIT_RIGHT) {
                                this.game.hero.fsm.transition('Die');
                            }
                        }
                    }
                }
                this.render();
            };
            Block.BLK_FALL_LEFT = 0xB0 * Barbarian.SCALE;
            Block.BLK_FALL_RIGHT = 0x100 * Barbarian.SCALE;
            Block.BLK_HIT_LEFT = 0xC0 * Barbarian.SCALE;
            Block.BLK_HIT_RIGHT = 0xF8 * Barbarian.SCALE;
            return Block;
        }(Enemies.Enemy));
        Enemies.Block = Block;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        var Man = (function (_super) {
            __extends(Man, _super);
            function Man() {
                _super.apply(this, arguments);
            }
            Man.prototype.isWithinStrikingDistance = function () {
                if (this.game.hero.y == this.y) {
                    var delta = this.game.hero.x - this.x;
                    if (Math.abs(delta) > 0 && Math.abs(delta) <= Barbarian.TILE_SIZE * 2)
                        return true;
                }
                return false;
            };
            Man.prototype.hasNoticedHero = function () {
                if (this.game.hero.y == this.y) {
                    var delta = this.game.hero.x - this.x;
                    if (Math.abs(delta) < 288 && Math.abs(delta) >= 0)
                        return true;
                }
                return false;
            };
            Man.prototype.tick = function () {
                switch (this.animNum) {
                    case 0:
                    case 1:
                        if (this.hasNoticedHero()) {
                            if (this.isWithinStrikingDistance()) {
                                this.animNum = this.game.rnd.integerInRange(2, this.animData.length == 3 ? 2 : 3);
                                this.frame = 0;
                            }
                            else {
                                if (this.animNum != 1) {
                                    this.animNum = 1;
                                    this.frame = 0;
                                }
                                else {
                                    if (this.facing == Barbarian.Facing.Left) {
                                        this.x -= Barbarian.TILE_SIZE;
                                    }
                                    else {
                                        this.x += Barbarian.TILE_SIZE;
                                    }
                                }
                            }
                        }
                        else {
                            this.animNum = 0;
                            this.frame = 0;
                        }
                        break;
                    case 2:
                    case 3:
                        if (this.isWithinStrikingDistance()) {
                            if (this.frame == 2) {
                                this.game.hero.fsm.transition('Die');
                            }
                        }
                        else {
                            this.animNum = 0;
                            this.frame = 0;
                        }
                }
                if (this.x < this.game.hero.x)
                    this.facing = Barbarian.Facing.Right;
                else
                    this.facing = Barbarian.Facing.Left;
                if (this.x < this.dataBlob.xMin)
                    this.x = this.dataBlob.xMin;
                if (this.x > this.dataBlob.xMax)
                    this.x = this.dataBlob.xMax;
                this.animate();
                this.render();
            };
            return Man;
        }(Enemies.Enemy));
        Enemies.Man = Man;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        var SmallArrow = (function (_super) {
            __extends(SmallArrow, _super);
            function SmallArrow(entity) {
                var _this = this;
                _super.call(this, entity.game, entity.x, entity.y - 28, 'POP', 9);
                this.velocity = entity.facing == Barbarian.Facing.Left ? -Barbarian.TILE_SIZE * 2 : Barbarian.TILE_SIZE * 2;
                this.scale.x = entity.facing == Barbarian.Facing.Left ? -1 : 1;
                this.x += this.velocity * 2;
                this.checkWorldBounds = true;
                this.outOfBoundsKill = true;
                this.flightAnim = this.animations.add('fly', [9], Barbarian.FRAMERATE, true, true);
                this.flightAnim.enableUpdate = true;
                this.flightAnim.onUpdate.add(function () { _this.x += _this.velocity; }, this);
                this.flightAnim.play();
            }
            return SmallArrow;
        }(Phaser.Sprite));
        Enemies.SmallArrow = SmallArrow;
        var Pop = (function (_super) {
            __extends(Pop, _super);
            function Pop(game, dataBlob, direction) {
                _super.call(this, game, dataBlob, direction);
                this.hasAlreadyPopped = false;
                this.createAnimations();
                this.idleAnim.play(Barbarian.FRAMERATE);
            }
            Object.defineProperty(Pop.prototype, "currentParts", {
                get: function () {
                    var animName = this.nllSprite.animations.currentAnim.name;
                    var animFrame = this.nllSprite.animations.currentFrame.index;
                    var animNum = 0;
                    if (animName == 'pop')
                        animNum = 1;
                    return this.animData[animNum].frames[animFrame].parts;
                },
                enumerable: true,
                configurable: true
            });
            Pop.prototype.createAnimations = function () {
                var _this = this;
                this.nllSprite = this.create(0, 0, 'POP', 0);
                this.idleAnim = this.nllSprite.animations.add('idle', [0], Barbarian.FRAMERATE, true, true);
                this.popAnim = this.nllSprite.animations.add('pop', [0, 0, 0, 0, 0, 0, 0, 0], Barbarian.FRAMERATE, false, true);
                this.popAnim.enableUpdate = true;
                this.popAnim.onUpdate.add(function () {
                    if (_this.nllSprite.animations.currentAnim.currentFrame.index == 3) {
                        var arrow = new SmallArrow(_this);
                        _this.game.world.add(arrow);
                        _this.hasAlreadyPopped = true;
                    }
                }, this);
                this.popAnim.onComplete.add(function () {
                    _this.hasAlreadyPopped = true;
                    _this.nllSprite.play('idle');
                }, this);
            };
            Pop.prototype.isWithinStrikingDistance = function () {
                if (this.game.hero.y + Barbarian.TILE_SIZE == this.y) {
                    var delta = this.x - this.game.hero.x;
                    if (delta >= 0 && delta <= Barbarian.TILE_SIZE * 15)
                        return true;
                }
                return false;
            };
            Pop.prototype.update = function () {
                if (this.isWithinStrikingDistance() && !this.hasAlreadyPopped) {
                    this.nllSprite.play('pop');
                }
                this.render();
            };
            return Pop;
        }(Enemies.Enemy));
        Enemies.Pop = Pop;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        var Rotate = (function (_super) {
            __extends(Rotate, _super);
            function Rotate() {
                _super.apply(this, arguments);
            }
            Rotate.prototype.getBodyBounds = function () {
                var bounds = new Phaser.Rectangle(0, 0, 0, 0);
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var part = _a[_i];
                    var partCast = part;
                    if (partCast.frame === 7 || partCast.frame === 6) {
                        var pbounds = part.getBounds();
                        bounds = new Phaser.Rectangle(pbounds.x, pbounds.y, pbounds.width, pbounds.height);
                    }
                }
                return bounds;
            };
            Rotate.prototype.tick = function () {
                var heroBounds = this.game.hero.getBodyBounds();
                var thisBounds = this.getBounds();
                if (Phaser.Rectangle.intersects(heroBounds, thisBounds)) {
                    this.game.hero.fsm.transition('FallDeath');
                }
                this.animate();
                this.render();
            };
            return Rotate;
        }(Enemies.Enemy));
        Enemies.Rotate = Rotate;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        var Scythe = (function (_super) {
            __extends(Scythe, _super);
            function Scythe(game, x, y, key, anim_data) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                _super.call(this, game, x, y, key, anim_data);
                var attack = this.animations.getAnimation("1");
                attack.loop = false;
                this.animations.play('0');
            }
            Scythe.prototype.update = function () {
                if ((this.animations.animNum == Scythe.ATTACK && this.animations.currentAnim.isFinished)) {
                    this.animations.play(Scythe.IDLE2);
                }
                else if (this.animations.animNum == Scythe.IDLE) {
                    if (this.game.hero.x - this.x < Scythe.TRIGGER_DISTANCE) {
                        this.animations.play(Scythe.ATTACK);
                    }
                }
                else {
                    if (this.animations.animNum == Scythe.ATTACK) {
                        var delta = this.game.hero.x - this.x;
                        if (delta > 0 && delta < Scythe.HIT_DISTANCE) {
                            if (this.animations.frameIndex == 1) {
                                this.game.hero.fsm.transition('TripFall', true);
                            }
                        }
                    }
                }
            };
            Scythe.TRIGGER_DISTANCE = 0x20 * Barbarian.SCALE;
            Scythe.HIT_DISTANCE = 0x10 * Barbarian.SCALE;
            Scythe.IDLE = 0;
            Scythe.ATTACK = 1;
            Scythe.IDLE2 = 2;
            return Scythe;
        }(Barbarian.GameEntity));
        Enemies.Scythe = Scythe;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        var Spikes = (function (_super) {
            __extends(Spikes, _super);
            function Spikes() {
                _super.apply(this, arguments);
            }
            Spikes.prototype.tick = function () {
                var data = this.game.level.currentRoom.id === 0x0A ? Spikes.spike_data[0] : Spikes.spike_data[1];
                if ((this.animNum == data['fall_anim'] && this.frame === data['last_frame']) || this.animNum == 3) {
                    this.animNum = 3;
                    this.frame = 0;
                }
                else if (this.animNum == 0) {
                    if (this.game.hero.x > data['trigger'].left && this.game.hero.x < data['trigger'].right) {
                        if (this.game.hero.y > data['trigger'].top && this.game.hero.y < data['trigger'].bottom) {
                            this.animNum = data['fall_anim'];
                            this.frame = 0;
                        }
                    }
                }
                else {
                    this.animate();
                    if (this.animNum == data['fall_anim']) {
                        this.y += data['fall_rate'][this.frame];
                        if (this.frame >= data['start_hit_frame']) {
                            if (this.game.hero.x > data['hit'].left && this.game.hero.x < data['hit'].right) {
                                if (this.game.hero.y > data['hit'].top && this.game.hero.y < data['hit'].bottom) {
                                    this.game.hero.fsm.transition('Die');
                                }
                            }
                        }
                    }
                }
                this.render();
            };
            Spikes.SPK_FALL_LEFT = 0x50 * Barbarian.SCALE;
            Spikes.SPK_FALL_RIGHT = 0x98 * Barbarian.SCALE;
            Spikes.SPK_FALL_TOP = 0x28 * Barbarian.SCALE;
            Spikes.SPK_FALL_BOTTOM = 0x50 * Barbarian.SCALE;
            Spikes.SPK_HIT_LEFT = 0x60 * Barbarian.SCALE;
            Spikes.SPK_HIT_RIGHT = 0x88 * Barbarian.SCALE;
            Spikes.FALL_RATE = 2 * Barbarian.TILE_SIZE;
            Spikes.FAST_FALL_RATE = 3 * Barbarian.TILE_SIZE;
            Spikes.spike_data = [
                {
                    trigger: { left: 0x50 * Barbarian.SCALE, right: 0x98 * Barbarian.SCALE, top: 0x28, bottom: 0x50 * Barbarian.SCALE },
                    hit: { left: 0x60 * Barbarian.SCALE, right: 0x88 * Barbarian.SCALE, top: 0x28, bottom: 0x50 * Barbarian.SCALE },
                    fall_anim: 1,
                    start_hit_frame: 2,
                    last_frame: 4,
                    fall_rate: [0, 0, Spikes.FALL_RATE, Spikes.FALL_RATE, Spikes.FALL_RATE]
                },
                {
                    trigger: { left: 0x70 * Barbarian.SCALE, right: 0xB8 * Barbarian.SCALE, top: 0x78, bottom: 0xA0 * Barbarian.SCALE },
                    hit: { left: 0x80 * Barbarian.SCALE, right: 0xA8 * Barbarian.SCALE, top: 0x78, bottom: 0xA0 * Barbarian.SCALE },
                    fall_anim: 2,
                    start_hit_frame: 7,
                    last_frame: 7,
                    fall_rate: [0, 0, Spikes.FALL_RATE, Spikes.FALL_RATE, Spikes.FAST_FALL_RATE, Spikes.FAST_FALL_RATE, Spikes.FAST_FALL_RATE, Spikes.FAST_FALL_RATE]
                }
            ];
            return Spikes;
        }(Enemies.Enemy));
        Enemies.Spikes = Spikes;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Enemies;
    (function (Enemies) {
        var Thr = (function (_super) {
            __extends(Thr, _super);
            function Thr(game, x, y, key, anim_data) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                _super.call(this, game, x, y, key, anim_data);
                var attack = this.animations.getAnimation("1");
                attack.loop = true;
                attack.play();
            }
            Thr.prototype.update = function () {
                if (this.animations.frameIndex >= 7 && this.animations.frameIndex <= 11) {
                    var i = this.animations.frameIndex - 7;
                    var xMin = Thr.KILL_X_MIN[i];
                    var xMax = Thr.KILL_X_MAX[i];
                    if (this.game.hero.x >= xMin && this.game.hero.x < xMax) {
                        this.game.hero.fsm.transition('Die');
                    }
                }
            };
            Thr.KILL_FRAMES = [7, 8, 9, 10, 11];
            Thr.KILL_X_MIN = [
                0x70 * Barbarian.SCALE,
                0x68 * Barbarian.SCALE,
                0x58 * Barbarian.SCALE,
                0x50 * Barbarian.SCALE,
                0x40 * Barbarian.SCALE,
            ];
            Thr.KILL_X_MAX = [
                0x80 * Barbarian.SCALE,
                0x78 * Barbarian.SCALE,
                0x68 * Barbarian.SCALE,
                0x60 * Barbarian.SCALE,
                0x50 * Barbarian.SCALE,
            ];
            return Thr;
        }(Barbarian.GameEntity));
        Enemies.Thr = Thr;
    })(Enemies = Barbarian.Enemies || (Barbarian.Enemies = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var StateMachine;
    (function (StateMachine_1) {
        StateMachine_1.WILDCARD = '*';
        var StateMachine = (function () {
            function StateMachine(hero) {
                this.states = [];
                this.validFromStates = [];
                this.currentState = null;
                this.pendingState = null;
                this.canTransitionFromSelf = [];
                this.hero = hero;
            }
            StateMachine.prototype.add = function (key, state, validFromStates, canTransitionFromSelf) {
                if (canTransitionFromSelf === void 0) { canTransitionFromSelf = false; }
                this.states[key] = state;
                this.validFromStates[key] = validFromStates;
                this.canTransitionFromSelf[key] = canTransitionFromSelf;
            };
            StateMachine.prototype.transition = function (newState, immediately) {
                if (immediately === void 0) { immediately = false; }
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                if (this.pendingState === 'Idle' && this.isValidFromPending(newState)) {
                    this.pendingState = newState;
                }
                else if (this.currentState != null && !this.isValidFrom(newState))
                    return;
                if (this.pendingState == null) {
                    this.pendingState = newState;
                    this.pendingStateArgs = [];
                    for (var i = 2; i < arguments.length; i++) {
                        this.pendingStateArgs.push(arguments[i]);
                    }
                }
                if (this.currentState == null || immediately == true)
                    this.update();
            };
            StateMachine.prototype.update = function () {
                if (this.pendingState) {
                    if (this.currentState)
                        this.currentState.onLeave();
                    this.currentState = this.states[this.pendingState];
                    this.currentStateName = this.pendingState;
                    this.pendingState = null;
                    this.currentState.onEnter(this.pendingStateArgs);
                }
                if (this.currentState)
                    this.currentState.onUpdate();
            };
            StateMachine.prototype.getCurrentState = function () {
                return this.currentState;
            };
            Object.defineProperty(StateMachine.prototype, "getCurrentStateName", {
                get: function () {
                    return this.currentStateName;
                },
                enumerable: true,
                configurable: true
            });
            StateMachine.prototype.isValidFrom = function (newState) {
                var isValid = false;
                if (newState != this.currentStateName || this.canTransitionFromSelf[newState]) {
                    for (var _i = 0, _a = this.validFromStates[newState]; _i < _a.length; _i++) {
                        var state = _a[_i];
                        if (state == this.currentStateName || state == StateMachine_1.WILDCARD)
                            isValid = true;
                    }
                }
                return isValid;
            };
            StateMachine.prototype.isValidFromPending = function (newState) {
                var isValid = false;
                if (newState != this.pendingState) {
                    for (var _i = 0, _a = this.validFromStates[newState] || this.canTransitionFromSelf[newState]; _i < _a.length; _i++) {
                        var state = _a[_i];
                        if (state == this.pendingState || state == StateMachine_1.WILDCARD)
                            isValid = true;
                    }
                }
                return isValid;
            };
            return StateMachine;
        }());
        StateMachine_1.StateMachine = StateMachine;
    })(StateMachine = Barbarian.StateMachine || (Barbarian.StateMachine = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Ghost = (function (_super) {
        __extends(Ghost, _super);
        function Ghost(entity) {
            var _this = this;
            _super.call(this, entity.game, entity.x, entity.y - Barbarian.TILE_SIZE, 'misc', 20);
            this.anchor.setTo(entity.facing == Barbarian.Facing.Left ? 0 : 1, 1);
            this.deathAnim = this.animations.add('rise', Ghost.FRAMES, Barbarian.FRAMERATE, false, true);
            this.deathAnim.enableUpdate = true;
            this.deathAnim.onUpdate.add(function () { _this.y -= Barbarian.TILE_SIZE; }, this);
            this.deathAnim.killOnComplete = true;
            this.deathAnim.play();
        }
        Ghost.FRAMES = [20, 21, 22, 21, 20, 23, 24, 25, 26, 27];
        return Ghost;
    }(Phaser.Sprite));
    Barbarian.Ghost = Ghost;
    var Spirit = (function (_super) {
        __extends(Spirit, _super);
        function Spirit(entity) {
            var dataBlob = {
                id: Barbarian.Enemies.EnemyKeys.misc,
                xOff: [entity.x, entity.x, entity.x, entity.x, entity.x],
                yOff: entity.y,
                xMax: 0,
                xMin: 0,
                flags: [0, 0, 0, 0, 0]
            };
            _super.call(this, entity.game, dataBlob, entity.direction);
        }
        Spirit.prototype.tick = function () {
            this.y -= Barbarian.TILE_SIZE;
            this.animate();
            this.render();
        };
        return Spirit;
    }(Barbarian.Enemies.Enemy));
    Barbarian.Spirit = Spirit;
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    (function (Animations) {
        Animations[Animations["Walk"] = 0] = "Walk";
        Animations[Animations["Run"] = 1] = "Run";
        Animations[Animations["ChangeDirection"] = 2] = "ChangeDirection";
        Animations[Animations["UpLadder"] = 4] = "UpLadder";
        Animations[Animations["DownLadder"] = 5] = "DownLadder";
        Animations[Animations["UpStairs"] = 7] = "UpStairs";
        Animations[Animations["DownStairs"] = 8] = "DownStairs";
        Animations[Animations["Jump"] = 9] = "Jump";
        Animations[Animations["SwitchWeapon"] = 10] = "SwitchWeapon";
        Animations[Animations["Idle1"] = 12] = "Idle1";
        Animations[Animations["Idle2"] = 13] = "Idle2";
        Animations[Animations["Attack1"] = 14] = "Attack1";
        Animations[Animations["Attack2"] = 15] = "Attack2";
        Animations[Animations["Attack3"] = 16] = "Attack3";
        Animations[Animations["Attack4"] = 17] = "Attack4";
        Animations[Animations["Attack5"] = 18] = "Attack5";
        Animations[Animations["Attack6"] = 19] = "Attack6";
        Animations[Animations["ShootArrow"] = 22] = "ShootArrow";
        Animations[Animations["WaitForArrow"] = 23] = "WaitForArrow";
        Animations[Animations["HitWall"] = 24] = "HitWall";
        Animations[Animations["Flee"] = 26] = "Flee";
        Animations[Animations["FallToGround"] = 28] = "FallToGround";
        Animations[Animations["FallToGroundFaceFirst"] = 31] = "FallToGroundFaceFirst";
        Animations[Animations["DropWeapon"] = 32] = "DropWeapon";
        Animations[Animations["HitGround"] = 34] = "HitGround";
        Animations[Animations["Falling"] = 36] = "Falling";
        Animations[Animations["TripFall"] = 37] = "TripFall";
        Animations[Animations["BackFlip"] = 38] = "BackFlip";
        Animations[Animations["FrontFlip"] = 39] = "FrontFlip";
        Animations[Animations["PickUp"] = 42] = "PickUp";
        Animations[Animations["Idle"] = 43] = "Idle";
        Animations[Animations["CarryOrb"] = 44] = "CarryOrb";
        Animations[Animations["ThrowOrb"] = 45] = "ThrowOrb";
    })(Barbarian.Animations || (Barbarian.Animations = {}));
    var Animations = Barbarian.Animations;
    (function (Weapon) {
        Weapon[Weapon["None"] = 1] = "None";
        Weapon[Weapon["Sword"] = 2] = "Sword";
        Weapon[Weapon["Shield"] = 3] = "Shield";
        Weapon[Weapon["Bow"] = 4] = "Bow";
        Weapon[Weapon["Orb"] = 5] = "Orb";
    })(Barbarian.Weapon || (Barbarian.Weapon = {}));
    var Weapon = Barbarian.Weapon;
    (function (Direction) {
        Direction[Direction["None"] = -1] = "None";
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Right"] = 1] = "Right";
        Direction[Direction["Up"] = 2] = "Up";
        Direction[Direction["Down"] = 3] = "Down";
    })(Barbarian.Direction || (Barbarian.Direction = {}));
    var Direction = Barbarian.Direction;
    (function (Facing) {
        Facing[Facing["Right"] = 0] = "Right";
        Facing[Facing["Left"] = 1] = "Left";
    })(Barbarian.Facing || (Barbarian.Facing = {}));
    var Facing = Barbarian.Facing;
    var Inventory = (function () {
        function Inventory() {
            this.availableWeapons = [];
            this.numArrows = 10;
            this.availableWeapons[Weapon.Bow] = true;
            this.availableWeapons[Weapon.Shield] = true;
            this.availableWeapons[Weapon.Orb] = false;
            this.availableWeapons[Weapon.Sword] = true;
            this.activeWeapon = Weapon.Bow;
        }
        Inventory.prototype.hasWeapon = function (weapon) {
            return this.availableWeapons[weapon];
        };
        Inventory.prototype.addItem = function (itemType) {
            switch (itemType) {
                case Barbarian.ItemType.Arrow:
                    this.numArrows++;
                    break;
                case Barbarian.ItemType.Bow:
                    this.availableWeapons[Weapon.Bow] = true;
                    break;
                case Barbarian.ItemType.Shield:
                    this.availableWeapons[Weapon.Shield] = true;
                    break;
                case Barbarian.ItemType.Sword:
                    this.availableWeapons[Weapon.Sword] = true;
                    break;
                case Barbarian.ItemType.Orb:
                    this.availableWeapons[Weapon.Orb] = true;
                    break;
            }
        };
        Inventory.prototype.canSwitchWeaponTo = function (newWeapon) {
            if (!this.availableWeapons[newWeapon] || this.activeWeapon === newWeapon)
                return false;
            return true;
        };
        Inventory.prototype.switchWeapon = function (newWeapon) {
            if (this.canSwitchWeaponTo(newWeapon))
                this.activeWeapon = newWeapon;
        };
        Inventory.prototype.dropWeapon = function () {
            this.availableWeapons[this.activeWeapon] = false;
            this.activeWeapon = Weapon.None;
        };
        return Inventory;
    }());
    Barbarian.Inventory = Inventory;
    var Hero = (function (_super) {
        __extends(Hero, _super);
        function Hero(game, tileX, tileY) {
            _super.call(this, game, 'hero');
            this.tilePos = new Phaser.Point();
            this.onDied = new Phaser.Signal();
            this.timeStep = 0;
            this.colorIndex = 0;
            this.orbTimeStep = 0;
            this.tilePos.setTo(tileX, tileY);
            this.x = tileX << Barbarian.TILE_SHIFT;
            this.y = tileY << Barbarian.TILE_SHIFT;
            this.animData = this.game.cache.getJSON('hero');
            this.inventory = new Inventory();
            this.direction = Direction.Right;
            this.facing = Facing.Right;
            this.tileMap = new Barbarian.TileMap(this);
            this.fsm = new Barbarian.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new Barbarian.HeroStates.Idle(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('Walk', new Barbarian.HeroStates.Walk(this), ['Idle', 'Run', 'Flee', 'TakeStairs']);
            this.fsm.add('Jump', new Barbarian.HeroStates.Jump(this), ['Idle', 'Flee', 'Walk']);
            this.fsm.add('Stop', new Barbarian.HeroStates.Stop(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('ChangeDirection', new Barbarian.HeroStates.ChangeDirection(this), ['Idle', 'Walk', 'Run', 'Flee']);
            this.fsm.add('HitWall', new Barbarian.HeroStates.HitWall(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('UseLadder', new Barbarian.HeroStates.UseLadder(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('TakeStairs', new Barbarian.HeroStates.TakeStairs(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('Run', new Barbarian.HeroStates.Run(this), ['Idle', 'Walk']);
            this.fsm.add('Attack', new Barbarian.HeroStates.Attack(this), ['Idle', 'Walk', 'Run', 'Flee']);
            this.fsm.add('TripFall', new Barbarian.HeroStates.TripFall(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('Fall', new Barbarian.HeroStates.Fall(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('FallDeath', new Barbarian.HeroStates.FallDeath(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('Die', new Barbarian.HeroStates.Die(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('FrontFlip', new Barbarian.HeroStates.FrontFlip(this), ['Run']);
            this.fsm.add('BackFlip', new Barbarian.HeroStates.BackFlip(this), ['Idle']);
            this.fsm.add('PickUp', new Barbarian.HeroStates.PickUp(this), ['Idle']);
            this.fsm.add('DropWeapon', new Barbarian.HeroStates.DropWeapon(this), ['Idle']);
            this.fsm.add('SwitchWeapon', new Barbarian.HeroStates.SwitchWeapon(this), ['Idle']);
            this.fsm.add('Flee', new Barbarian.HeroStates.Flee(this), [Barbarian.StateMachine.WILDCARD], true);
            this.fsm.add('CarryOrb', new Barbarian.HeroStates.CarryOrb(this), ['PickUp']);
            this.fsm.add('ThrowOrb', new Barbarian.HeroStates.ThrowOrb(this), ['CarryOrb']);
            this.fsm.add('WaitForArrow', new Barbarian.HeroStates.WaitForArrow(this), ['Attack']);
            this.fsm.transition('Idle');
            this.orb = game.make.sprite(0, 0, 'hero', 138);
            this.bitmapData = game.make.bitmapData(this.width, this.height);
            this.bitmapData.load(this.orb);
            this.bitmapData.update();
            var orb = this.getChildAt(138);
            orb.setTexture(this.bitmapData.texture);
            this.render();
        }
        Hero.prototype.reset = function (tileX, tileY) {
            this.tilePos.setTo(tileX, tileY);
            this.x = tileX << Barbarian.TILE_SHIFT;
            this.y = tileY << Barbarian.TILE_SHIFT;
            this.timeStep = 0;
            this.fsm.transition('Idle', true);
        };
        Hero.prototype.getTileMapPosition = function (adjustX, adjustY) {
            if (adjustX == null) {
                adjustX = 0;
            }
            if (adjustY == null) {
                adjustY = 0;
            }
            var tileX = -1;
            var tileY = -1;
            if (this.x >= Barbarian.TILE_SIZE && this.x <= 640) {
                tileX = this.facing == Facing.Right ? (this.x >> Barbarian.TILE_SHIFT) - 1 : (this.x >> Barbarian.TILE_SHIFT);
                tileX = tileX + (this.facing == Facing.Right ? adjustX : -adjustX);
            }
            if (this.y >= Barbarian.TILE_SIZE && this.y <= 320) {
                tileY = (this.y >> Barbarian.TILE_SHIFT) - 1;
                tileY = tileY + adjustY;
            }
            return new Phaser.Point(tileX, tileY);
        };
        Hero.prototype.setAnimation = function (id) {
            this.animNum = id;
            this.frame = 0;
            this.render();
        };
        Object.defineProperty(Hero.prototype, "isDead", {
            get: function () {
                if (this.fsm.getCurrentStateName == 'Die')
                    return true;
                else
                    return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hero.prototype, "currentParts", {
            get: function () {
                var _this = this;
                var parts = this.animData[this.animNum].frames[this.frame].parts;
                return parts.filter(function (part) { return (part.flags < 5 || (part.flags >> 4) == _this.inventory.activeWeapon) && part.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hero.prototype, "isAttackingWithSword", {
            get: function () {
                return this.fsm.getCurrentStateName === 'Attack'
                    && this.inventory.activeWeapon === Weapon.Sword
                    && this.frame != 0;
            },
            enumerable: true,
            configurable: true
        });
        Hero.prototype.getSwordBounds = function () {
            var sword_indices = [133, 134, 135, 136, 137];
            for (var _i = 0, _a = this.children.filter(function (child) { return child.visible; }); _i < _a.length; _i++) {
                var spr = _a[_i];
                if (sword_indices.indexOf(spr.frame) != -1) {
                    return new Phaser.Rectangle().copyFrom(spr.getBounds());
                }
            }
            return new Phaser.Rectangle();
        };
        Hero.prototype.checkMovement = function () {
            var input = this.game.inputManager;
            switch (this.tileMap.getTile()) {
                case '3':
                    this.fsm.transition('HitWall', true);
                    return false;
                case '/':
                    if (this.direction != Direction.Down) {
                        this.fsm.transition('TripFall', true);
                        return false;
                    }
                    break;
                case '5':
                case '!':
                    if (this.direction == Direction.Down) {
                        this.fsm.transition('FallDeath', true);
                        return false;
                    }
                    break;
                case '8':
                    this.fsm.transition('ThrowOrb');
                    break;
            }
            if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsUp)) {
                this.direction = Direction.Up;
                this.fsm.transition('TakeStairs');
                return false;
            }
            else if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsDown)) {
                this.direction = Direction.Down;
                this.fsm.transition('TakeStairs');
                return false;
            }
            else if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsDownOptional)) {
                if (input.buttonsState & Barbarian.Input.Buttons.Down) {
                    this.direction = Direction.Down;
                    this.fsm.transition('TakeStairs');
                    return false;
                }
            }
            else if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsUpOptional)) {
                if (input.buttonsState & Barbarian.Input.Buttons.Up) {
                    this.direction = Direction.Up;
                    this.fsm.transition('TakeStairs');
                    return false;
                }
            }
            return true;
        };
        Hero.prototype.animate = function () {
            var numFrames = this.animData[this.animNum].frames.length;
            this.frame++;
            if (this.frame >= numFrames)
                this.frame = 0;
        };
        Hero.prototype.forEachPixel = function (pixel) {
            if (pixel.color.toString(16) == 'ffaa00aa') {
                return Phaser.Color.fromRGBA(Barbarian.EGA_COLORS[this.colorIndex]);
            }
            else {
                return false;
            }
        };
        Hero.prototype.checkWeaponSwitch = function (input) {
            var newWeapon = this.inventory.activeWeapon;
            if (input.buttonsState & Barbarian.Input.Buttons.Sword) {
                newWeapon = Weapon.Sword;
            }
            else if (input.buttonsState & Barbarian.Input.Buttons.Bow) {
                newWeapon = Weapon.Bow;
            }
            else if (input.buttonsState & Barbarian.Input.Buttons.Shield) {
                newWeapon = Weapon.Shield;
            }
            if (this.inventory.canSwitchWeaponTo(newWeapon)) {
                this.fsm.transition('SwitchWeapon', true, newWeapon);
            }
        };
        Hero.prototype.dropWeapon = function () {
            var item;
            switch (this.inventory.activeWeapon) {
                case Weapon.Bow:
                    item = Barbarian.ItemType.Bow;
                    break;
                case Weapon.Shield:
                    item = Barbarian.ItemType.Shield;
                    break;
                case Weapon.Sword:
                    item = Barbarian.ItemType.Sword;
                    break;
                default:
                    item = Barbarian.ItemType.None;
                    break;
            }
            if (item != Barbarian.ItemType.None) {
                this.inventory.dropWeapon();
                this.game.level.addItem(item, this.x, this.y);
            }
        };
        Hero.prototype.clearInput = function () {
            var input = this.game.inputManager;
            input.clearInput();
        };
        Hero.prototype.update = function () {
            var input = this.game.inputManager;
            this.checkWeaponSwitch(input);
            if (input.buttonsState & Barbarian.Input.Buttons.Defend) {
                this.fsm.transition('BackFlip');
            }
            if (input.buttonsState & Barbarian.Input.Buttons.Stop) {
                this.fsm.transition('Stop');
            }
            if (input.buttonsState & Barbarian.Input.Buttons.Flee) {
                this.fsm.transition('Flee');
            }
            if (input.buttonsState & Barbarian.Input.Buttons.Run) {
                this.fsm.transition('Run');
            }
            if (input.buttonsState & Barbarian.Input.Buttons.Attack) {
                this.fsm.transition('Attack');
            }
            if (input.buttonsState & Barbarian.Input.Buttons.Jump) {
                if (this.fsm.getCurrentStateName == 'Run')
                    this.fsm.transition('FrontFlip');
                else
                    this.fsm.transition('Jump');
            }
            if (this.facing == Facing.Right) {
                if (input.buttonsState & Barbarian.Input.Buttons.Right) {
                    if (input.buttonsState & Barbarian.Input.Buttons.Run) {
                        this.fsm.transition('Run');
                    }
                    else {
                        this.fsm.transition('Walk');
                    }
                }
                else if (input.buttonsState & Barbarian.Input.Buttons.Left)
                    this.fsm.transition('ChangeDirection');
            }
            else if (this.facing == Facing.Left) {
                if (input.buttonsState & Barbarian.Input.Buttons.Left) {
                    if (input.buttonsState & Barbarian.Input.Buttons.Run) {
                        this.fsm.transition('Run');
                    }
                    else {
                        this.fsm.transition('Walk');
                    }
                }
                else if (input.buttonsState & Barbarian.Input.Buttons.Right)
                    this.fsm.transition('ChangeDirection');
            }
            if (input.buttonsState & Barbarian.Input.Buttons.Drop) {
                this.fsm.transition('DropWeapon');
            }
            if (input.buttonsState & Barbarian.Input.Buttons.Get) {
                this.fsm.transition('PickUp');
            }
            else if (input.buttonsState & Barbarian.Input.Buttons.Down) {
                if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderTop)) {
                    this.fsm.transition('UseLadder');
                }
            }
            else if (input.buttonsState & Barbarian.Input.Buttons.Up) {
                if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderBottom)) {
                    this.fsm.transition('UseLadder');
                }
            }
            if (!input.buttonsState) {
            }
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Barbarian.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Barbarian.FIXED_TIMESTEP;
                this.animate();
                this.fsm.update();
                this.bitmapData.load(this.orb);
                this.bitmapData.update();
                this.bitmapData.processPixelRGB(this.forEachPixel, this);
                this.colorIndex++;
                if (this.colorIndex > 15) {
                    this.colorIndex = 0;
                }
            }
            this.render();
        };
        Hero.prototype.getBodyBounds = function () {
            var bounds;
            if (this.facing == Facing.Right)
                bounds = new Phaser.Rectangle(this.x - 32, this.y - 80, 32, 80);
            else
                bounds = new Phaser.Rectangle(this.x, this.y - 80, 32, 80);
            return bounds;
        };
        return Hero;
    }(Barbarian.EntityOld));
    Barbarian.Hero = Hero;
})(Barbarian || (Barbarian = {}));
var FSM = Barbarian.StateMachine;
var Barbarian;
(function (Barbarian) {
    var HeroStates;
    (function (HeroStates) {
        var HeroBaseState = (function () {
            function HeroBaseState(hero) {
                this.hero = hero;
            }
            HeroBaseState.prototype.onEnter = function () { };
            HeroBaseState.prototype.onUpdate = function () { };
            HeroBaseState.prototype.onLeave = function () { };
            return HeroBaseState;
        }());
        HeroStates.HeroBaseState = HeroBaseState;
        var Idle = (function (_super) {
            __extends(Idle, _super);
            function Idle() {
                _super.apply(this, arguments);
                this.idleAnims = [
                    Barbarian.Animations.Idle,
                    Barbarian.Animations.Idle,
                    Barbarian.Animations.Idle,
                    Barbarian.Animations.Idle1,
                    Barbarian.Animations.Idle1,
                    Barbarian.Animations.Idle2,
                    Barbarian.Animations.Idle];
            }
            Idle.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.Idle1);
                this.hasLooped = false;
            };
            Idle.prototype.onUpdate = function () {
                if (this.hero.frame == 0 && this.hasLooped == true) {
                    var newAnim = this.hero.game.rnd.weightedPick(this.idleAnims);
                    this.hero.setAnimation(newAnim);
                    this.hasLooped = false;
                }
                else {
                    this.hasLooped = true;
                }
            };
            return Idle;
        }(HeroBaseState));
        HeroStates.Idle = Idle;
        var Stop = (function (_super) {
            __extends(Stop, _super);
            function Stop() {
                _super.apply(this, arguments);
            }
            Stop.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.Idle);
                this.hero.fsm.transition('Idle', true);
            };
            return Stop;
        }(HeroBaseState));
        HeroStates.Stop = Stop;
        var Walk = (function (_super) {
            __extends(Walk, _super);
            function Walk() {
                _super.apply(this, arguments);
            }
            Walk.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.Walk);
            };
            Walk.prototype.onUpdate = function () {
                this.hero.moveRelative(1, 0);
                this.hero.checkMovement();
            };
            return Walk;
        }(HeroBaseState));
        HeroStates.Walk = Walk;
        var CarryOrb = (function (_super) {
            __extends(CarryOrb, _super);
            function CarryOrb() {
                _super.apply(this, arguments);
            }
            CarryOrb.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.CarryOrb);
                this.hero.inventory.switchWeapon(Barbarian.Weapon.Orb);
                this.hero.facing = Barbarian.Facing.Left;
            };
            CarryOrb.prototype.onUpdate = function () {
                this.hero.moveRelative(1, 0);
                this.hero.checkMovement();
            };
            return CarryOrb;
        }(Walk));
        HeroStates.CarryOrb = CarryOrb;
        var ThrowOrb = (function (_super) {
            __extends(ThrowOrb, _super);
            function ThrowOrb() {
                _super.apply(this, arguments);
            }
            ThrowOrb.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.ThrowOrb);
            };
            ThrowOrb.prototype.onUpdate = function () {
                if (this.hero.frame == this.hero.animData[this.hero.animNum].frames.length) {
                    this.hero.frame = 0;
                }
            };
            return ThrowOrb;
        }(HeroBaseState));
        HeroStates.ThrowOrb = ThrowOrb;
        var Run = (function (_super) {
            __extends(Run, _super);
            function Run() {
                _super.apply(this, arguments);
            }
            Run.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.Run);
            };
            Run.prototype.onUpdate = function () {
                this.hero.moveRelative(1, 0);
                if (this.hero.checkMovement()) {
                    this.hero.moveRelative(1, 0);
                    this.hero.checkMovement();
                }
            };
            return Run;
        }(HeroBaseState));
        HeroStates.Run = Run;
        var ChangeDirection = (function (_super) {
            __extends(ChangeDirection, _super);
            function ChangeDirection() {
                _super.apply(this, arguments);
            }
            ChangeDirection.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.ChangeDirection);
                this.hero.clearInput();
            };
            ChangeDirection.prototype.onUpdate = function () {
                var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
                this.hero.moveRelative(movement.x / Barbarian.TILE_SIZE, movement.y / Barbarian.TILE_SIZE);
                if (this.hero.frame == 4) {
                    this.hero.fsm.transition('Idle', true);
                }
            };
            ChangeDirection.prototype.onLeave = function () {
                this.hero.moveRelative(-3, 0);
                if (this.hero.facing == Barbarian.Facing.Left) {
                    this.hero.direction = Barbarian.Direction.Right;
                    this.hero.facing = Barbarian.Facing.Right;
                }
                else {
                    this.hero.direction = Barbarian.Direction.Right;
                    this.hero.facing = Barbarian.Facing.Left;
                }
            };
            return ChangeDirection;
        }(HeroBaseState));
        HeroStates.ChangeDirection = ChangeDirection;
        var HitWall = (function (_super) {
            __extends(HitWall, _super);
            function HitWall() {
                _super.apply(this, arguments);
            }
            HitWall.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.HitWall);
                this.hero.moveRelative(-1, 0);
            };
            HitWall.prototype.onUpdate = function () {
                var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
                this.hero.moveRelative(movement.x / Barbarian.TILE_SIZE, movement.y / Barbarian.TILE_SIZE);
                if (this.hero.frame == 8) {
                    this.hero.fsm.transition('Idle');
                }
            };
            return HitWall;
        }(HeroBaseState));
        HeroStates.HitWall = HitWall;
        var Jump = (function (_super) {
            __extends(Jump, _super);
            function Jump() {
                _super.apply(this, arguments);
            }
            Jump.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.Jump);
            };
            Jump.prototype.onUpdate = function () {
                var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
                this.hero.moveRelative(movement.x / Barbarian.TILE_SIZE, movement.y / Barbarian.TILE_SIZE);
                if (this.hero.frame == 10) {
                    this.hero.fsm.transition('Idle');
                }
                this.hero.checkMovement();
            };
            Jump.prototype.onLeave = function () {
            };
            return Jump;
        }(HeroBaseState));
        HeroStates.Jump = Jump;
        var FrontFlip = (function (_super) {
            __extends(FrontFlip, _super);
            function FrontFlip() {
                _super.apply(this, arguments);
            }
            FrontFlip.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.FrontFlip);
            };
            FrontFlip.prototype.onUpdate = function () {
                var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
                this.hero.moveRelative(movement.x / Barbarian.TILE_SIZE, movement.y / Barbarian.TILE_SIZE);
                if (this.hero.frame == 10) {
                    this.hero.fsm.transition('Idle');
                }
            };
            return FrontFlip;
        }(HeroBaseState));
        HeroStates.FrontFlip = FrontFlip;
        var BackFlip = (function (_super) {
            __extends(BackFlip, _super);
            function BackFlip() {
                _super.apply(this, arguments);
            }
            BackFlip.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.BackFlip);
            };
            BackFlip.prototype.onUpdate = function () {
                var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
                this.hero.moveRelative(movement.x / Barbarian.TILE_SIZE, movement.y / Barbarian.TILE_SIZE);
                if (this.hero.frame == 10) {
                    this.hero.fsm.transition('Idle');
                }
            };
            return BackFlip;
        }(HeroBaseState));
        HeroStates.BackFlip = BackFlip;
        var TakeStairs = (function (_super) {
            __extends(TakeStairs, _super);
            function TakeStairs() {
                _super.apply(this, arguments);
            }
            TakeStairs.prototype.onEnter = function () {
                this.hero.clearInput();
                if (this.hero.direction == Barbarian.Direction.Up) {
                    this.hero.setAnimation(Barbarian.Animations.UpStairs);
                }
                else {
                    this.hero.setAnimation(Barbarian.Animations.DownStairs);
                }
            };
            TakeStairs.prototype.onUpdate = function () {
                if (this.hero.frame % 2 == 0) {
                    this.hero.moveRelative(1, 0);
                }
                else {
                    this.hero.moveRelative(1, 1);
                }
                if (this.hero.direction == Barbarian.Direction.Up && this.hero.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsTop)) {
                    this.hero.fsm.transition('Walk');
                }
                else if (this.hero.direction == Barbarian.Direction.Down && this.hero.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsBottom)) {
                    this.hero.fsm.transition('Walk');
                }
            };
            TakeStairs.prototype.onLeave = function () {
                if (this.hero.direction == Barbarian.Direction.Up) {
                    this.hero.moveRelative(1, 1);
                }
                else if (this.hero.direction == Barbarian.Direction.Down) {
                    this.hero.moveRelative(1, 0);
                }
                if (this.hero.facing == Barbarian.Facing.Right)
                    this.hero.direction = Barbarian.Direction.Right;
                else
                    this.hero.direction = Barbarian.Direction.Left;
            };
            return TakeStairs;
        }(HeroBaseState));
        HeroStates.TakeStairs = TakeStairs;
        var UseLadder = (function (_super) {
            __extends(UseLadder, _super);
            function UseLadder() {
                _super.apply(this, arguments);
                this.downMovementFrames = [0, 1, 4, 5];
                this.upMovementFrames = [2, 3, 6, 7];
            }
            UseLadder.prototype.onEnter = function () {
                if (this.hero.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderTop)) {
                    this.hero.setAnimation(Barbarian.Animations.DownLadder);
                    this.hero.direction = Barbarian.Direction.Down;
                }
                else if (this.hero.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderBottom)) {
                    this.hero.setAnimation(Barbarian.Animations.UpLadder);
                    this.hero.direction = Barbarian.Direction.Up;
                }
                else {
                    this.hero.fsm.transition('Idle');
                    return;
                }
                if (this.hero.facing == Barbarian.Facing.Left)
                    this.hero.moveRelative(-1, 0);
                this.hero.facing = Barbarian.Facing.Right;
                this.hero.tileMap.positionOnLadder();
            };
            UseLadder.prototype.onUpdate = function () {
                if ((this.hero.direction == Barbarian.Direction.Down && this.downMovementFrames.indexOf(this.hero.frame) != -1) ||
                    (this.hero.direction == Barbarian.Direction.Up && this.upMovementFrames.indexOf(this.hero.frame) != -1)) {
                    this.hero.moveRelative(0, 0.5);
                }
                if ((this.hero.direction == Barbarian.Direction.Down && this.hero.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderBottom)) ||
                    (this.hero.direction == Barbarian.Direction.Up && this.hero.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderTop))) {
                    this.hero.fsm.transition('Idle');
                    return;
                }
            };
            UseLadder.prototype.onLeave = function () {
                if (this.hero.direction == Barbarian.Direction.Up) {
                    this.hero.moveRelative(0, 0.5);
                }
                this.hero.direction = Barbarian.Direction.Right;
            };
            return UseLadder;
        }(HeroBaseState));
        HeroStates.UseLadder = UseLadder;
        var Attack = (function (_super) {
            __extends(Attack, _super);
            function Attack() {
                _super.apply(this, arguments);
            }
            Attack.prototype.onEnter = function () {
                if (this.hero.inventory.activeWeapon === Barbarian.Weapon.Bow && this.hero.inventory.numArrows) {
                    this.hero.setAnimation(Barbarian.Animations.ShootArrow);
                }
                else
                    this.hero.setAnimation(this.hero.game.rnd.integerInRange(Barbarian.Animations.Attack1, Barbarian.Animations.Attack6));
                this.animDone = false;
                this.arrow = null;
                this.waitForArrow = false;
            };
            Attack.prototype.onUpdate = function () {
                if (this.animDone && !this.waitForArrow) {
                    if (this.hero.animNum == Barbarian.Animations.ShootArrow) {
                    }
                    else {
                        this.hero.fsm.transition('Idle');
                    }
                }
                else if (this.hero.frame == this.hero.animData[this.hero.animNum].frames.length - 1) {
                    this.animDone = true;
                    if (this.hero.animNum == Barbarian.Animations.ShootArrow) {
                        var arrowData = this.hero.animData[Barbarian.Animations.WaitForArrow].frames[0].parts.find(function (p) { return p.index == -1; });
                        var x = this.hero.facing === Barbarian.Facing.Left ? arrowData.rx : arrowData.x;
                        var y = this.hero.facing === Barbarian.Facing.Left ? arrowData.ry : arrowData.y;
                        this.arrow = new Barbarian.Arrow(this.hero.game, this.hero.x + x, this.hero.y + y, this.hero.facing);
                        this.hero.game.world.add(this.arrow);
                        this.hero.inventory.numArrows--;
                        this.hero.fsm.transition('WaitForArrow', false, this.arrow);
                    }
                }
                if (this.waitForArrow) {
                    if (!this.arrow || !this.arrow.alive) {
                        this.hero.fsm.transition('Idle');
                    }
                }
            };
            return Attack;
        }(HeroBaseState));
        HeroStates.Attack = Attack;
        var WaitForArrow = (function (_super) {
            __extends(WaitForArrow, _super);
            function WaitForArrow() {
                _super.apply(this, arguments);
            }
            WaitForArrow.prototype.onEnter = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                this.arrow = args[0][0];
                this.hero.setAnimation(Barbarian.Animations.WaitForArrow);
            };
            WaitForArrow.prototype.onUpdate = function () {
                if (!this.arrow || !this.arrow.alive) {
                    this.hero.fsm.transition('Idle');
                }
            };
            return WaitForArrow;
        }(HeroBaseState));
        HeroStates.WaitForArrow = WaitForArrow;
        var PickUp = (function (_super) {
            __extends(PickUp, _super);
            function PickUp() {
                _super.apply(this, arguments);
                this.animDone = false;
            }
            PickUp.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.PickUp);
                this.animDone = false;
            };
            PickUp.prototype.onUpdate = function () {
                if (this.hero.frame == 0 && this.animDone) {
                    this.hero.fsm.transition('Idle');
                }
                else {
                    this.animDone = true;
                }
                if (this.hero.frame == 3) {
                    var itemType = this.hero.game.level.pickUpItem(this.hero);
                    this.hero.inventory.addItem(itemType);
                    if (itemType == Barbarian.ItemType.Orb) {
                        this.hero.fsm.transition('CarryOrb');
                    }
                }
            };
            return PickUp;
        }(HeroBaseState));
        HeroStates.PickUp = PickUp;
        var DropWeapon = (function (_super) {
            __extends(DropWeapon, _super);
            function DropWeapon() {
                _super.apply(this, arguments);
                this.animDone = false;
            }
            DropWeapon.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.DropWeapon);
                this.animDone = false;
            };
            DropWeapon.prototype.onUpdate = function () {
                if (this.hero.frame == 0 && this.animDone) {
                    this.hero.fsm.transition('Idle');
                }
                else {
                    this.animDone = true;
                }
                if (this.hero.frame == 2) {
                    this.hero.dropWeapon();
                }
            };
            return DropWeapon;
        }(HeroBaseState));
        HeroStates.DropWeapon = DropWeapon;
        var SwitchWeapon = (function (_super) {
            __extends(SwitchWeapon, _super);
            function SwitchWeapon() {
                _super.apply(this, arguments);
            }
            SwitchWeapon.prototype.onEnter = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                console.log('SwitchWeapon onEnter');
                var newWeapon = args[0][0];
                this.hero.inventory.switchWeapon(newWeapon);
                this.hero.setAnimation(Barbarian.Animations.SwitchWeapon);
            };
            SwitchWeapon.prototype.onUpdate = function () {
                if (this.hero.frame == this.hero.animData[this.hero.animNum].frames.length - 1) {
                    this.hero.fsm.transition('Idle');
                }
            };
            return SwitchWeapon;
        }(HeroBaseState));
        HeroStates.SwitchWeapon = SwitchWeapon;
        var TripFall = (function (_super) {
            __extends(TripFall, _super);
            function TripFall() {
                _super.apply(this, arguments);
            }
            TripFall.prototype.onEnter = function () {
                this.hero.clearInput();
                this.hero.setAnimation(Barbarian.Animations.TripFall);
                this.animDone = false;
                this.hero.direction = Barbarian.Direction.Down;
                this.hero.moveRelative(-1, 0);
            };
            TripFall.prototype.onUpdate = function () {
                var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
                this.hero.moveRelative(movement.x / Barbarian.TILE_SIZE, movement.y / Barbarian.TILE_SIZE);
                if (this.hero.frame == 4) {
                    this.animDone = true;
                }
                if (!this.hero.checkMovement())
                    return;
                if (this.animDone) {
                    this.hero.fsm.transition('Fall');
                }
            };
            TripFall.prototype.onLeave = function () {
            };
            return TripFall;
        }(HeroBaseState));
        HeroStates.TripFall = TripFall;
        var Fall = (function (_super) {
            __extends(Fall, _super);
            function Fall() {
                _super.apply(this, arguments);
            }
            Fall.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.Falling);
                this.hero.direction = Barbarian.Direction.Down;
                if (this.hero.checkMovement()) {
                    this.hero.moveRelative(0, 1);
                    this.hero.checkMovement();
                }
            };
            Fall.prototype.onUpdate = function () {
                this.hero.moveRelative(0, 1);
                this.hero.checkMovement();
            };
            Fall.prototype.onLeave = function () {
                this.hero.moveRelative(0, -1);
                this.hero.direction = this.hero.facing ? Barbarian.Direction.Left : Barbarian.Direction.Right;
            };
            return Fall;
        }(HeroBaseState));
        HeroStates.Fall = Fall;
        var FallDeath = (function (_super) {
            __extends(FallDeath, _super);
            function FallDeath() {
                _super.apply(this, arguments);
            }
            FallDeath.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.HitGround);
                this.hero.direction = Barbarian.Direction.Down;
                this.animDone = false;
                this.deathDispatched = false;
                if (this.hero.checkMovement()) {
                    this.hero.moveRelative(0, 1);
                }
            };
            FallDeath.prototype.onUpdate = function () {
                if (this.hero.frame == 0 && this.animDone && !this.deathDispatched) {
                    this.hero.frame = 3;
                    this.hero.onDied.dispatch();
                    this.deathDispatched = true;
                }
                else if (this.animDone && this.deathDispatched) {
                    this.hero.frame = 3;
                }
                else {
                    this.animDone = true;
                }
            };
            FallDeath.prototype.onLeave = function () {
                this.hero.direction = this.hero.facing ? Barbarian.Direction.Left : Barbarian.Direction.Right;
            };
            return FallDeath;
        }(HeroBaseState));
        HeroStates.FallDeath = FallDeath;
        var Die = (function (_super) {
            __extends(Die, _super);
            function Die() {
                _super.apply(this, arguments);
                this.deathAnims = [Barbarian.Animations.FallToGround, Barbarian.Animations.FallToGroundFaceFirst];
            }
            Die.prototype.onEnter = function () {
                var anim = this.hero.game.rnd.pick(this.deathAnims);
                this.hero.setAnimation(anim);
                this.animDone = false;
                this.deathDispatched = false;
            };
            Die.prototype.onUpdate = function () {
                if (this.animDone && this.deathDispatched) {
                    this.hero.frame = this.hero.animData[this.hero.animNum].frames.length - 1;
                    return;
                }
                if (this.hero.frame == 0 && this.animDone && !this.deathDispatched) {
                    this.hero.frame = this.hero.animData[this.hero.animNum].frames.length - 1;
                    this.hero.onDied.dispatch();
                    this.deathDispatched = true;
                }
                else {
                    this.animDone = true;
                }
            };
            Die.prototype.onLeave = function () {
                this.hero.direction = this.hero.facing ? Barbarian.Direction.Left : Barbarian.Direction.Right;
            };
            return Die;
        }(HeroBaseState));
        HeroStates.Die = Die;
        var Flee = (function (_super) {
            __extends(Flee, _super);
            function Flee() {
                _super.apply(this, arguments);
            }
            Flee.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.Flee);
                if (this.hero.facing == Barbarian.Facing.Left) {
                    this.hero.facing = Barbarian.Facing.Right;
                    this.hero.direction = Barbarian.Direction.Right;
                }
                else {
                    this.hero.facing = Barbarian.Facing.Left;
                    this.hero.direction = Barbarian.Direction.Left;
                }
                this.hero.dropWeapon();
            };
            Flee.prototype.onUpdate = function () {
                this.hero.moveRelative(1, 0);
                if (this.hero.checkMovement()) {
                    this.hero.moveRelative(1, 0);
                    this.hero.checkMovement();
                }
            };
            return Flee;
        }(HeroBaseState));
        HeroStates.Flee = Flee;
    })(HeroStates = Barbarian.HeroStates || (Barbarian.HeroStates = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Input;
    (function (Input) {
        (function (Buttons) {
            Buttons[Buttons["Up"] = 1] = "Up";
            Buttons[Buttons["Down"] = 2] = "Down";
            Buttons[Buttons["Right"] = 4] = "Right";
            Buttons[Buttons["Left"] = 8] = "Left";
            Buttons[Buttons["Pickup"] = 16] = "Pickup";
            Buttons[Buttons["Drop"] = 32] = "Drop";
            Buttons[Buttons["Flee"] = 64] = "Flee";
            Buttons[Buttons["Attack"] = 128] = "Attack";
            Buttons[Buttons["Jump"] = 256] = "Jump";
            Buttons[Buttons["Stop"] = 512] = "Stop";
            Buttons[Buttons["Get"] = 1024] = "Get";
            Buttons[Buttons["Run"] = 2048] = "Run";
            Buttons[Buttons["Defend"] = 4096] = "Defend";
            Buttons[Buttons["Sword"] = 32768] = "Sword";
            Buttons[Buttons["Bow"] = 8192] = "Bow";
            Buttons[Buttons["Shield"] = 16384] = "Shield";
        })(Input.Buttons || (Input.Buttons = {}));
        var Buttons = Input.Buttons;
        (function (Icons) {
            Icons[Icons["None"] = 0] = "None";
            Icons[Icons["Left"] = 8] = "Left";
            Icons[Icons["Up"] = 1] = "Up";
            Icons[Icons["Down"] = 2] = "Down";
            Icons[Icons["Right"] = 4] = "Right";
            Icons[Icons["Stop"] = 0] = "Stop";
            Icons[Icons["Jump"] = 32] = "Jump";
            Icons[Icons["Run"] = 64] = "Run";
            Icons[Icons["Attack"] = 16] = "Attack";
            Icons[Icons["Defend"] = 128] = "Defend";
            Icons[Icons["Flee"] = 256] = "Flee";
            Icons[Icons["Get"] = 512] = "Get";
            Icons[Icons["Use"] = 1024] = "Use";
            Icons[Icons["Drop"] = 2048] = "Drop";
            Icons[Icons["Sword"] = 4096] = "Sword";
            Icons[Icons["Bow"] = 8192] = "Bow";
            Icons[Icons["Shield"] = 16384] = "Shield";
        })(Input.Icons || (Input.Icons = {}));
        var Icons = Input.Icons;
        (function (Icon) {
            Icon[Icon["None"] = 0] = "None";
            Icon[Icon["Left"] = 1] = "Left";
            Icon[Icon["Up"] = 2] = "Up";
            Icon[Icon["Down"] = 3] = "Down";
            Icon[Icon["Right"] = 4] = "Right";
            Icon[Icon["Stop"] = 5] = "Stop";
            Icon[Icon["Jump"] = 6] = "Jump";
            Icon[Icon["Run"] = 7] = "Run";
            Icon[Icon["Attack"] = 8] = "Attack";
            Icon[Icon["Defend"] = 9] = "Defend";
            Icon[Icon["Flee"] = 10] = "Flee";
            Icon[Icon["Pickup"] = 11] = "Pickup";
            Icon[Icon["Use"] = 12] = "Use";
            Icon[Icon["Drop"] = 13] = "Drop";
            Icon[Icon["Sword"] = 14] = "Sword";
            Icon[Icon["Bow"] = 15] = "Bow";
            Icon[Icon["Shield"] = 16] = "Shield";
        })(Input.Icon || (Input.Icon = {}));
        var Icon = Input.Icon;
        Input.ICON_TO_BUTTONS = [
            0,
            Buttons.Left,
            Buttons.Up,
            Buttons.Down,
            Buttons.Right,
            Buttons.Stop,
            Buttons.Jump,
            Buttons.Run,
            Buttons.Attack,
            Buttons.Defend,
            Buttons.Flee,
            Buttons.Pickup,
            Buttons.Stop,
            Buttons.Drop,
            Buttons.Sword,
            Buttons.Bow,
            Buttons.Shield,
        ];
        var ControlCodes = (function () {
            function ControlCodes() {
            }
            ControlCodes.A = 0;
            ControlCodes.B = 1;
            ControlCodes.UP = 2;
            ControlCodes.DOWN = 3;
            ControlCodes.LEFT = 4;
            ControlCodes.RIGHT = 5;
            ControlCodes.F1 = 6;
            ControlCodes.F2 = 7;
            ControlCodes.F3 = 8;
            ControlCodes.F4 = 9;
            ControlCodes.F5 = 10;
            ControlCodes.F6 = 11;
            ControlCodes.F7 = 12;
            ControlCodes.F8 = 13;
            ControlCodes.F9 = 14;
            ControlCodes.F10 = 15;
            return ControlCodes;
        }());
        Input.ControlCodes = ControlCodes;
        var IconsState = (function () {
            function IconsState(state) {
                if (state === void 0) { state = 0; }
                this.lastIconSelected = Icon.None;
                this.state = 0;
                this.lastIconSelected = Icon.None;
                this.state = state;
            }
            IconsState.GetState = function (menu) {
                var iconsState = new IconsState();
                iconsState.state = menu.state.state;
                return iconsState;
            };
            IconsState.prototype.toString = function () {
                return this.state.toString();
            };
            IconsState.prototype.reset = function () {
                this.state &= (Buttons.Left | Buttons.Right | Buttons.Up | Buttons.Down | Buttons.Run);
            };
            IconsState.prototype.selectIcon = function (icon) {
                this.lastIconSelected = icon;
                switch (this.lastIconSelected) {
                    case Icon.Left:
                    case Icon.Right:
                        this.state &= (Buttons.Up | Buttons.Down);
                        break;
                    case Icon.Up:
                    case Icon.Down:
                        this.state &= (Buttons.Left | Buttons.Right);
                        break;
                    case Icon.Jump:
                        this.state &= Buttons.Run;
                        break;
                    default:
                        this.state = 0;
                        break;
                }
                this.state |= Input.ICON_TO_BUTTONS[icon];
            };
            IconsState.prototype.isIconSelected = function (icon) {
                return !!(this.state & Input.ICON_TO_BUTTONS[icon]);
            };
            return IconsState;
        }());
        Input.IconsState = IconsState;
        var IconMenu = (function () {
            function IconMenu(game) {
                var _this = this;
                this.lastIconSelected = Icon.None;
                this.state = new IconsState();
                this.menuToggled = false;
                this.game = game;
                this.game.input.keyboard.addKeyCapture(IconMenu.TOGGLE_MENU_KEY_CODE);
                this.game.input.keyboard.addKeyCapture(IconMenu.FUNCTION_KEY_CODES);
                this.game.input.keyboard.addCallbacks(this, this.keyPressed);
                this.game.input.keyboard.addKey(IconMenu.TOGGLE_MENU_KEY_CODE).onDown.add(function () { _this.menuToggled = !_this.menuToggled; });
                this.game.input.onDown.add(this.menuClicked, this);
            }
            Object.defineProperty(IconMenu.prototype, "selectedIcon", {
                get: function () {
                    return this.lastIconSelected;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IconMenu.prototype, "isMenuToggled", {
                get: function () {
                    return this.menuToggled;
                },
                enumerable: true,
                configurable: true
            });
            IconMenu.prototype.clearInput = function () {
                this.state = new IconsState();
            };
            Object.defineProperty(IconMenu.prototype, "iconSelected", {
                set: function (icon) {
                    this.state.selectIcon(icon);
                    this.lastIconSelected = icon;
                },
                enumerable: true,
                configurable: true
            });
            IconMenu.prototype.menuClicked = function (pointer) {
                if (pointer.y < this.game.world.height - IconMenu.ICON_HEIGHT) {
                    return;
                }
                var iconIndex = Math.floor(pointer.x / IconMenu.ICON_WIDTH);
                if (!this.menuToggled) {
                    if (iconIndex < 2) {
                        if (pointer.x < IconMenu.ICON_WIDTH / 2) {
                            iconIndex = 0;
                        }
                        else if (pointer.x > IconMenu.ICON_WIDTH * 1.5) {
                            iconIndex = 3;
                        }
                        else if (pointer.y > this.game.world.height - IconMenu.ICON_HEIGHT / 2) {
                            iconIndex = 2;
                        }
                        else {
                            iconIndex = 1;
                        }
                    }
                    else {
                        iconIndex += 2;
                    }
                    this.iconSelected = Icon.Left + iconIndex;
                }
                else {
                    this.iconSelected = Icon.Pickup + iconIndex;
                }
            };
            IconMenu.prototype.keyPressed = function (event) {
                var iconIndex = IconMenu.FUNCTION_KEY_CODES.indexOf(event.keyCode);
                if (iconIndex !== -1) {
                    this.iconSelected = iconIndex + (this.menuToggled ? Icon.Pickup : Icon.Left);
                }
            };
            IconMenu.PRIMARY_ICONS = [
                Icon.Left,
                Icon.Up,
                Icon.Down,
                Icon.Right,
                Icon.Stop,
                Icon.Jump,
                Icon.Run,
                Icon.Attack,
                Icon.Defend,
                Icon.Flee,
            ];
            IconMenu.SECONDARY_ICONS = [
                Icon.Pickup,
                Icon.Use,
                Icon.Drop,
                Icon.Sword,
                Icon.Bow,
                Icon.Shield,
            ];
            IconMenu.ICON_HEIGHT = Barbarian.TILE_SIZE * 5;
            IconMenu.ICON_WIDTH = Barbarian.TILE_SIZE * 5;
            IconMenu.TOGGLE_MENU_KEY_CODE = Phaser.KeyCode.SPACEBAR;
            IconMenu.FUNCTION_KEY_CODES = [
                Phaser.KeyCode.F1,
                Phaser.KeyCode.F2,
                Phaser.KeyCode.F3,
                Phaser.KeyCode.F4,
                Phaser.KeyCode.F5,
                Phaser.KeyCode.F6,
                Phaser.KeyCode.F7,
                Phaser.KeyCode.F8,
                Phaser.KeyCode.F9,
                Phaser.KeyCode.F10
            ];
            return IconMenu;
        }());
        Input.IconMenu = IconMenu;
        var KeyboardState = (function () {
            function KeyboardState() {
                this.controlState = new Array(25);
            }
            KeyboardState.GetState = function (game) {
                var keyboardState = new KeyboardState();
                return keyboardState;
            };
            KeyboardState.prototype.isKeyUp = function (key) {
                return !this.controlState[key];
            };
            KeyboardState.prototype.isKeyDown = function (key) {
                return this.controlState[key];
            };
            return KeyboardState;
        }());
        Input.KeyboardState = KeyboardState;
        var ControlDirection = (function () {
            function ControlDirection() {
            }
            ControlDirection.fromInput = function (keyboardState, iconsState) {
                var direction = ControlDirection.None;
                if (keyboardState.isKeyDown(ControlCodes.UP) || iconsState.isIconSelected(Icon.Up)) {
                    direction |= ControlDirection.Up;
                }
                else if (keyboardState.isKeyDown(ControlCodes.DOWN) || iconsState.isIconSelected(Icon.Down)) {
                    direction |= ControlDirection.Down;
                }
                if (keyboardState.isKeyDown(ControlCodes.LEFT) || iconsState.isIconSelected(Icon.Left)) {
                    direction |= ControlDirection.Left;
                }
                else if (keyboardState.isKeyDown(ControlCodes.RIGHT) || iconsState.isIconSelected(Icon.Right)) {
                    direction |= ControlDirection.Right;
                }
                return direction;
            };
            ControlDirection.fromButtons = function (buttons) {
                return buttons & ControlDirection.Any;
            };
            ControlDirection.fromIconState = function (iconState) {
                var direction = ControlDirection.None;
                if (iconState.isIconSelected(Icon.Up)) {
                    direction |= ControlDirection.Up;
                }
                else if (iconState.isIconSelected(Icon.Down)) {
                    direction |= ControlDirection.Down;
                }
                if (iconState.isIconSelected(Icon.Left)) {
                    direction |= ControlDirection.Left;
                }
                else if (iconState.isIconSelected(Icon.Right)) {
                    direction |= ControlDirection.Right;
                }
                return direction;
            };
            ControlDirection.None = 0;
            ControlDirection.Up = 1;
            ControlDirection.Down = 2;
            ControlDirection.Right = 4;
            ControlDirection.Left = 8;
            ControlDirection.UpLeft = ControlDirection.Up | ControlDirection.Left;
            ControlDirection.UpRight = ControlDirection.Up | ControlDirection.Right;
            ControlDirection.DownLeft = ControlDirection.Down | ControlDirection.Left;
            ControlDirection.DownRight = ControlDirection.Down | ControlDirection.Right;
            ControlDirection.Horizontal = ControlDirection.Left | ControlDirection.Right;
            ControlDirection.Vertical = ControlDirection.Up | ControlDirection.Down;
            ControlDirection.Any = ControlDirection.Up | ControlDirection.Down | ControlDirection.Left | ControlDirection.Right;
            return ControlDirection;
        }());
        Input.ControlDirection = ControlDirection;
        var InputManager = (function () {
            function InputManager(game, hud) {
                var _this = this;
                this.lastInputTime = 0;
                this.nonDirectionButtons = {};
                this.game = game;
                this.hud = hud;
                this.iconMenu = new IconMenu(game);
                this.game.input.keyboard.addKey(Phaser.KeyCode.D).onDown.add(function () { _this.game.debugOn = !_this.game.debugOn; });
                this.buttonBuffer = new Array(InputManager.BUFFER_SIZE);
                this.keyboardState = KeyboardState.GetState(this.game);
                this.iconsState = IconsState.GetState(this.iconMenu);
                this.nonDirectionButtons[Buttons.Stop.toString()] = { button: Buttons.Stop, controlKey: ControlCodes.F5, icon: Icon.Stop };
                this.nonDirectionButtons[Buttons.Jump.toString()] = { button: Buttons.Jump, controlKey: ControlCodes.F6, icon: Icon.Jump };
                this.nonDirectionButtons[Buttons.Attack.toString()] = { button: Buttons.Attack, controlKey: ControlCodes.F8, icon: Icon.Attack };
                this.nonDirectionButtons[Buttons.Defend.toString()] = { button: Buttons.Defend, controlKey: ControlCodes.F9, icon: Icon.Defend };
                this.nonDirectionButtons[Buttons.Flee.toString()] = { button: Buttons.Flee, controlKey: ControlCodes.F10, icon: Icon.Flee };
                this.nonDirectionButtons[Buttons.Get.toString()] = { button: Buttons.Get, controlKey: ControlCodes.DOWN, icon: Icon.Pickup };
                this.nonDirectionButtons[Buttons.Drop.toString()] = { button: Buttons.Drop, controlKey: ControlCodes.DOWN, icon: Icon.Drop };
                this.nonDirectionButtons[Buttons.Run.toString()] = { button: Buttons.Run, controlKey: ControlCodes.F7, icon: Icon.Run };
                this.nonDirectionButtons[Buttons.Sword.toString()] = { button: Buttons.Sword, controlKey: ControlCodes.F7, icon: Icon.Sword };
                this.nonDirectionButtons[Buttons.Bow.toString()] = { button: Buttons.Bow, controlKey: ControlCodes.F7, icon: Icon.Bow };
                this.nonDirectionButtons[Buttons.Shield.toString()] = { button: Buttons.Shield, controlKey: ControlCodes.F7, icon: Icon.Shield };
            }
            InputManager.prototype.clearInput = function () {
                this.iconMenu.clearInput();
            };
            InputManager.prototype.update = function (gameTime) {
                this.lastKeyboardState = this.keyboardState;
                this.lastIconsState = this.iconsState;
                this.keyboardState = KeyboardState.GetState(this.game);
                this.iconsState = IconsState.GetState(this.iconMenu);
                var time = gameTime.time;
                var timeSinceLast = time - this.lastInputTime;
                if (timeSinceLast > InputManager.bufferTimeOut) {
                    this.buttonBuffer = [];
                    this.buttonBuffer = new Array(InputManager.BUFFER_SIZE);
                }
                var buttons = 0;
                for (var key in this.nonDirectionButtons) {
                    var button = this.nonDirectionButtons[key].button;
                    var controlKey = this.nonDirectionButtons[key].controlKey;
                    var icon = this.nonDirectionButtons[key].icon;
                    if ((this.lastKeyboardState.isKeyUp(controlKey) && this.keyboardState.isKeyDown(controlKey))
                        || (!this.lastIconsState.isIconSelected(icon) && this.iconsState.isIconSelected(icon))) {
                        buttons |= button;
                    }
                }
                var mergeInput = (this.buttonBuffer.length > 0 && timeSinceLast < InputManager.mergeInputTime);
                var direction = ControlDirection.fromInput(this.keyboardState, this.iconsState);
                buttons |= direction;
                mergeInput = false;
                if (buttons != 0) {
                    if (mergeInput) {
                        this.buttonBuffer[this.buttonBuffer.length - 1] = this.buttonBuffer[this.buttonBuffer.length - 1] | buttons;
                    }
                    else {
                        if (this.buttonBuffer.length === InputManager.BUFFER_SIZE) {
                            this.buttonBuffer.shift();
                        }
                        this.buttonBuffer.push(buttons);
                        this.lastInputTime = time;
                    }
                }
                this.buttonsState = buttons;
                this.iconMenu.state.reset();
            };
            InputManager.bufferTimeOut = 500;
            InputManager.mergeInputTime = 100;
            InputManager.BUFFER_SIZE = 10;
            return InputManager;
        }());
        Input.InputManager = InputManager;
    })(Input = Barbarian.Input || (Barbarian.Input = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    (function (ItemType) {
        ItemType[ItemType["None"] = -1] = "None";
        ItemType[ItemType["Arrow"] = 0] = "Arrow";
        ItemType[ItemType["Bow"] = 1] = "Bow";
        ItemType[ItemType["Shield"] = 2] = "Shield";
        ItemType[ItemType["Sword"] = 3] = "Sword";
        ItemType[ItemType["Orb"] = 4] = "Orb";
    })(Barbarian.ItemType || (Barbarian.ItemType = {}));
    var ItemType = Barbarian.ItemType;
    var Item = (function (_super) {
        __extends(Item, _super);
        function Item(game, id, x, y, roomNum) {
            _super.call(this, game, x, y, 'misc', id);
            this.roomNum = roomNum;
            this.itemType = id;
            switch (this.itemType) {
                case ItemType.Arrow:
                    this.frame = 2;
                    break;
                case ItemType.Bow:
                    this.frame = 5;
                    break;
                case ItemType.Shield:
                    this.frame = 4;
                    break;
                case ItemType.Sword:
                    this.frame = 3;
                    break;
                case ItemType.Orb:
                    this.frame = 28;
                    break;
                default:
                    this.frame = 0;
            }
            this.anchor.setTo(0.5, 1);
        }
        return Item;
    }(Phaser.Sprite));
    Barbarian.Item = Item;
    var Arrow2 = (function (_super) {
        __extends(Arrow2, _super);
        function Arrow2(hero) {
            var _this = this;
            var arrow = hero.animData[hero.animNum].frames[hero.frame].parts.find(function (p) { return p.index == -1; });
            var x = hero.facing === Barbarian.Facing.Left ? arrow.rx : arrow.x;
            var y = hero.facing === Barbarian.Facing.Left ? arrow.ry : arrow.y;
            _super.call(this, hero.game, hero.x + x, hero.y + y, 'hero', 128);
            this.velocity = hero.facing == Barbarian.Facing.Left ? -Barbarian.TILE_SIZE * 2 : Barbarian.TILE_SIZE * 2;
            this.scale.x = hero.facing == Barbarian.Facing.Left ? -1 : 1;
            this.anchor.setTo(0.5, 1);
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;
            this.flightAnim = this.animations.add('fly', [128], Barbarian.FRAMERATE, true, true);
            this.flightAnim.enableUpdate = true;
            this.flightAnim.onUpdate.add(function () { _this.x += _this.velocity; }, this);
            this.flightAnim.play();
        }
        return Arrow2;
    }(Phaser.Sprite));
    Barbarian.Arrow2 = Arrow2;
    var Arrow = (function (_super) {
        __extends(Arrow, _super);
        function Arrow(game, x, y, facing) {
            var _this = this;
            _super.call(this, game, x, y, 'hero', 128);
            this.anchor.setTo(0.5, 0.5);
            this.x += this.width / 2;
            this.y += this.height / 2;
            this.velocity = facing == Barbarian.Facing.Left ? -Barbarian.TILE_SIZE * 2 : Barbarian.TILE_SIZE * 2;
            this.scale.x = facing == Barbarian.Facing.Left ? -1 : 1;
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;
            this.flightAnim = this.animations.add('fly', [128], Barbarian.FRAMERATE, true, true);
            this.flightAnim.enableUpdate = true;
            this.flightAnim.onUpdate.add(function () { _this.x += _this.velocity; }, this);
            this.flightAnim.play();
        }
        return Arrow;
    }(Phaser.Sprite));
    Barbarian.Arrow = Arrow;
    var Orb = (function (_super) {
        __extends(Orb, _super);
        function Orb(game, id, x, y, roomNum) {
            _super.call(this, game, id, x, y, roomNum);
            this.timeStep = 0;
            this.colorIndex = 0;
            this.orb = game.make.sprite(0, 0, 'misc', 28);
            this.bitmapData = game.make.bitmapData(this.width, this.height);
            this.bitmapData.ctx.beginPath();
            this.bitmapData.ctx.rect(0, 0, this.width, this.height);
            this.bitmapData.ctx.fillStyle = '#ff0000';
            this.bitmapData.ctx.fill();
            this.bitmapData.load(this.orb);
            this.bitmapData.update();
            this.setTexture(this.bitmapData.texture);
        }
        Orb.prototype.update = function () {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= (Barbarian.FIXED_TIMESTEP >> 1)) {
                this.timeStep = this.timeStep % (Barbarian.FIXED_TIMESTEP >> 1);
                this.bitmapData.load(this.orb);
                this.bitmapData.update();
                this.bitmapData.processPixelRGB(this.forEachPixel, this);
                this.colorIndex++;
                if (this.colorIndex > 15) {
                    this.colorIndex = 0;
                }
            }
        };
        Orb.prototype.forEachPixel = function (pixel) {
            if (pixel.color.toString(16) == 'ffaa00aa') {
                return Phaser.Color.fromRGBA(Barbarian.EGA_COLORS[this.colorIndex]);
            }
            else {
                return false;
            }
        };
        return Orb;
    }(Item));
    Barbarian.Orb = Orb;
    var Orb2 = (function (_super) {
        __extends(Orb2, _super);
        function Orb2(game, x, y) {
            _super.call(this, game, x, y, 'hero', 138);
            this.timeStep = 0;
            this.colorIndex = 0;
            this.orb = game.make.sprite(0, 0, 'hero', 138);
            this.bitmapData = game.make.bitmapData(this.width, this.height);
            this.bitmapData.load(this.orb);
            this.bitmapData.update();
            this.setTexture(this.bitmapData.texture);
        }
        Orb2.prototype.update = function () {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= (Barbarian.FIXED_TIMESTEP >> 1)) {
                this.timeStep = this.timeStep % (Barbarian.FIXED_TIMESTEP >> 1);
                this.bitmapData.load(this.orb);
                this.bitmapData.update();
                this.bitmapData.processPixelRGB(this.forEachPixel, this);
                this.colorIndex++;
                if (this.colorIndex > 15) {
                    this.colorIndex = 0;
                }
            }
        };
        Orb2.prototype.forEachPixel = function (pixel) {
            if (pixel.color.toString(16) == 'ffaa00aa') {
                return Phaser.Color.fromRGBA(Barbarian.EGA_COLORS[this.colorIndex]);
            }
            else {
                return false;
            }
        };
        return Orb2;
    }(Phaser.Sprite));
    Barbarian.Orb2 = Orb2;
    (function (AreaAttributes) {
        AreaAttributes[AreaAttributes["None"] = 0] = "None";
        AreaAttributes[AreaAttributes["FlipHorizontal"] = 1] = "FlipHorizontal";
        AreaAttributes[AreaAttributes["FlipVertical"] = 2] = "FlipVertical";
        AreaAttributes[AreaAttributes["BlackOut"] = 4] = "BlackOut";
    })(Barbarian.AreaAttributes || (Barbarian.AreaAttributes = {}));
    var AreaAttributes = Barbarian.AreaAttributes;
    var Level = (function () {
        function Level(game, roomData, startingRoom) {
            if (startingRoom === void 0) { startingRoom = 0; }
            this.items = [];
            this.onRoomChange = new Phaser.Signal();
            this.game = game;
            this.roomData = roomData;
            this.room = startingRoom;
            for (var _i = 0, _a = this.roomData; _i < _a.length; _i++) {
                var room = _a[_i];
                for (var _b = 0, _c = room.items; _b < _c.length; _b++) {
                    var item = _c[_b];
                    this.items.push(new Item(this.game, item.id, item.x, item.y, room.id));
                }
            }
            this.items.push(new Orb(this.game, ItemType.Orb, 600, 304, 53));
        }
        Level.prototype.addItem = function (id, x, y) {
            var newItem = new Item(this.game, id, x, y, this.room);
            this.items.push(newItem);
            this.game.world.add(newItem);
        };
        Object.defineProperty(Level.prototype, "currentRoom", {
            get: function () {
                return this.roomData[this.room];
            },
            enumerable: true,
            configurable: true
        });
        Level.prototype.getStartPosition = function () {
            var startPos = this.currentRoom.startPos;
            while (startPos.tileX == 0 || startPos.tileY == 0) {
                this.room--;
                startPos = this.currentRoom.startPos;
            }
            return startPos;
        };
        Level.prototype.nextRoom = function (direction) {
            var newRoom;
            switch (direction) {
                case Barbarian.Direction.Left:
                    newRoom = this.currentRoom.map.left;
                    break;
                case Barbarian.Direction.Right:
                    newRoom = this.currentRoom.map.right;
                    break;
                case Barbarian.Direction.Up:
                    newRoom = this.currentRoom.map.up;
                    break;
                case Barbarian.Direction.Down:
                    newRoom = this.currentRoom.map.down;
                    break;
                default:
                    newRoom = -1;
                    break;
            }
            if (newRoom !== -1) {
                this.room = newRoom;
                this.onRoomChange.dispatch(direction);
            }
        };
        Level.prototype.getRoomItems = function () {
            var _this = this;
            return this.items.filter(function (item) {
                return item.roomNum == _this.room && item.visible;
            });
        };
        Level.prototype.pickUpItem = function (hero) {
            var closestItem = null;
            var closestDelta = 0xFFFF;
            for (var _i = 0, _a = this.getRoomItems(); _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.y == hero.y) {
                    var delta = Math.abs(item.x - hero.x);
                    if (delta < closestDelta) {
                        closestDelta = delta;
                        closestItem = item;
                    }
                }
            }
            if (closestItem != null && closestDelta <= 1.5 * Barbarian.TILE_SIZE) {
                closestItem.visible = false;
                return closestItem.itemType;
            }
            else {
                return ItemType.None;
            }
        };
        return Level;
    }());
    Barbarian.Level = Level;
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Play = (function (_super) {
        __extends(Play, _super);
        function Play() {
            _super.apply(this, arguments);
        }
        Play.prototype.preload = function () {
            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
            this.load.atlasJSONArray('misc', 'assets/miscspr.png', 'assets/miscspr.json');
            this.load.atlasJSONArray('hero', 'assets/hero.png', 'assets/hero.json');
            this.load.json('hero', 'assets/heroanims.json');
            this.load.atlasJSONArray('hud', 'assets/hud.png', 'assets/hud.json');
            this.load.json('enemies', 'assets/enemyanims.json');
            for (var i = 0; i < 38; i++) {
                var key = Barbarian.Enemies.EnemyKeys[i].toLowerCase();
                this.load.atlasJSONArray(key.toUpperCase(), 'assets/enemies/' + key + '.png', 'assets/enemies/' + key + '.json');
            }
        };
        Play.prototype.create = function () {
            this.game.level = new Barbarian.Level(this.game, this.cache.getJSON('rooms'), this.game.debugRoomWarp ? this.game.debugRoomWarp : 0x00);
            this.game.level.onRoomChange.add(this.drawRoom, this);
            this.stage.smoothed = false;
            this.game.renderer.renderSession.roundPixels = false;
            var startPos = this.game.level.getStartPosition();
            this.game.hero = new Barbarian.Hero(this.game, startPos.tileX, startPos.tileY);
            this.game.hero.onDied.add(this.heroDied, this);
            this.background = this.add.bitmapData(640, 320);
            this.drawRoom(Barbarian.Direction.Right);
            this.hud = new Hud(this.game, 'hud', 0, 320);
            this.stage.addChild(this.hud);
            this.game.inputManager = new Barbarian.Input.InputManager(this.game, this.hud);
            this.game.time.reset();
        };
        Play.prototype.createEffect = function (x, y, name) {
            var effect = this.add.sprite(x, y, 'misc');
            switch (name) {
                case 'bat':
                    effect.scale.setTo(-1, 1);
                    effect.animations.add(name, [33, 34], 4, true, true);
                    var tween = this.game.add.tween(effect).to({ x: -40 }, 10000, Phaser.Easing.Linear.None, true, 500);
                    break;
                case 'torch1':
                    effect.animations.add(name, [9, 7, 8], 6, true, true);
                    break;
                case 'torch2':
                    effect.animations.add(name, [7, 8, 9], 6, true, true);
                    break;
                case 'fire':
                    effect.animations.add(name, [10, 11, 12], 6, true, true);
                    break;
                case 'skull_eyes':
                    effect.animations.add(name, [17, 18, 19, 18], 6, true, true);
                    break;
                case 'demon_eyes':
                    effect.animations.add(name, [13, 14, 15, 14], 6, true, true);
                    break;
                case 'blood_drip':
                    effect.frame = 16;
                    var tween = this.game.add.tween(effect).to({ y: 320 }, 1200, Phaser.Easing.Exponential.In, true);
                    tween.repeat(-1, 1000);
                    break;
            }
            if (name != 'blood_drip') {
                effect.animations.play(name, Barbarian.FRAMERATE);
            }
        };
        Play.prototype.heroDied = function () {
            var _this = this;
            this.game.lives--;
            this.game.time.events.add(Phaser.Timer.SECOND / 2, function () {
                _this.game.time.reset();
                _this.game.hero.reset(_this.game.level.getStartPosition().tileX, _this.game.level.getStartPosition().tileY);
                _this.game.inputManager.clearInput();
                _this.drawRoom(Barbarian.Direction.None);
            }, this);
        };
        Play.prototype.drawRoom = function (direction) {
            this.world.removeAll();
            this.background.clear();
            var color = Phaser.Color.getRGB(Phaser.Color.getRandomColor());
            this.background.fill(color.r, color.g, color.b, color.a);
            for (var _i = 0, _a = this.game.level.currentRoom.area; _i < _a.length; _i++) {
                var obj = _a[_i];
                if (obj.flags & Barbarian.AreaAttributes.BlackOut) {
                    this.background.rect(obj.xOff, obj.yOff, Barbarian.TILE_SIZE * obj.unknown, Barbarian.TILE_SIZE, '#000');
                }
                else {
                    var spr;
                    spr = this.make.image(obj.xOff, obj.yOff, 'area', obj.imageId);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = obj.flags & Barbarian.AreaAttributes.FlipHorizontal ? -1 : 1;
                    var yScale = obj.flags & Barbarian.AreaAttributes.FlipVertical ? -1 : 1;
                    spr.scale.setTo(xScale, yScale);
                    this.background.draw(spr, spr.x, spr.y);
                }
            }
            this.background.addToWorld(0, 0);
            for (var _b = 0, _c = this.game.level.currentRoom.effects; _b < _c.length; _b++) {
                var effect = _c[_b];
                this.createEffect(effect.x, effect.y, effect.name);
            }
            this.enemies = [];
            for (var _d = 0, _e = this.game.level.currentRoom.enemies; _d < _e.length; _d++) {
                var enemy = _e[_d];
                var createdEnemy = Barbarian.Enemies.Enemy.createEnemy(this.game, enemy, direction);
                this.world.add(createdEnemy);
                this.enemies.push(createdEnemy);
            }
            this.world.add(this.game.hero);
            for (var _f = 0, _g = this.game.level.getRoomItems(); _f < _g.length; _f++) {
                var item = _g[_f];
                this.world.add(item);
            }
        };
        Play.prototype.handleMovement = function () {
            if (this.game.hero.x >= this.world.width + Barbarian.TILE_SIZE && this.game.hero.direction == Barbarian.Direction.Right) {
                this.game.level.nextRoom(Barbarian.Direction.Right);
                this.game.hero.x = 0;
                this.game.hero.tilePos.x = 0;
            }
            else if (this.game.hero.x <= -16 && (this.game.hero.direction == Barbarian.Direction.Left || this.game.hero.facing == Barbarian.Facing.Left)) {
                this.game.level.nextRoom(Barbarian.Direction.Left);
                this.game.hero.x = 640;
                this.game.hero.tilePos.x = 39;
            }
            else if (this.game.hero.y <= 0 && this.game.hero.direction == Barbarian.Direction.Up) {
                this.game.level.nextRoom(Barbarian.Direction.Up);
                this.game.hero.y = 320;
                this.game.hero.tilePos.y = 19;
            }
            else if (this.game.hero.y >= this.world.height - (Barbarian.TILE_SIZE * 1.5)) {
                this.game.level.nextRoom(Barbarian.Direction.Down);
                this.game.hero.y = Barbarian.TILE_SIZE;
                this.game.hero.tilePos.y = 1;
            }
        };
        Play.prototype.update = function () {
            this.game.inputManager.update(this.game.time);
            this.handleMovement();
            if (this.game.hero.isAttackingWithSword) {
                for (var _i = 0, _a = this.enemies.filter(function (e) { return e.isKillable; }); _i < _a.length; _i++) {
                    var enemy = _a[_i];
                    var enemyBounds = new Phaser.Rectangle().copyFrom(enemy.getBounds());
                    if (enemyBounds.intersects(this.game.hero.getSwordBounds(), 0)) {
                        enemy.kill();
                    }
                }
            }
            for (var _b = 0, _c = this.world.children.filter(function (obj) { return obj instanceof Barbarian.Arrow && obj.alive; }); _b < _c.length; _b++) {
                var arrow = _c[_b];
                for (var _d = 0, _e = this.enemies.filter(function (e) { return e.isKillable; }); _d < _e.length; _d++) {
                    var enemy = _e[_d];
                    var enemyBounds = new Phaser.Rectangle().copyFrom(enemy.getBounds()).inflate(Barbarian.TILE_SIZE / 2, Barbarian.TILE_SIZE * 2);
                    var arrowBounds = new Phaser.Rectangle().copyFrom(arrow.getBounds());
                    if (enemyBounds.containsRect(arrowBounds)) {
                        enemy.kill();
                        arrow.kill();
                    }
                }
            }
            for (var _f = 0, _g = this.world.children.filter(function (obj) { return obj instanceof Barbarian.Enemies.SmallArrow && obj.alive; }); _f < _g.length; _f++) {
                var small = _g[_f];
                var heroBounds = new Phaser.Rectangle().copyFrom(this.game.hero.getBounds()).inflate(Barbarian.TILE_SIZE / 2, Barbarian.TILE_SIZE * 2);
                var arrowBounds = new Phaser.Rectangle().copyFrom(small.getBounds());
                if (heroBounds.containsRect(arrowBounds)) {
                    this.game.hero.fsm.transition('Die');
                    small.kill();
                }
            }
        };
        Play.prototype.render = function () {
            if (this.game.debugOn) {
                this.game.debug.text(this.game.level.currentRoom.id.toString(), 20, 20);
                this.game.debug.text(this.game.inputManager.iconsState.toString(), 50, 20);
                this.game.debug.text(this.game.hero.animNum.toString(), 40, 80);
                for (var i = 0; i < 40; i++) {
                    for (var j = 0; j < 20; j++) {
                        this.game.debug.text(this.game.hero.tileMap.getTileValue(i, j), i * Barbarian.TILE_SIZE + 4, j * Barbarian.TILE_SIZE + 12);
                        this.game.debug.rectangle(new Phaser.Rectangle(i * Barbarian.TILE_SIZE, j * Barbarian.TILE_SIZE, Barbarian.TILE_SIZE, Barbarian.TILE_SIZE), null, false);
                    }
                }
                var dumbAdjust = this.game.hero.direction == Barbarian.Direction.Right ? -Barbarian.TILE_SIZE : 0;
                this.game.debug.rectangle(new Phaser.Rectangle(this.game.hero.x + dumbAdjust, this.game.hero.y - Barbarian.TILE_SIZE, Barbarian.TILE_SIZE, Barbarian.TILE_SIZE), "green", true);
                this.game.debug.pixel(this.game.hero.x, this.game.hero.y, 'rgba(0,255,255,1)');
                var bounds = this.game.hero.getBodyBounds();
                this.game.debug.rectangle(new Phaser.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
                this.game.debug.rectangle(this.game.hero.getSwordBounds(), 'red', false);
                for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
                    var enemy = _a[_i];
                    if (enemy != null) {
                        bounds = enemy.getBounds();
                        this.game.debug.rectangle(new Phaser.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
                    }
                }
            }
        };
        return Play;
    }(Phaser.State));
    Barbarian.Play = Play;
    var Hud = (function (_super) {
        __extends(Hud, _super);
        function Hud(game, key, x, y) {
            _super.call(this, game);
            this.primaryVisible = true;
            this.weaponIcons = [];
            this.heroIcons = [];
            this.iconSelected = Barbarian.Input.Icon.None;
            this.icons = {};
            this.x = x;
            this.y = y;
            this.primaryHud = this.create(0, 0, key, 'ICON-06.PNG');
            this.secondaryHud = this.create(640, 0, key, 'ICON-07.PNG');
            this.secondaryHud.crop(new Phaser.Rectangle(0, 0, 480, 80), true);
            this.weaponIcons[Barbarian.Weapon.Sword] = this.create(640 + 3 * 80, 0, key, 'ICON-03.PNG');
            this.weaponIcons[Barbarian.Weapon.Bow] = this.create(640 + 4 * 80, 0, key, 'ICON-04.PNG');
            this.weaponIcons[Barbarian.Weapon.Shield] = this.create(640 + 5 * 80, 0, key, 'ICON-05.PNG');
            this.iconSelector = this.create(0, 0, 'misc', '000.PNG');
            this.iconSelector.anchor.setTo(0.5, 0.5);
            this.iconSelector.x = this.iconSelector.y = -100;
            for (var i = 0; i < 3; i++) {
                this.heroIcons[i] = this.create(640 + 544 + i * 32, 0, 'hud', 'ICON-01.PNG');
            }
            this.icons[Barbarian.Input.Icon.Left.toString()] = { icon: Barbarian.Input.Icon.Left, hitBox: new Phaser.Rectangle(0, 0, 40, 80) };
            this.icons[Barbarian.Input.Icon.Up.toString()] = { icon: Barbarian.Input.Icon.Up, hitBox: new Phaser.Rectangle(40, 0, 80, 40) };
            this.icons[Barbarian.Input.Icon.Down.toString()] = { icon: Barbarian.Input.Icon.Down, hitBox: new Phaser.Rectangle(40, 40, 80, 40) };
            this.icons[Barbarian.Input.Icon.Right.toString()] = { icon: Barbarian.Input.Icon.Right, hitBox: new Phaser.Rectangle(120, 0, 40, 80) };
            this.icons[Barbarian.Input.Icon.Stop.toString()] = { icon: Barbarian.Input.Icon.Stop, hitBox: new Phaser.Rectangle(160, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Jump.toString()] = { icon: Barbarian.Input.Icon.Jump, hitBox: new Phaser.Rectangle(240, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Run.toString()] = { icon: Barbarian.Input.Icon.Run, hitBox: new Phaser.Rectangle(320, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Attack.toString()] = { icon: Barbarian.Input.Icon.Attack, hitBox: new Phaser.Rectangle(400, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Defend.toString()] = { icon: Barbarian.Input.Icon.Defend, hitBox: new Phaser.Rectangle(480, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Flee.toString()] = { icon: Barbarian.Input.Icon.Flee, hitBox: new Phaser.Rectangle(560, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Pickup.toString()] = { icon: Barbarian.Input.Icon.Pickup, hitBox: new Phaser.Rectangle(640, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Use.toString()] = { icon: Barbarian.Input.Icon.Use, hitBox: new Phaser.Rectangle(720, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Drop.toString()] = { icon: Barbarian.Input.Icon.Drop, hitBox: new Phaser.Rectangle(800, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Sword.toString()] = { icon: Barbarian.Input.Icon.Sword, hitBox: new Phaser.Rectangle(880, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Bow.toString()] = { icon: Barbarian.Input.Icon.Bow, hitBox: new Phaser.Rectangle(960, 0, 80, 80) };
            this.icons[Barbarian.Input.Icon.Shield.toString()] = { icon: Barbarian.Input.Icon.Shield, hitBox: new Phaser.Rectangle(1040, 0, 80, 80) };
        }
        Hud.prototype.update = function () {
            this.forEach(function (part) { if (part.animations.currentFrame.name.startsWith("DIGIT")) {
                part.kill();
            } }, this);
            this.iconSelected = this.game.inputManager.iconMenu.selectedIcon;
            this.primaryVisible = !this.game.inputManager.iconMenu.isMenuToggled;
            this.x = this.primaryVisible ? 0 : -640;
            this.render();
        };
        Hud.prototype.render = function () {
            this.renderTimer();
            this.renderArrowCount(this.game.hero.inventory.numArrows);
            this.renderWeaponIcons();
            this.renderLives();
            this.renderSelector();
        };
        Hud.prototype.renderSelector = function () {
            if (this.iconSelected == Barbarian.Input.Icon.None) {
                return;
            }
            for (var key in this.icons) {
                if (this.iconSelected == this.icons[key].icon) {
                    var hitBox = this.icons[key].hitBox;
                    this.iconSelector.x = hitBox.centerX;
                    this.iconSelector.y = hitBox.centerY;
                    break;
                }
            }
        };
        Hud.prototype.renderLives = function () {
            for (var i = 0; i < 3; i++) {
                if (i < this.game.lives) {
                    this.heroIcons[i].visible = true;
                }
                else {
                    this.heroIcons[i].visible = false;
                }
            }
        };
        Hud.prototype.renderWeaponIcons = function () {
            for (var weapon = Barbarian.Weapon.Sword; weapon <= Barbarian.Weapon.Bow; weapon++) {
                if (this.game.hero.inventory.hasWeapon(weapon)) {
                    this.weaponIcons[weapon].visible = true;
                }
                else {
                    this.weaponIcons[weapon].visible = false;
                }
            }
        };
        Hud.prototype.renderTimer = function () {
            var date = new Date(null);
            date.setSeconds(this.game.time.totalElapsedSeconds());
            var result = date.toISOString().substr(11, 8);
            for (var i = 0, iMax = result.length; i < iMax; i++) {
                this.renderDigit(result.charAt(i), 640 + 496 + i * 16, 50);
            }
        };
        Hud.prototype.renderDigit = function (digit, x, y) {
            var key = digit === ":" ? 'DIGIT-10.PNG' : 'DIGIT-0' + digit + '.PNG';
            digit = this.getFirstDead(true, x, y, 'hud', key);
        };
        Hud.prototype.renderArrowCount = function (numArrows) {
            var count = "0" + numArrows;
            count = count.substr(count.length - 2);
            this.getFirstDead(true, 640 + 512, 0, 'hud', 'ICON-00.PNG');
            for (var i = 0, iMax = count.length; i < iMax; i++) {
                this.renderDigit(count.charAt(i), 640 + 480 + i * 16, 0);
            }
        };
        Hud.DirectionIcons = Barbarian.Input.Icons.Left | Barbarian.Input.Icons.Right | Barbarian.Input.Icons.Up | Barbarian.Input.Icons.Down | Barbarian.Input.Icons.Run;
        return Hud;
    }(Phaser.Group));
    Barbarian.Hud = Hud;
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    (function (TileMapLocation) {
        TileMapLocation[TileMapLocation["LadderTop"] = 0] = "LadderTop";
        TileMapLocation[TileMapLocation["LadderBottom"] = 1] = "LadderBottom";
        TileMapLocation[TileMapLocation["StairsTop"] = 2] = "StairsTop";
        TileMapLocation[TileMapLocation["StairsBottom"] = 3] = "StairsBottom";
        TileMapLocation[TileMapLocation["StairsUp"] = 4] = "StairsUp";
        TileMapLocation[TileMapLocation["StairsUpOptional"] = 5] = "StairsUpOptional";
        TileMapLocation[TileMapLocation["StairsDown"] = 6] = "StairsDown";
        TileMapLocation[TileMapLocation["StairsDownOptional"] = 7] = "StairsDownOptional";
    })(Barbarian.TileMapLocation || (Barbarian.TileMapLocation = {}));
    var TileMapLocation = Barbarian.TileMapLocation;
    var TileMap = (function () {
        function TileMap(entity) {
            this.entity = entity;
        }
        TileMap.prototype.getTileValue = function (x, y) {
            var tile = this.entity.game.level.currentRoom
                .layout[y].rowData
                .substring(x, x + 1);
            return tile;
        };
        TileMap.prototype.getTile = function (adjustX, adjustY) {
            if (adjustX == null) {
                adjustX = 0;
            }
            if (adjustY == null) {
                adjustY = 0;
            }
            var position = this.entity.getTileMapPosition(adjustX, adjustY);
            if (position.x == -1 || position.y == -1)
                return '?';
            return this.getTileValue(position.x, position.y);
        };
        TileMap.prototype.isAbleToJump = function () {
            var position = this.entity.getTileMapPosition();
            if (position.x == -1 || position.y == -1)
                return false;
            var tileMapRow = this.entity.game.level.currentRoom.layout[position.y - 1].rowData;
            var relativeMovement = this.entity.facing == Barbarian.Facing.Right ? 1 : -1;
            for (var x = 0; x < 10; x++) {
                if (tileMapRow.charAt(position.x) === '#')
                    return false;
                position.x += relativeMovement;
                if (position.x < 0 || position.x > 39)
                    return true;
            }
            return true;
        };
        TileMap.prototype.isEntityAt = function (location) {
            var searchString;
            switch (location) {
                case TileMapLocation.StairsTop:
                    return 'H$|B$|E&'.indexOf(this.getTile(0, -1) + this.getTile(1, -1)) != -1;
                case TileMapLocation.StairsBottom:
                    return 'A%|G%|D(|J('.indexOf(this.getTile(-1) + this.getTile()) != -1;
                case TileMapLocation.StairsUp:
                    return '%A|%G'.indexOf(this.getTile(-1) + this.getTile()) != -1;
                case TileMapLocation.StairsDown:
                    return '$H|$B'.indexOf(this.getTile(-1) + this.getTile()) != -1;
                case TileMapLocation.StairsDownOptional:
                    return '&E|'.indexOf(this.getTile(-1) + this.getTile()) != -1;
                case TileMapLocation.StairsUpOptional:
                    return '(J|(D'.indexOf(this.getTile(-1) + this.getTile()) != -1;
                case TileMapLocation.LadderBottom:
                    searchString = '-+.';
                    break;
                case TileMapLocation.LadderTop:
                    searchString = '*+,';
                    break;
                default:
                    searchString = 'NEVERFIND';
                    break;
            }
            var position = this.entity.getTileMapPosition();
            if (position.x == -1 || position.y == -1)
                return false;
            var tileMapRow = this.entity.game.level.currentRoom.layout[position.y].rowData;
            var index = 0;
            while (tileMapRow.indexOf(searchString, index) != -1) {
                index = tileMapRow.indexOf(searchString, index);
                if (position.x >= index && position.x <= index + searchString.length - 1)
                    return true;
                else
                    index++;
            }
            return false;
        };
        TileMap.prototype.positionOnLadder = function () {
            var tile = this.getTile();
            var adjustX = 0;
            if (tile == '-' || tile == '*')
                adjustX = 1;
            else if (tile == '.' || tile == ',')
                adjustX = -1;
            this.entity.moveRelative(adjustX, 0);
        };
        return TileMap;
    }());
    Barbarian.TileMap = TileMap;
})(Barbarian || (Barbarian = {}));
//# sourceMappingURL=barb.js.map