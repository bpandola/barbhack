var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Barbarian;
(function (Barbarian) {
    Barbarian.SCALE = 2;
    Barbarian.TILE_SIZE = 16;
    Barbarian.TILE_SHIFT = 4;
    Barbarian.FIXED_TIMESTEP = 140;
    Barbarian.FRAMERATE = 1000 / Barbarian.FIXED_TIMESTEP;
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 640, 400, Phaser.CANVAS, 'game', null);
            this.lives = 3;
            this.debugOn = true;
            this.state.add('Boot', new Barbarian.Boot());
            this.state.add('Play', new Barbarian.Play());
            this.state.start('Boot', true, true, 'Play');
        }
        return Game;
    }(Phaser.Game));
    Barbarian.Game = Game;
})(Barbarian || (Barbarian = {}));
window.onload = function () {
    var game = new Barbarian.Game();
};
var Barbarian;
(function (Barbarian) {
    var Entity = (function (_super) {
        __extends(Entity, _super);
        function Entity(game, key) {
            _super.call(this, game);
            this.timeStep = 0;
            for (var i = 0; i < game.cache.getFrameCount(key); i++) {
                var part = this.create(0, 0, key, i);
                part.anchor.setTo(0.5);
            }
        }
        Object.defineProperty(Entity.prototype, "currentParts", {
            get: function () {
                return [];
            },
            enumerable: true,
            configurable: true
        });
        Entity.prototype.moveRelative = function (numTilesX, numTilesY) {
            var xMovement = this.facing == Barbarian.Direction.Right ? Barbarian.TILE_SIZE : -Barbarian.TILE_SIZE;
            var yMovement = this.direction == Barbarian.Direction.Up ? -Barbarian.TILE_SIZE : Barbarian.TILE_SIZE;
            this.x += xMovement * numTilesX;
            this.y += yMovement * numTilesY;
        };
        Entity.prototype.update = function () {
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Barbarian.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Barbarian.FIXED_TIMESTEP;
                this.tick();
            }
        };
        Entity.prototype.tick = function () { };
        Entity.prototype.render = function () {
            this.forEach(function (part) { part.visible = false; }, this);
            for (var i = 0, parts = this.currentParts; i < parts.length; i++) {
                var part = parts[i];
                var spr = this.getChildAt(part.index);
                spr.scale.setTo(1, 1);
                spr.x = this.facing === Barbarian.Direction.Left ? part.rx : part.x;
                spr.y = this.facing === Barbarian.Direction.Left ? part.ry : part.y;
                spr.x += spr.width / 2;
                spr.y += spr.height / 2;
                spr.z = i;
                var xScale = part.flags & 1 ? -1 : 1;
                var yScale = part.flags & 2 ? -1 : 1;
                xScale = this.facing === Barbarian.Direction.Left ? -xScale : xScale;
                spr.scale.setTo(xScale, yScale);
                spr.visible = true;
            }
        };
        return Entity;
    }(Phaser.Group));
    Barbarian.Entity = Entity;
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
                this.facing = this.dataBlob.flags[this.direction + 1] ? Barbarian.Direction.Left : Barbarian.Direction.Right;
                this.timeStep = Barbarian.FIXED_TIMESTEP;
            }
            Enemy.createEnemy = function (game, data, direction) {
                switch (data.id) {
                    case EnemyKeys.ROT:
                        return new Enemies.Rotate(game, data, direction);
                    case EnemyKeys.SCY:
                        return new Enemies.Scythe(game, data, direction);
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
                        this.facing = Barbarian.Direction.Right;
                    else
                        this.facing = Barbarian.Direction.Left;
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
        }(Barbarian.Entity));
        Enemies.Enemy = Enemy;
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
                this.velocity = entity.facing == Barbarian.Direction.Left ? -Barbarian.TILE_SIZE * 2 : Barbarian.TILE_SIZE * 2;
                this.scale.x = entity.facing == Barbarian.Direction.Left ? -1 : 1;
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
                                    if (this.facing == Barbarian.Direction.Left) {
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
                    this.facing = Barbarian.Direction.Right;
                else
                    this.facing = Barbarian.Direction.Left;
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
            function Scythe() {
                _super.apply(this, arguments);
            }
            Scythe.prototype.tick = function () {
                if ((this.animNum == 1 && this.frame === 2) || this.animNum == 2) {
                    this.animNum = 2;
                    this.frame = 0;
                }
                else if (this.animNum == 0) {
                    if (this.game.hero.x - this.x < Scythe.TRIGGER_DISTANCE) {
                        this.animNum = 1;
                        this.frame = 0;
                    }
                }
                else {
                    this.animate();
                    if (this.animNum == 1) {
                        if (this.game.hero.x - this.x < Scythe.HIT_DISTANCE) {
                            this.game.hero.moveRelative(1, 0);
                            this.game.hero.fsm.transition('TripFall');
                        }
                    }
                }
                this.render();
            };
            Scythe.TRIGGER_DISTANCE = 0x20 * Barbarian.SCALE;
            Scythe.HIT_DISTANCE = 0x10 * Barbarian.SCALE;
            return Scythe;
        }(Enemies.Enemy));
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
    var StateMachine;
    (function (StateMachine_1) {
        StateMachine_1.WILDCARD = '*';
        var StateMachine = (function () {
            function StateMachine(hero) {
                this.states = [];
                this.validFromStates = [];
                this.currentState = null;
                this.pendingState = null;
                this.hero = hero;
            }
            StateMachine.prototype.add = function (key, state, validFromStates) {
                this.states[key] = state;
                this.validFromStates[key] = validFromStates;
            };
            StateMachine.prototype.transition = function (newState, immediately) {
                if (immediately === void 0) { immediately = false; }
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                console.log(newState);
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
                if (newState != this.currentStateName) {
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
                    for (var _i = 0, _a = this.validFromStates[newState]; _i < _a.length; _i++) {
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
            this.anchor.setTo(entity.facing == Barbarian.Direction.Left ? 0 : 1, 1);
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
        Animations[Animations["HitGround"] = 34] = "HitGround";
        Animations[Animations["Falling"] = 36] = "Falling";
        Animations[Animations["TripFall"] = 37] = "TripFall";
        Animations[Animations["FrontFlip"] = 39] = "FrontFlip";
        Animations[Animations["PickUp"] = 42] = "PickUp";
        Animations[Animations["Idle"] = 43] = "Idle";
    })(Barbarian.Animations || (Barbarian.Animations = {}));
    var Animations = Barbarian.Animations;
    (function (Weapon) {
        Weapon[Weapon["None"] = 1] = "None";
        Weapon[Weapon["Sword"] = 2] = "Sword";
        Weapon[Weapon["Shield"] = 3] = "Shield";
        Weapon[Weapon["Bow"] = 4] = "Bow";
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
    var Inventory = (function () {
        function Inventory() {
            this.availableWeapons = [];
            this.numArrows = 10;
            this.availableWeapons[Weapon.Bow] = true;
            this.availableWeapons[Weapon.Shield] = true;
            this.availableWeapons[Weapon.Sword] = true;
            this.activeWeapon = Weapon.Sword;
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
            this.tilePos.setTo(tileX, tileY);
            this.x = tileX << Barbarian.TILE_SHIFT;
            this.y = tileY << Barbarian.TILE_SHIFT;
            this.animData = this.game.cache.getJSON('hero');
            this.inventory = new Inventory();
            this.direction = Direction.Right;
            this.facing = Direction.Right;
            this.tileMap = new Barbarian.TileMap(this);
            this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT, 'jump': Phaser.KeyCode.SPACEBAR, 'sword': Phaser.KeyCode.ONE, 'bow': Phaser.KeyCode.TWO, 'shield': Phaser.KeyCode.THREE, 'slow': Phaser.KeyCode.S, 'fast': Phaser.KeyCode.F, 'flee': Phaser.KeyCode.FOUR });
            this.game.input.keyboard.addKeyCapture([Phaser.KeyCode.UP, Phaser.KeyCode.DOWN, Phaser.KeyCode.LEFT, Phaser.KeyCode.RIGHT, Phaser.KeyCode.SHIFT, Phaser.KeyCode.ALT, Phaser.KeyCode.SPACEBAR]);
            this.fsm = new Barbarian.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new Barbarian.HeroStates.Idle(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('Walk', new Barbarian.HeroStates.Walk(this), ['Idle', 'Run', 'Flee']);
            this.fsm.add('Jump', new Barbarian.HeroStates.Jump(this), ['Idle']);
            this.fsm.add('Stop', new Barbarian.HeroStates.Stop(this), ['Walk', 'Run']);
            this.fsm.add('ChangeDirection', new Barbarian.HeroStates.ChangeDirection(this), ['Idle', 'Walk', 'Run', 'Flee']);
            this.fsm.add('HitWall', new Barbarian.HeroStates.HitWall(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('UseLadder', new Barbarian.HeroStates.UseLadder(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('TakeStairs', new Barbarian.HeroStates.TakeStairs(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('Run', new Barbarian.HeroStates.Run(this), ['Idle', 'Walk']);
            this.fsm.add('Attack', new Barbarian.HeroStates.Attack(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('TripFall', new Barbarian.HeroStates.TripFall(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('Fall', new Barbarian.HeroStates.Fall(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('FallDeath', new Barbarian.HeroStates.FallDeath(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('Die', new Barbarian.HeroStates.Die(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('FrontFlip', new Barbarian.HeroStates.FrontFlip(this), ['Run']);
            this.fsm.add('PickUp', new Barbarian.HeroStates.PickUp(this), ['Idle']);
            this.fsm.add('SwitchWeapon', new Barbarian.HeroStates.SwitchWeapon(this), ['Idle']);
            this.fsm.add('Flee', new Barbarian.HeroStates.Flee(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.transition('Idle');
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
                tileX = this.facing == Direction.Right ? (this.x >> Barbarian.TILE_SHIFT) - 1 : (this.x >> Barbarian.TILE_SHIFT);
                tileX = tileX + (this.facing == Direction.Right ? adjustX : -adjustX);
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
                return parts.filter(function (part) { return part.flags < 5 || (part.flags >> 4) == _this.inventory.activeWeapon; });
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
                if (this.keys.down.isDown || input.buttonsState & Barbarian.Input.Buttons.Down) {
                    this.direction = Direction.Down;
                    this.fsm.transition('TakeStairs');
                    return false;
                }
            }
            else if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsUpOptional)) {
                if (this.keys.up.isDown || input.buttonsState & Barbarian.Input.Buttons.Up) {
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
        Hero.prototype.checkWeaponSwitch = function () {
            var newWeapon = this.inventory.activeWeapon;
            if (this.keys.sword.isDown) {
                newWeapon = Weapon.Sword;
            }
            else if (this.keys.bow.isDown) {
                newWeapon = Weapon.Bow;
            }
            else if (this.keys.shield.isDown) {
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
        Hero.prototype.update = function () {
            var input = this.game.inputManager;
            this.checkWeaponSwitch();
            if (input.buttonsState & Barbarian.Input.Buttons.Flee) {
                this.fsm.transition('Flee');
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
            else if (this.keys.jump.isDown) {
                if (this.tileMap.isAbleToJump()) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('FrontFlip');
                    }
                    else {
                        this.fsm.transition('Jump');
                    }
                }
                else {
                    this.fsm.transition('Idle');
                }
            }
            if (this.facing == Direction.Right) {
                if (this.keys.right.isDown || input.buttonsState & Barbarian.Input.Buttons.Right) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('Run');
                    }
                    else {
                        this.fsm.transition('Walk');
                    }
                }
                else if (this.keys.left.isDown || input.buttonsState & Barbarian.Input.Buttons.Left)
                    this.fsm.transition('ChangeDirection');
            }
            else if (this.facing == Direction.Left) {
                if (this.keys.left.isDown || input.buttonsState & Barbarian.Input.Buttons.Left) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('Run');
                    }
                    else {
                        this.fsm.transition('Walk');
                    }
                }
                else if (this.keys.right.isDown || input.buttonsState & Barbarian.Input.Buttons.Right)
                    this.fsm.transition('ChangeDirection');
            }
            if (this.keys.down.isDown || input.buttonsState & Barbarian.Input.Buttons.Down) {
                if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderTop)) {
                    this.fsm.transition('UseLadder');
                }
                else {
                    this.fsm.transition('PickUp');
                }
            }
            else if (this.keys.up.isDown || input.buttonsState & Barbarian.Input.Buttons.Up) {
                if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderBottom)) {
                    this.fsm.transition('UseLadder');
                }
            }
            if (!input.buttonsState) {
                this.fsm.transition('Stop');
            }
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Barbarian.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Barbarian.FIXED_TIMESTEP;
                this.animate();
                this.fsm.update();
            }
            this.render();
        };
        Hero.prototype.getBodyBounds = function () {
            var bounds;
            if (this.facing == Direction.Right)
                bounds = new Phaser.Rectangle(this.x - 32, this.y - 80, 32, 80);
            else
                bounds = new Phaser.Rectangle(this.x, this.y - 80, 32, 80);
            return bounds;
        };
        return Hero;
    }(Barbarian.Entity));
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
            };
            ChangeDirection.prototype.onUpdate = function () {
                switch (this.hero.frame) {
                    case 0:
                        this.hero.moveRelative(1, 0);
                        break;
                    case 1:
                        this.hero.moveRelative(-1, 0);
                        break;
                    case 2:
                        this.hero.moveRelative(1, 0);
                        break;
                    case 3:
                        this.hero.moveRelative(1, 0);
                        break;
                    case 4:
                        this.hero.fsm.transition('Idle', true);
                        break;
                }
            };
            ChangeDirection.prototype.onLeave = function () {
                this.hero.moveRelative(-3, 0);
                if (this.hero.facing == Barbarian.Direction.Left) {
                    this.hero.direction = this.hero.facing = Barbarian.Direction.Right;
                }
                else {
                    this.hero.direction = this.hero.facing = Barbarian.Direction.Left;
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
            };
            HitWall.prototype.onUpdate = function () {
                switch (this.hero.frame) {
                    case 0:
                        this.hero.moveRelative(1, 0);
                    case 1:
                        this.hero.moveRelative(-1, 0);
                        break;
                    case 2:
                        this.hero.moveRelative(-1, 0);
                        break;
                    case 3:
                        this.hero.moveRelative(1, 0);
                        break;
                    case 8:
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
                switch (this.hero.frame) {
                    case 0:
                        this.hero.moveRelative(2, 0);
                        break;
                    case 2:
                        this.hero.moveRelative(2, -1);
                        break;
                    case 3:
                        this.hero.moveRelative(2, -1);
                        break;
                    case 4:
                        this.hero.moveRelative(2, -1);
                        break;
                    case 5:
                        this.hero.moveRelative(2, 1);
                        break;
                    case 6:
                        this.hero.moveRelative(2, 1);
                        break;
                    case 7:
                        this.hero.moveRelative(2, 1);
                        break;
                    case 8:
                        this.hero.moveRelative(1, 0);
                        this.hero.fsm.transition('Idle');
                        break;
                }
                this.hero.checkMovement();
            };
            Jump.prototype.onLeave = function () {
                this.hero.moveRelative(1, 0);
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
                switch (this.hero.frame) {
                    case 0:
                        this.hero.moveRelative(0, 0);
                        break;
                    case 1:
                        this.hero.moveRelative(0, 0);
                        break;
                    case 2:
                        this.hero.moveRelative(1, -1);
                        break;
                    case 3:
                        this.hero.moveRelative(2, -1);
                        break;
                    case 4:
                        this.hero.moveRelative(2, -1);
                        break;
                    case 5:
                        this.hero.moveRelative(2, 0);
                        break;
                    case 6:
                        this.hero.moveRelative(2, 1);
                        break;
                    case 7:
                        this.hero.moveRelative(2, 1);
                        break;
                    case 8:
                        this.hero.moveRelative(1, 1);
                        break;
                    case 9:
                        this.hero.moveRelative(0, 0);
                        break;
                    case 10:
                        this.hero.fsm.transition('Idle');
                        break;
                }
            };
            return FrontFlip;
        }(HeroBaseState));
        HeroStates.FrontFlip = FrontFlip;
        var TakeStairs = (function (_super) {
            __extends(TakeStairs, _super);
            function TakeStairs() {
                _super.apply(this, arguments);
            }
            TakeStairs.prototype.onEnter = function () {
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
                    this.hero.fsm.transition('Idle');
                }
                else if (this.hero.direction == Barbarian.Direction.Down && this.hero.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsBottom)) {
                    this.hero.fsm.transition('Idle');
                }
            };
            TakeStairs.prototype.onLeave = function () {
                if (this.hero.direction == Barbarian.Direction.Up) {
                    this.hero.moveRelative(1, 1);
                }
                else if (this.hero.direction == Barbarian.Direction.Down) {
                    this.hero.moveRelative(1, 0);
                }
                if (this.hero.facing == Barbarian.Direction.Right)
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
                if (this.hero.facing == Barbarian.Direction.Left)
                    this.hero.moveRelative(-1, 0);
                this.hero.facing = Barbarian.Direction.Right;
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
                        this.hero.setAnimation(Barbarian.Animations.WaitForArrow);
                        this.arrow = new Barbarian.Arrow(this.hero);
                        this.hero.game.world.add(this.arrow);
                        this.hero.inventory.numArrows--;
                        this.waitForArrow = true;
                    }
                    else {
                        this.hero.fsm.transition('Idle');
                    }
                }
                else if (this.hero.frame == this.hero.animData[this.hero.animNum].frames.length - 1) {
                    this.animDone = true;
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
                }
            };
            return PickUp;
        }(HeroBaseState));
        HeroStates.PickUp = PickUp;
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
                this.hero.setAnimation(Barbarian.Animations.TripFall);
                this.animDone = false;
                this.hero.direction = Barbarian.Direction.Down;
                this.hero.moveRelative(-1, 0);
            };
            TripFall.prototype.onUpdate = function () {
                switch (this.hero.frame) {
                    case 0:
                        this.hero.moveRelative(2, 0);
                        break;
                    case 1:
                        this.hero.moveRelative(1, 0);
                        break;
                    case 2:
                        this.hero.moveRelative(1, 1);
                        break;
                    case 3:
                        this.hero.moveRelative(2, 1);
                        break;
                    case 4:
                        this.hero.moveRelative(0, 1);
                        this.animDone = true;
                        break;
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
                this.hero.direction = this.hero.facing;
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
                else {
                    this.animDone = true;
                }
            };
            FallDeath.prototype.onLeave = function () {
                this.hero.direction = this.hero.facing;
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
                this.hero.direction = this.hero.facing;
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
                if (this.hero.facing == Barbarian.Direction.Left) {
                    this.hero.facing = Barbarian.Direction.Right;
                    this.hero.direction = Barbarian.Direction.Right;
                }
                else {
                    this.hero.facing = Barbarian.Direction.Left;
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
            Buttons[Buttons["A"] = 16] = "A";
            Buttons[Buttons["B"] = 32] = "B";
            Buttons[Buttons["Flee"] = 64] = "Flee";
            Buttons[Buttons["Attack"] = 128] = "Attack";
            Buttons[Buttons["Jump"] = 256] = "Jump";
            Buttons[Buttons["Stop"] = 512] = "Stop";
        })(Input.Buttons || (Input.Buttons = {}));
        var Buttons = Input.Buttons;
        Input.NumIcons = 16;
        (function (Icon) {
            Icon[Icon["Left"] = 0] = "Left";
            Icon[Icon["Up"] = 1] = "Up";
            Icon[Icon["Down"] = 2] = "Down";
            Icon[Icon["Right"] = 3] = "Right";
            Icon[Icon["Stop"] = 4] = "Stop";
            Icon[Icon["Jump"] = 5] = "Jump";
            Icon[Icon["Run"] = 6] = "Run";
            Icon[Icon["Attack"] = 7] = "Attack";
            Icon[Icon["Defend"] = 8] = "Defend";
            Icon[Icon["Flee"] = 9] = "Flee";
            Icon[Icon["Get"] = 10] = "Get";
            Icon[Icon["Use"] = 11] = "Use";
            Icon[Icon["Drop"] = 12] = "Drop";
            Icon[Icon["Sword"] = 13] = "Sword";
            Icon[Icon["Bow"] = 14] = "Bow";
            Icon[Icon["Shield"] = 15] = "Shield";
            Icon[Icon["None"] = 16] = "None";
        })(Input.Icon || (Input.Icon = {}));
        var Icon = Input.Icon;
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
        var HudState = (function () {
            function HudState(iconsSelected, iconState) {
                this.iconsState = new Array(Input.NumIcons);
                this.iconState2 = 0;
                this.iconState2 = iconState;
                for (var i = 0; i < Input.NumIcons; i++) {
                    this.iconsState[i] = iconsSelected.indexOf(i) == -1 ? false : true;
                }
            }
            HudState.prototype.isIconSelected = function (icon) {
                return this.iconsState[icon];
            };
            HudState.prototype.isButtonSelected = function (button) {
                return (this.iconState2 & button) > 0;
            };
            return HudState;
        }());
        Input.HudState = HudState;
        var KeyboardState = (function () {
            function KeyboardState() {
                this.controlState = new Array(25);
            }
            KeyboardState.GetState = function (game) {
                var keyboardState = new KeyboardState();
                keyboardState.controlState[ControlCodes.F1] = game.input.keyboard.isDown(Phaser.KeyCode.F1);
                keyboardState.controlState[ControlCodes.F2] = game.input.keyboard.isDown(Phaser.KeyCode.F2);
                keyboardState.controlState[ControlCodes.F3] = game.input.keyboard.isDown(Phaser.KeyCode.F3);
                keyboardState.controlState[ControlCodes.F4] = game.input.keyboard.isDown(Phaser.KeyCode.F4);
                keyboardState.controlState[ControlCodes.F5] = game.input.keyboard.isDown(Phaser.KeyCode.F5);
                keyboardState.controlState[ControlCodes.F6] = game.input.keyboard.isDown(Phaser.KeyCode.F6);
                keyboardState.controlState[ControlCodes.F7] = game.input.keyboard.isDown(Phaser.KeyCode.F7);
                keyboardState.controlState[ControlCodes.F8] = game.input.keyboard.isDown(Phaser.KeyCode.F8);
                keyboardState.controlState[ControlCodes.F9] = game.input.keyboard.isDown(Phaser.KeyCode.F9);
                keyboardState.controlState[ControlCodes.F10] = game.input.keyboard.isDown(Phaser.KeyCode.F10);
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
            ControlDirection.fromInput = function (keyboardState, hudState) {
                var direction = ControlDirection.None;
                if (keyboardState.isKeyDown(ControlCodes.UP) || hudState.isButtonSelected(Buttons.Up) || hudState.isIconSelected(Icon.Up)) {
                    direction |= ControlDirection.Up;
                }
                else if (keyboardState.isKeyDown(ControlCodes.DOWN) || hudState.isButtonSelected(Buttons.Down) || hudState.isIconSelected(Icon.Down)) {
                    direction |= ControlDirection.Down;
                }
                if (keyboardState.isKeyDown(ControlCodes.LEFT) || hudState.isButtonSelected(Buttons.Left) || hudState.isIconSelected(Icon.Left)) {
                    direction |= ControlDirection.Left;
                }
                else if (keyboardState.isKeyDown(ControlCodes.RIGHT) || hudState.isButtonSelected(Buttons.Right) || hudState.isIconSelected(Icon.Right)) {
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
            ControlDirection.Any = ControlDirection.Up | ControlDirection.Down | ControlDirection.Left | ControlDirection.Right;
            return ControlDirection;
        }());
        Input.ControlDirection = ControlDirection;
        var InputManager = (function () {
            function InputManager(game, hud) {
                this.lastInputTime = 0;
                this.nonDirectionButtons = {};
                this.game = game;
                this.hud = hud;
                this.game.input.keyboard.addKeyCapture([
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
                ]);
                this.buttonBuffer = new Array(InputManager.BUFFER_SIZE);
                this.keyboardState = KeyboardState.GetState(this.game);
                this.hudState = this.hud.getState();
                this.nonDirectionButtons[Buttons.Stop.toString()] = { button: Buttons.Stop, controlKey: ControlCodes.F5, icon: Icon.Stop };
                this.nonDirectionButtons[Buttons.Jump.toString()] = { button: Buttons.Jump, controlKey: ControlCodes.F6, icon: Icon.Jump };
                this.nonDirectionButtons[Buttons.Attack.toString()] = { button: Buttons.Attack, controlKey: ControlCodes.F8, icon: Icon.Attack };
                this.nonDirectionButtons[Buttons.Flee.toString()] = { button: Buttons.Flee, controlKey: ControlCodes.F10, icon: Icon.Flee };
            }
            InputManager.prototype.update = function (gameTime) {
                this.lastKeyboardState = this.keyboardState;
                this.lastHudState = this.hudState;
                this.keyboardState = KeyboardState.GetState(this.game);
                this.hudState = this.hud.getState();
                if (this.lastKeyboardState.isKeyUp(ControlCodes.F1) && this.keyboardState.isKeyDown(ControlCodes.F1))
                    console.log('F1 pressed.');
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
                        || (!this.lastHudState.isIconSelected(icon) && this.hudState.isIconSelected(icon))) {
                        buttons |= button;
                    }
                }
                var mergeInput = (this.buttonBuffer.length > 0 && timeSinceLast < InputManager.mergeInputTime);
                var direction = ControlDirection.fromInput(this.keyboardState, this.hudState);
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
            this.game.level = new Barbarian.Level(this.game, this.cache.getJSON('rooms'), 0x00);
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
                _this.drawRoom(Barbarian.Direction.None);
            }, this);
        };
        Play.prototype.drawRoom = function (direction) {
            this.world.removeAll();
            this.background.clear();
            for (var _i = 0, _a = this.game.level.currentRoom.area; _i < _a.length; _i++) {
                var obj = _a[_i];
                if (obj.flags !== 5) {
                    var spr;
                    spr = this.make.sprite(obj.xOff, obj.yOff, 'area', obj.imageId);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = obj.flags & 1 ? -1 : 1;
                    var yScale = obj.flags & 2 ? -1 : 1;
                    spr.scale.setTo(xScale, yScale);
                    this.background.draw(spr, spr.x, spr.y);
                }
                else {
                    this.background.rect(obj.xOff, obj.yOff, Barbarian.TILE_SIZE * obj.unknown, Barbarian.TILE_SIZE, '#000');
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
            else if (this.game.hero.x <= -16 && this.game.hero.direction == Barbarian.Direction.Left) {
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
            if (this.game.hero.keys.fast.isDown) {
                Barbarian.FIXED_TIMESTEP -= 1;
                if (Barbarian.FIXED_TIMESTEP < 1)
                    Barbarian.FIXED_TIMESTEP = 1;
                Barbarian.FRAMERATE = 1000 / Barbarian.FIXED_TIMESTEP;
                console.log(Barbarian.FIXED_TIMESTEP.toString());
            }
            else if (this.game.hero.keys.slow.isDown) {
                Barbarian.FIXED_TIMESTEP += 1;
                if (Barbarian.FIXED_TIMESTEP > 999)
                    Barbarian.FIXED_TIMESTEP = 999;
                Barbarian.FRAMERATE = 1000 / Barbarian.FIXED_TIMESTEP;
                console.log(Barbarian.FIXED_TIMESTEP.toString());
            }
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
                this.game.debug.text(this.game.hero.tileMap.getTile(), 20, 40);
                for (var i = 0; i < 40; i++)
                    for (var j = 0; j < 20; j++)
                        this.game.debug.rectangle(new Phaser.Rectangle(i * Barbarian.TILE_SIZE, j * Barbarian.TILE_SIZE, Barbarian.TILE_SIZE, Barbarian.TILE_SIZE), null, false);
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
    (function (IconBitFlags) {
        IconBitFlags[IconBitFlags["Stop"] = 0] = "Stop";
        IconBitFlags[IconBitFlags["Up"] = 1] = "Up";
        IconBitFlags[IconBitFlags["Down"] = 2] = "Down";
        IconBitFlags[IconBitFlags["Right"] = 4] = "Right";
        IconBitFlags[IconBitFlags["Left"] = 8] = "Left";
        IconBitFlags[IconBitFlags["Attack"] = 16] = "Attack";
        IconBitFlags[IconBitFlags["Jump"] = 32] = "Jump";
        IconBitFlags[IconBitFlags["Run"] = 64] = "Run";
    })(Barbarian.IconBitFlags || (Barbarian.IconBitFlags = {}));
    var IconBitFlags = Barbarian.IconBitFlags;
    var Hud = (function (_super) {
        __extends(Hud, _super);
        function Hud(game, key, x, y) {
            _super.call(this, game);
            this.primaryVisible = true;
            this.weaponIcons = [];
            this.heroIcons = [];
            this.iconsSelected = new Array(Barbarian.Input.NumIcons);
            this.iconSelected = Barbarian.Input.Icon.None;
            this.iconState = 0;
            this.x = x;
            this.y = y;
            this.primaryHud = this.create(0, 0, key, 'ICON-06.PNG');
            this.primaryHud.inputEnabled = true;
            this.primaryHud.events.onInputDown.add(this.onPressed, this);
            this.secondaryHud = this.create(640, 0, key, 'ICON-07.PNG');
            this.secondaryHud.crop(new Phaser.Rectangle(0, 0, 240, 80), true);
            this.secondaryHud.inputEnabled = true;
            this.weaponIcons[Barbarian.Weapon.Sword] = this.create(640 + 3 * 80, 0, key, 'ICON-03.PNG');
            this.weaponIcons[Barbarian.Weapon.Bow] = this.create(640 + 4 * 80, 0, key, 'ICON-04.PNG');
            this.weaponIcons[Barbarian.Weapon.Shield] = this.create(640 + 5 * 80, 0, key, 'ICON-05.PNG');
            for (var i = 0; i < 3; i++) {
                this.heroIcons[i] = this.create(640 + 544 + i * 32, 0, 'hud', 'ICON-01.PNG');
            }
            var toggleKey = this.game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
            toggleKey.onDown.add(this.toggle, this);
        }
        Hud.prototype.getState = function () {
            var state = this.iconSelected != Barbarian.Input.Icon.None ? [this.iconSelected] : [];
            if (this.iconSelected != Barbarian.Input.Icon.Left && this.iconSelected != Barbarian.Input.Icon.Right)
                this.iconSelected = Barbarian.Input.Icon.None;
            return new Barbarian.Input.HudState([], this.iconState);
        };
        Hud.prototype.onPressed = function (sprite, pointer) {
            console.log('Icon pressed x: ' + pointer.x + ' y: ' + pointer.y);
            var bounds = new Phaser.Rectangle(560, 320, 80, 80);
            if (pointer.x >= 560 && pointer.x < 640)
                this.iconSelected = Barbarian.Input.Icon.Flee;
            else if (pointer.x >= 400 && pointer.x < 480)
                this.iconSelected = Barbarian.Input.Icon.Attack;
            else if (pointer.x >= 240 && pointer.x < 320)
                this.iconSelected = Barbarian.Input.Icon.Jump;
            else if (pointer.x >= 160 && pointer.x < 240) {
                this.iconSelected = Barbarian.Input.Icon.Stop;
                this.iconState = Hud.None;
            }
            else if (pointer.x >= 0 && pointer.x < 40) {
                this.iconSelected = Barbarian.Input.Icon.Left;
                this.iconState = Hud.Left | (this.iconState & Hud.UpDown);
            }
            else if (pointer.x >= 120 && pointer.x < 160) {
                this.iconSelected = Barbarian.Input.Icon.Right;
                this.iconState = Hud.Right | (this.iconState & Hud.UpDown);
            }
            else if (pointer.x >= 40 && pointer.x < 120) {
                if (pointer.y >= 320 && pointer.y < 360) {
                    this.iconSelected = Barbarian.Input.Icon.Up;
                    this.iconState = Hud.Up | (this.iconState & Hud.LeftRight);
                }
                else {
                    this.iconSelected = Barbarian.Input.Icon.Down;
                    this.iconState = Hud.Down | (this.iconState & Hud.LeftRight);
                }
            }
            else {
                this.iconSelected = this.iconSelected;
                this.iconState = this.iconState;
            }
            console.log(this.iconState);
        };
        Hud.prototype.update = function () {
            this.forEach(function (part) { if (part.animations.currentFrame.name.startsWith("DIGIT")) {
                part.kill();
            } }, this);
            this.render();
        };
        Hud.prototype.toggle = function () {
            this.primaryVisible = !this.primaryVisible;
            this.x = this.primaryVisible ? 0 : -640;
        };
        Hud.prototype.render = function () {
            this.renderTimer();
            this.renderArrowCount(this.game.hero.inventory.numArrows);
            this.renderWeaponIcons();
            this.renderLives();
        };
        Hud.prototype.renderLives = function () {
            this.heroIcons.forEach(function (icon) {
                icon.visible = false;
            });
            for (var i = 0; i < this.game.lives && i < 3; i++) {
                this.heroIcons[i].visible = true;
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
        Hud.None = 0;
        Hud.Up = 1;
        Hud.Down = 2;
        Hud.Right = 4;
        Hud.Left = 8;
        Hud.UpLeft = Hud.Up | Hud.Left;
        Hud.UpRight = Hud.Up | Hud.Right;
        Hud.DownLeft = Hud.Down | Hud.Left;
        Hud.DownRight = Hud.Down | Hud.Right;
        Hud.UpDown = Hud.Up | Hud.Down;
        Hud.LeftRight = Hud.Left | Hud.Right;
        Hud.Any = Hud.Up | Hud.Down | Hud.Left | Hud.Right;
        return Hud;
    }(Phaser.Group));
    Barbarian.Hud = Hud;
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
    var Arrow = (function (_super) {
        __extends(Arrow, _super);
        function Arrow(hero) {
            var _this = this;
            _super.call(this, hero.game, hero.x, hero.y - 64, 'hero', 128);
            this.velocity = hero.facing == Barbarian.Direction.Left ? -Barbarian.TILE_SIZE * 2 : Barbarian.TILE_SIZE * 2;
            this.scale.x = hero.facing == Barbarian.Direction.Left ? -1 : 1;
            this.x += this.velocity * 2;
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
            var tile = this.entity.game.level.currentRoom
                .layout[position.y].rowData
                .substring(position.x, position.x + 1);
            return tile;
        };
        TileMap.prototype.isAbleToJump = function () {
            var position = this.entity.getTileMapPosition();
            if (position.x == -1 || position.y == -1)
                return false;
            var tileMapRow = this.entity.game.level.currentRoom.layout[position.y - 1].rowData;
            var relativeMovement = this.entity.facing == Barbarian.Direction.Right ? 1 : -1;
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