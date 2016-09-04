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
    Barbarian.FIXED_TIMESTEP = 1000;
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 640, 400, Phaser.CANVAS, 'game', null);
            this.roomNum = 0;
            this.debugOn = true;
            this.state.add('Boot', new Barbarian.Boot());
            this.state.add('Layout', new Barbarian.Layout());
            this.state.start('Boot', true, true, 'Layout');
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
        (function (EnemyKeys) {
            EnemyKeys[EnemyKeys["nll"] = 0] = "nll";
            EnemyKeys[EnemyKeys["axe"] = 1] = "axe";
            EnemyKeys[EnemyKeys["thr"] = 2] = "thr";
            EnemyKeys[EnemyKeys["pop"] = 3] = "pop";
            EnemyKeys[EnemyKeys["dog"] = 4] = "dog";
            EnemyKeys[EnemyKeys["hop"] = 5] = "hop";
            EnemyKeys[EnemyKeys["rep"] = 6] = "rep";
            EnemyKeys[EnemyKeys["aro"] = 7] = "aro";
            EnemyKeys[EnemyKeys["met"] = 8] = "met";
            EnemyKeys[EnemyKeys["ren"] = 9] = "ren";
            EnemyKeys[EnemyKeys["ver"] = 10] = "ver";
            EnemyKeys[EnemyKeys["bad"] = 11] = "bad";
            EnemyKeys[EnemyKeys["roc"] = 12] = "roc";
            EnemyKeys[EnemyKeys["ape"] = 13] = "ape";
            EnemyKeys[EnemyKeys["scy"] = 14] = "scy";
            EnemyKeys[EnemyKeys["rhi"] = 15] = "rhi";
            EnemyKeys[EnemyKeys["mn1"] = 16] = "mn1";
            EnemyKeys[EnemyKeys["mn2"] = 17] = "mn2";
            EnemyKeys[EnemyKeys["mn3"] = 18] = "mn3";
            EnemyKeys[EnemyKeys["mn4"] = 19] = "mn4";
            EnemyKeys[EnemyKeys["mn5"] = 20] = "mn5";
            EnemyKeys[EnemyKeys["mn6"] = 21] = "mn6";
            EnemyKeys[EnemyKeys["mn7"] = 22] = "mn7";
            EnemyKeys[EnemyKeys["mor"] = 23] = "mor";
            EnemyKeys[EnemyKeys["oc1"] = 24] = "oc1";
            EnemyKeys[EnemyKeys["oc2"] = 25] = "oc2";
            EnemyKeys[EnemyKeys["nt1"] = 26] = "nt1";
            EnemyKeys[EnemyKeys["nt2"] = 27] = "nt2";
            EnemyKeys[EnemyKeys["nt3"] = 28] = "nt3";
            EnemyKeys[EnemyKeys["ac1"] = 29] = "ac1";
            EnemyKeys[EnemyKeys["ac2"] = 30] = "ac2";
            EnemyKeys[EnemyKeys["ac3"] = 31] = "ac3";
            EnemyKeys[EnemyKeys["blk"] = 32] = "blk";
            EnemyKeys[EnemyKeys["spk"] = 33] = "spk";
            EnemyKeys[EnemyKeys["stn"] = 34] = "stn";
            EnemyKeys[EnemyKeys["dra"] = 35] = "dra";
            EnemyKeys[EnemyKeys["rot"] = 36] = "rot";
            EnemyKeys[EnemyKeys["vsp"] = 37] = "vsp";
        })(Enemies.EnemyKeys || (Enemies.EnemyKeys = {}));
        var EnemyKeys = Enemies.EnemyKeys;
        var Enemy = (function (_super) {
            __extends(Enemy, _super);
            function Enemy(game, dataBlob, direction) {
                _super.call(this, game);
                this.tilePos = new Phaser.Point();
                this.timeStep = 0;
                this.dataBlob = dataBlob;
                this.x = dataBlob.xOff[direction + 1];
                this.y = dataBlob.yOff;
                this.animData = this.game.cache.getJSON('enemies')[dataBlob.id].animations;
                this.animNum = 0;
                this.frame = 0;
                this.direction = direction;
                this.rotate = this.dataBlob.flags[this.direction + 1];
                this.timeStep = Enemy.FIXED_TIMESTEP;
                this.drawEnemy();
            }
            Enemy.createEnemy = function (game, data, direction) {
                switch (data.id) {
                    case EnemyKeys.rot:
                        return new Enemies.Rotate(game, data, direction);
                    case EnemyKeys.scy:
                        return new Enemies.Scythe(game, data, direction);
                    case EnemyKeys.blk:
                        return new Enemies.Block(game, data, direction);
                    default:
                        return new Enemy(game, data, direction);
                }
            };
            Enemy.prototype.animate = function () {
                if (this.animData.length === 0)
                    return;
                var numFrames = this.animData[this.animNum].frames.length;
                this.frame++;
                if (this.frame >= numFrames)
                    this.frame = 0;
            };
            Enemy.prototype.update = function () {
                this.timeStep += this.game.time.elapsedMS;
                if (this.timeStep >= Enemy.FIXED_TIMESTEP) {
                    this.timeStep = this.timeStep % Enemy.FIXED_TIMESTEP;
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
                            this.rotate = 0;
                        else
                            this.rotate = 1;
                        if (this.x < this.dataBlob.xMin)
                            this.x = this.dataBlob.xMin;
                        if (this.x > this.dataBlob.xMax)
                            this.x = this.dataBlob.xMax;
                    }
                    if (this.dataBlob.id == EnemyKeys.thr)
                        this.animNum = 1;
                    this.animate();
                }
                this.drawEnemy();
            };
            Enemy.prototype.drawEnemy = function () {
                if (this.dataBlob.id === EnemyKeys.nll)
                    return;
                this.removeChildren();
                for (var _i = 0, _a = this.animData[this.animNum].frames[this.frame].parts; _i < _a.length; _i++) {
                    var part = _a[_i];
                    var x = this.rotate ? part.rx : part.x;
                    var y = this.rotate ? part.ry : part.y;
                    var spr = this.create(x, y, EnemyKeys[this.dataBlob.id], part.index);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = part.flags & 1 ? -1 : 1;
                    var yScale = part.flags & 2 ? -1 : 1;
                    xScale = this.rotate ? -xScale : xScale;
                    spr.scale.setTo(xScale, yScale);
                }
            };
            Enemy.FIXED_TIMESTEP = Barbarian.FIXED_TIMESTEP;
            return Enemy;
        }(Phaser.Group));
        Enemies.Enemy = Enemy;
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
            Block.prototype.update = function () {
                this.timeStep += this.game.time.elapsedMS;
                if (this.timeStep >= Enemies.Enemy.FIXED_TIMESTEP) {
                    this.timeStep = this.timeStep % Enemies.Enemy.FIXED_TIMESTEP;
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
                }
                this.drawEnemy();
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
            Rotate.prototype.update = function () {
                this.timeStep += this.game.time.elapsedMS;
                if (this.timeStep >= Enemies.Enemy.FIXED_TIMESTEP) {
                    this.timeStep = this.timeStep % Enemies.Enemy.FIXED_TIMESTEP;
                    var heroBounds = this.game.hero.getBodyBounds();
                    var thisBounds = this.getBounds();
                    if (Phaser.Rectangle.intersects(heroBounds, thisBounds)) {
                        this.game.hero.fsm.transition('FallDeath');
                    }
                    this.animate();
                }
                this.drawEnemy();
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
            Scythe.prototype.update = function () {
                this.timeStep += this.game.time.elapsedMS;
                if (this.timeStep >= Enemies.Enemy.FIXED_TIMESTEP) {
                    this.timeStep = this.timeStep % Enemies.Enemy.FIXED_TIMESTEP;
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
                                this.game.hero.fsm.transition('TripFall');
                            }
                        }
                    }
                }
                this.drawEnemy();
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
                if (this.currentState != null && !this.isValidFrom(newState))
                    return;
                if (this.pendingState == null)
                    this.pendingState = newState;
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
                    this.currentState.onEnter();
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
            return StateMachine;
        }());
        StateMachine_1.StateMachine = StateMachine;
    })(StateMachine = Barbarian.StateMachine || (Barbarian.StateMachine = {}));
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
        Animations[Animations["Idle1"] = 12] = "Idle1";
        Animations[Animations["Idle2"] = 13] = "Idle2";
        Animations[Animations["Attack1"] = 14] = "Attack1";
        Animations[Animations["Attack2"] = 15] = "Attack2";
        Animations[Animations["Attack3"] = 16] = "Attack3";
        Animations[Animations["Attack4"] = 17] = "Attack4";
        Animations[Animations["Attack5"] = 18] = "Attack5";
        Animations[Animations["Attack6"] = 19] = "Attack6";
        Animations[Animations["ShootArrow"] = 22] = "ShootArrow";
        Animations[Animations["HitWall"] = 24] = "HitWall";
        Animations[Animations["FallToGround"] = 28] = "FallToGround";
        Animations[Animations["FallToGroundFaceFirst"] = 31] = "FallToGroundFaceFirst";
        Animations[Animations["HitGround"] = 34] = "HitGround";
        Animations[Animations["Falling"] = 36] = "Falling";
        Animations[Animations["TripFall"] = 37] = "TripFall";
        Animations[Animations["FrontFlip"] = 39] = "FrontFlip";
        Animations[Animations["Idle"] = 43] = "Idle";
    })(Barbarian.Animations || (Barbarian.Animations = {}));
    var Animations = Barbarian.Animations;
    (function (Weapon) {
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
    var Hero = (function (_super) {
        __extends(Hero, _super);
        function Hero(game, tileX, tileY) {
            _super.call(this, game);
            this.tilePos = new Phaser.Point();
            this.onDied = new Phaser.Signal();
            this.timeStep = 0;
            this.tilePos.setTo(tileX, tileY);
            this.x = tileX << Barbarian.TILE_SHIFT;
            this.y = tileY << Barbarian.TILE_SHIFT;
            this.animData = this.game.cache.getJSON('hero');
            this.weapon = Weapon.Sword;
            this.direction = Direction.Right;
            this.facing = Direction.Right;
            this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT, 'jump': Phaser.KeyCode.SPACEBAR });
            this.game.input.keyboard.addKeyCapture([Phaser.KeyCode.UP, Phaser.KeyCode.DOWN, Phaser.KeyCode.LEFT, Phaser.KeyCode.RIGHT, Phaser.KeyCode.SHIFT, Phaser.KeyCode.ALT, Phaser.KeyCode.SPACEBAR]);
            this.fsm = new Barbarian.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new Barbarian.HeroStates.Idle(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('Walk', new Barbarian.HeroStates.Walk(this), ['Idle', 'Run']);
            this.fsm.add('Jump', new Barbarian.HeroStates.Jump(this), ['Idle']);
            this.fsm.add('Stop', new Barbarian.HeroStates.Stop(this), ['Walk', 'Run']);
            this.fsm.add('ChangeDirection', new Barbarian.HeroStates.ChangeDirection(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('HitWall', new Barbarian.HeroStates.HitWall(this), ['Walk', 'Run']);
            this.fsm.add('UseLadder', new Barbarian.HeroStates.UseLadder(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('TakeStairs', new Barbarian.HeroStates.TakeStairs(this), ['Walk', 'Run']);
            this.fsm.add('Run', new Barbarian.HeroStates.Run(this), ['Idle', 'Walk']);
            this.fsm.add('Attack', new Barbarian.HeroStates.Attack(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('TripFall', new Barbarian.HeroStates.TripFall(this), ['Walk', 'Run']);
            this.fsm.add('Fall', new Barbarian.HeroStates.Fall(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('FallDeath', new Barbarian.HeroStates.FallDeath(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('Die', new Barbarian.HeroStates.Die(this), [Barbarian.StateMachine.WILDCARD]);
            this.fsm.add('FrontFlip', new Barbarian.HeroStates.FrontFlip(this), ['Run']);
            this.fsm.transition('Idle');
            this.render();
        }
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
        Hero.prototype.moveRelative = function (numTilesX, numTilesY) {
            var xMovement = this.facing == Direction.Right ? Barbarian.TILE_SIZE : -Barbarian.TILE_SIZE;
            var yMovement = this.direction == Direction.Up ? -Barbarian.TILE_SIZE : Barbarian.TILE_SIZE;
            this.x += xMovement * numTilesX;
            this.y += yMovement * numTilesY;
        };
        Hero.prototype.checkMovement = function () {
            switch (this.tileMap.getTile()) {
                case '3':
                    this.fsm.transition('HitWall', true);
                    return false;
                case '/':
                    if (this.direction != Direction.Down) {
                        this.fsm.transition('TripFall');
                        return false;
                    }
                    break;
                case '5':
                case '!':
                    if (this.direction == Direction.Down) {
                        this.fsm.transition('FallDeath');
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
                if (this.keys.down.isDown) {
                    this.direction = Direction.Down;
                    this.fsm.transition('TakeStairs');
                    return false;
                }
            }
            else if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.StairsUpOptional)) {
                if (this.keys.up.isDown) {
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
        Hero.prototype.update = function () {
            if (this.keys.attack.isDown) {
                this.fsm.transition('Attack');
            }
            if (this.keys.jump.isDown) {
                if (this.keys.shift.isDown) {
                    this.fsm.transition('FrontFlip');
                }
                else {
                    this.fsm.transition('Jump');
                }
            }
            if (this.facing == Direction.Right) {
                if (this.keys.right.isDown) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('Run');
                    }
                    else {
                        this.fsm.transition('Walk');
                    }
                }
                else if (this.keys.left.isDown)
                    this.fsm.transition('ChangeDirection');
            }
            else if (this.facing == Direction.Left) {
                if (this.keys.left.isDown) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('Run');
                    }
                    else {
                        this.fsm.transition('Walk');
                    }
                }
                else if (this.keys.right.isDown)
                    this.fsm.transition('ChangeDirection');
            }
            if (this.keys.down.isDown) {
                if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderTop)) {
                    this.fsm.transition('UseLadder');
                }
            }
            else if (this.keys.up.isDown) {
                if (this.tileMap.isEntityAt(Barbarian.TileMapLocation.LadderBottom)) {
                    this.fsm.transition('UseLadder');
                }
            }
            if (!this.keys.left.isDown && !this.keys.right.isDown) {
                this.fsm.transition('Stop');
            }
            console.log(this.fsm.getCurrentStateName);
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Hero.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Hero.FIXED_TIMESTEP;
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
        Hero.prototype.render = function () {
            this.removeChildren();
            for (var _i = 0, _a = this.animData[this.animNum].frames[this.frame].parts; _i < _a.length; _i++) {
                var part = _a[_i];
                var weapon = part.flags >> 4;
                if (part.flags < 5 || weapon == this.weapon) {
                    var x = this.facing == Direction.Left ? part.rx : part.x;
                    var y = this.facing == Direction.Left ? part.ry : part.y;
                    var spr = this.create(x, y, 'hero', part.index);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = part.flags & 1 ? -1 : 1;
                    var yScale = part.flags & 2 ? -1 : 1;
                    xScale = this.facing == Direction.Left ? -xScale : xScale;
                    spr.scale.setTo(xScale, yScale);
                }
            }
        };
        Hero.FIXED_TIMESTEP = Barbarian.FIXED_TIMESTEP;
        return Hero;
    }(Phaser.Group));
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
                this.idleAnims = [Barbarian.Animations.Idle, Barbarian.Animations.Idle, Barbarian.Animations.Idle, Barbarian.Animations.Idle1, Barbarian.Animations.Idle1, Barbarian.Animations.Idle2, Barbarian.Animations.Idle];
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
                        this.hero.fsm.transition('Idle');
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
                this.animDone = false;
            }
            Attack.prototype.onEnter = function () {
                if (this.hero.weapon === Barbarian.Weapon.Bow)
                    this.hero.setAnimation(Barbarian.Animations.ShootArrow);
                else
                    this.hero.setAnimation(this.hero.game.rnd.integerInRange(Barbarian.Animations.Attack1, Barbarian.Animations.Attack6));
                this.animDone = false;
            };
            Attack.prototype.onUpdate = function () {
                if (this.hero.frame == 0 && this.animDone == true) {
                    this.hero.fsm.transition('Idle');
                }
                else {
                    this.animDone = true;
                }
            };
            return Attack;
        }(HeroBaseState));
        HeroStates.Attack = Attack;
        var TripFall = (function (_super) {
            __extends(TripFall, _super);
            function TripFall() {
                _super.apply(this, arguments);
                this.animDone = false;
            }
            TripFall.prototype.onEnter = function () {
                this.hero.setAnimation(Barbarian.Animations.TripFall);
                this.hero.moveRelative(1, 0);
                this.animDone = false;
                this.hero.direction == Barbarian.Direction.Down;
            };
            TripFall.prototype.onUpdate = function () {
                switch (this.hero.frame) {
                    case 1:
                        this.hero.moveRelative(1, 0);
                        break;
                    case 2:
                        this.hero.moveRelative(1, 0);
                        break;
                    case 3:
                        this.hero.moveRelative(0, 1);
                        break;
                    case 4:
                        break;
                }
                if (this.hero.frame == 0 && this.animDone) {
                    this.hero.fsm.transition('Fall');
                }
                else {
                    this.animDone = true;
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
                if (this.hero.checkMovement()) {
                    this.hero.moveRelative(0, 1);
                }
            };
            FallDeath.prototype.onUpdate = function () {
                if (this.hero.frame == 0 && this.animDone) {
                    this.hero.frame = 3;
                    this.hero.onDied.dispatch();
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
            };
            Die.prototype.onUpdate = function () {
                if (this.hero.frame == 0 && this.animDone) {
                    this.hero.frame = this.hero.animData[this.hero.animNum].frames.length - 1;
                    this.hero.onDied.dispatch();
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
    })(HeroStates = Barbarian.HeroStates || (Barbarian.HeroStates = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var Layout = (function (_super) {
        __extends(Layout, _super);
        function Layout() {
            _super.apply(this, arguments);
        }
        Layout.prototype.preload = function () {
            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
            this.load.atlasJSONArray('misc', 'assets/miscspr.png', 'assets/miscspr.json');
            this.load.atlasJSONArray('hero', 'assets/hero.png', 'assets/hero.json');
            this.load.json('hero', 'assets/heroanims.json');
            this.load.image('hud', 'assets/hud.png');
            this.load.json('enemies', 'assets/enemyanims.json');
            for (var i = 0; i < 38; i++) {
                var key = Barbarian.Enemies.EnemyKeys[i];
                this.load.atlasJSONArray(key, 'assets/enemies/' + key + '.png', 'assets/enemies/' + key + '.json');
            }
        };
        Layout.prototype.create = function () {
            this.roomsJSON = this.cache.getJSON('rooms');
            this.stage.smoothed = false;
            this.drawRoom(Barbarian.Direction.Right);
            this.changeFrameRate = this.input.keyboard.addKeys({ 'fast': Phaser.KeyCode.PLUS, 'slow': Phaser.KeyCode.MINUS });
            var startPos = this.roomsJSON[this.game.roomNum].startPos;
            this.game.hero = new Barbarian.Hero(this.game, startPos.tileX, startPos.tileY);
            this.game.hero.tileMap = new Barbarian.TileMap(this.game.hero);
            this.game.hero.onDied.add(this.heroDied, this);
            var hud = this.make.image(0, 320, 'hud');
            this.stage.addChild(hud);
        };
        Layout.prototype.createEffect = function (x, y, name) {
            var effect = this.add.sprite(x, y, 'misc');
            switch (name) {
                case 'bat':
                    effect.animations.add(name, [33, 34], 4, true, true);
                    var tween = this.game.add.tween(effect).to({ x: this.world.width }, 6000, Phaser.Easing.Linear.None, true, 1000);
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
                    var tween = this.game.add.tween(effect).to({ y: 320 }, 1500, Phaser.Easing.Exponential.In, true);
                    tween.repeat(-1, 1000);
                    break;
            }
            if (name != 'blood_drip') {
                effect.animations.play(name);
            }
        };
        Layout.prototype.heroDied = function () {
            var _this = this;
            this.game.time.events.add(Phaser.Timer.SECOND / 2, function () {
                var newRoom = _this.game.roomNum;
                var startPos = _this.roomsJSON[newRoom].startPos;
                while (startPos.tileX == 0 || startPos.tileY == 0) {
                    newRoom--;
                    startPos = _this.roomsJSON[newRoom].startPos;
                }
                _this.game.hero.x = startPos.tileX << Barbarian.TILE_SHIFT;
                _this.game.hero.y = startPos.tileY << Barbarian.TILE_SHIFT;
                _this.game.hero.fsm.transition('Idle', true);
                _this.game.roomNum = newRoom;
                _this.drawRoom(Barbarian.Direction.None);
                _this.world.add(_this.game.hero);
                _this.game.time.reset();
            }, this);
        };
        Layout.prototype.nextRoom = function (direction) {
            var newRoom;
            switch (direction) {
                case Barbarian.Direction.Left:
                    newRoom = this.roomsJSON[this.game.roomNum].map.left;
                    break;
                case Barbarian.Direction.Right:
                    newRoom = this.roomsJSON[this.game.roomNum].map.right;
                    break;
                case Barbarian.Direction.Up:
                    newRoom = this.roomsJSON[this.game.roomNum].map.up;
                    break;
                case Barbarian.Direction.Down:
                    newRoom = this.roomsJSON[this.game.roomNum].map.down;
                    break;
            }
            if (newRoom !== -1) {
                this.game.roomNum = newRoom;
                this.drawRoom(direction);
                this.world.add(this.game.hero);
            }
        };
        Layout.prototype.drawRoom = function (direction) {
            this.world.removeAll();
            var background = this.add.bitmapData(640, 320);
            for (var _i = 0, _a = this.roomsJSON[this.game.roomNum].area; _i < _a.length; _i++) {
                var o = _a[_i];
                var obj = o;
                var spr;
                if (obj.flags !== 5) {
                    spr = this.make.sprite(obj.xOff, obj.yOff, 'area', obj.imageId);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = obj.flags & 1 ? -1 : 1;
                    var yScale = obj.flags & 2 ? -1 : 1;
                    spr.scale.setTo(xScale, yScale);
                    background.draw(spr, spr.x, spr.y);
                }
                else {
                    background.rect(obj.xOff, obj.yOff, Barbarian.TILE_SIZE * obj.unknown, Barbarian.TILE_SIZE, '#000');
                }
            }
            background.addToWorld(0, 0);
            for (var _b = 0, _c = this.roomsJSON[this.game.roomNum].effects; _b < _c.length; _b++) {
                var effect = _c[_b];
                this.createEffect(effect.x, effect.y, effect.name);
            }
            this.enemies = [];
            for (var _d = 0, _e = this.roomsJSON[this.game.roomNum].enemies; _d < _e.length; _d++) {
                var enemy = _e[_d];
                var createdEnemy = Barbarian.Enemies.Enemy.createEnemy(this.game, enemy, direction);
                this.world.add(createdEnemy);
                this.enemies.push(createdEnemy);
            }
            for (var _f = 0, _g = this.roomsJSON[this.game.roomNum].items; _f < _g.length; _f++) {
                var item = _g[_f];
                var spr;
                var imageId;
                if (item.id == 1)
                    imageId = 5;
                else if (item.id == 2)
                    imageId = 4;
                else
                    imageId = 2;
                spr = this.add.sprite(item.x, item.y, 'misc', imageId);
                spr.x -= spr.width / 2;
                spr.y -= spr.height - 2;
            }
        };
        Layout.prototype.handleMovement = function () {
            if (this.game.hero.x >= this.world.width + Barbarian.TILE_SIZE && this.game.hero.direction == Barbarian.Direction.Right) {
                this.nextRoom(Barbarian.Direction.Right);
                this.game.hero.x = 0;
                this.game.hero.tilePos.x = 0;
            }
            else if (this.game.hero.x <= -16 && this.game.hero.direction == Barbarian.Direction.Left) {
                this.nextRoom(Barbarian.Direction.Left);
                this.game.hero.x = 640;
                this.game.hero.tilePos.x = 39;
            }
            else if (this.game.hero.y <= 0 && this.game.hero.direction == Barbarian.Direction.Up) {
                this.nextRoom(Barbarian.Direction.Up);
                this.game.hero.y = 320;
                this.game.hero.tilePos.y = 19;
            }
            else if (this.game.hero.y >= this.world.height - (Barbarian.TILE_SIZE * 1.5)) {
                this.nextRoom(Barbarian.Direction.Down);
                this.game.hero.y = Barbarian.TILE_SIZE;
                this.game.hero.tilePos.y = 1;
            }
        };
        Layout.prototype.update = function () {
            this.handleMovement();
            if (this.changeFrameRate.fast.isDown) {
                console.log('faster');
                Barbarian.Hero.FIXED_TIMESTEP -= 5;
            }
            else if (this.changeFrameRate.slow.isDown) {
                console.log('slower');
                Barbarian.Hero.FIXED_TIMESTEP += 5;
            }
        };
        Layout.prototype.render = function () {
            if (this.game.debugOn) {
                this.game.debug.text(this.game.roomNum.toString(), 20, 20);
                this.game.debug.text(this.game.hero.tileMap.getTile(), 20, 40);
                for (var i = 0; i < 40; i++)
                    for (var j = 0; j < 20; j++)
                        this.game.debug.rectangle(new Phaser.Rectangle(i * Barbarian.TILE_SIZE, j * Barbarian.TILE_SIZE, Barbarian.TILE_SIZE, Barbarian.TILE_SIZE), null, false);
                var dumbAdjust = this.game.hero.direction == Barbarian.Direction.Right ? -Barbarian.TILE_SIZE : 0;
                this.game.debug.rectangle(new Phaser.Rectangle(this.game.hero.x + dumbAdjust, this.game.hero.y - Barbarian.TILE_SIZE, Barbarian.TILE_SIZE, Barbarian.TILE_SIZE), "green", true);
                this.game.debug.pixel(this.game.hero.x, this.game.hero.y, 'rgba(0,255,255,1)');
                var bounds = this.game.hero.getBodyBounds();
                this.game.debug.rectangle(new Phaser.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
                for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
                    var enemy = _a[_i];
                    if (enemy != null) {
                        bounds = enemy.getBounds();
                        this.game.debug.rectangle(new Phaser.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
                    }
                }
            }
        };
        return Layout;
    }(Phaser.State));
    Barbarian.Layout = Layout;
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
            var tile = this.entity.game.cache.getJSON('rooms')[this.entity.game.roomNum]
                .layout[position.y].rowData
                .substring(position.x, position.x + 1);
            return tile;
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
            var tileMapRow = this.entity.game.cache.getJSON('rooms')[this.entity.game.roomNum].layout[position.y].rowData;
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