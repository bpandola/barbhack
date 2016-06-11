var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Barbarian;
(function (Barbarian) {
    Barbarian.SCALE = 2;
    Barbarian.TILE_SIZE = 16;
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 640, 400, Phaser.CANVAS, 'game', null);
            this.roomNum = 0;
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
    var StateMachine;
    (function (StateMachine_1) {
        var StateMachine = (function () {
            function StateMachine(hero) {
                this.states = [];
                this.currentState = null;
                this.hero = hero;
            }
            StateMachine.prototype.add = function (key, state) {
                this.states[key] = state;
            };
            StateMachine.prototype.transition = function (newState) {
                if (this.currentState)
                    this.currentState.onLeave();
                this.currentState = this.states[newState];
                this.currentStateName = newState;
                this.currentState.onEnter();
                this.hero.game.time.events.remove(this.hero.animTimer);
                this.hero.animTimer = this.hero.game.time.events.loop(Barbarian.Hero.ANIMATION_INTERVAL, this.hero.animate, this.hero);
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
        Animations[Animations["HitGround"] = 28] = "HitGround";
        Animations[Animations["Falling"] = 36] = "Falling";
        Animations[Animations["TripFall"] = 37] = "TripFall";
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
            this.currentTile = "?";
            this.tilePos.setTo(tileX, tileY);
            this.x = tileX << 4;
            this.y = (tileY) << 4;
            this.animData = this.game.cache.getJSON('hero');
            this.weapon = Weapon.Sword;
            this.direction = Direction.Right;
            this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT });
            this.fsm = new Barbarian.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new Barbarian.HeroStates.Idle(this));
            this.fsm.add('Walk', new Barbarian.HeroStates.Walk(this));
            this.fsm.add('ChangeDirection', new Barbarian.HeroStates.ChangeDirection(this));
            this.fsm.add('HitWall', new Barbarian.HeroStates.HitWall(this));
            this.fsm.add('UpStairs', new Barbarian.HeroStates.UpStairs(this));
            this.fsm.add('DownStairs', new Barbarian.HeroStates.DownStairs(this));
            this.fsm.add('DownLadder', new Barbarian.HeroStates.DownLadder(this));
            this.fsm.add('UpLadder', new Barbarian.HeroStates.UpLadder(this));
            this.fsm.add('Run', new Barbarian.HeroStates.Run(this));
            this.fsm.add('Attack', new Barbarian.HeroStates.Attack(this));
            this.fsm.add('TripFall', new Barbarian.HeroStates.TripFall(this));
            this.fsm.add('Fall', new Barbarian.HeroStates.Fall(this));
            this.fsm.transition('Idle');
            this.drawHero();
        }
        Hero.prototype.previousPreviousTile = function () {
            if (this.x < 0 || this.x >= 640 || this.y < 0 || this.y >= 320)
                return '?';
            var tileX = this.direction == Direction.Right ? (this.x >> 4) - 3 : (this.x >> 4) + 2;
            var tileY = (this.y >> 4) - 1;
            var tile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[tileY].rowData
                .substring(tileX, tileX + 1);
            return tile;
        };
        Hero.prototype.previousTile = function () {
            if (this.x < 0 || this.x >= 640 || this.y < 0 || this.y >= 320)
                return '?';
            var tileX = this.direction == Direction.Right ? (this.x >> 4) - 2 : (this.x >> 4) + 1;
            var tileY = (this.y >> 4) - 1;
            var tile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[tileY].rowData
                .substring(tileX, tileX + 1);
            return tile;
        };
        Hero.prototype.getTile = function (adjustX, adjustY) {
            if (adjustX == null) {
                adjustX = 0;
            }
            if (adjustY == null) {
                adjustY = 0;
            }
            if (this.x < Hero.TILE_SIZE || this.x >= 640 || this.y < Hero.TILE_SIZE || this.y >= 320)
                return '?';
            var tileX = this.direction == Direction.Right ? (this.x >> 4) - 1 : (this.x >> 4);
            var tileY = (this.y >> 4) - 1;
            this.currentTile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[tileY + adjustY].rowData
                .substring(tileX + adjustX, tileX + adjustX + 1);
            return this.currentTile;
        };
        Hero.prototype.checkMovement = function () {
            var adjust = this.direction == Direction.Right ? -1 : 0;
            var tile = this.getTile();
            switch (tile) {
                case '3':
                    this.fsm.transition('HitWall');
                    return;
            }
            switch (this.previousTile()) {
                case '3':
                case 'A':
                case 'G':
                    if (this.previousPreviousTile() == '%')
                        this.fsm.transition('UpStairs');
                    break;
                case 'H':
                case 'B':
                    if (this.previousPreviousTile() == '$')
                        this.fsm.transition('DownStairs');
                    break;
                case 'E':
                    if (this.direction == Direction.Left && this.keys.down.isDown)
                        this.fsm.transition('DownStairs');
                    break;
                case 'D':
                    if (this.direction == Direction.Right && this.keys.up.isDown)
                        this.fsm.transition('UpStairs');
                    break;
                case 'J':
                    if (this.previousPreviousTile() == '(')
                        if (this.direction == Direction.Left && this.keys.up.isDown)
                            this.fsm.transition('UpStairs');
                    break;
            }
        };
        Hero.prototype.animate = function () {
            var numFrames = this.animData[this.animNum].frames.length;
            this.frame++;
            if (this.frame >= numFrames)
                this.frame = 0;
            this.fsm.getCurrentState().onFrameChange();
            this.drawHero();
        };
        Hero.prototype.update = function () {
            this.fsm.getCurrentState().onUpdate();
            this.drawHero();
        };
        Hero.prototype.drawHero = function () {
            this.removeChildren();
            for (var _i = 0, _a = this.animData[this.animNum].frames[this.frame].parts; _i < _a.length; _i++) {
                var part = _a[_i];
                var weapon = part.flags >> 4;
                if (part.flags < 5 || weapon == this.weapon) {
                    var x = this.direction == Direction.Left ? part.rx : part.x;
                    var y = this.direction == Direction.Left ? part.ry : part.y;
                    var spr = this.create(x, y, 'hero', part.index);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = part.flags & 1 ? -1 : 1;
                    var yScale = part.flags & 2 ? -1 : 1;
                    xScale = this.direction == Direction.Left ? -xScale : xScale;
                    spr.scale.setTo(xScale, yScale);
                }
            }
        };
        Hero.ANIMATION_INTERVAL = 170;
        Hero.TILE_SIZE = 16;
        return Hero;
    }(Phaser.Group));
    Barbarian.Hero = Hero;
})(Barbarian || (Barbarian = {}));
var FSM = Barbarian.StateMachine;
var Hero = Barbarian.Hero;
var Barbarian;
(function (Barbarian) {
    var HeroStates;
    (function (HeroStates) {
        var Idle = (function () {
            function Idle(hero) {
                this.hero = hero;
            }
            Idle.prototype.onEnter = function () {
                this.hero.animNum = 43;
                this.hero.frame = 0;
            };
            Idle.prototype.onUpdate = function () {
                if (this.hero.keys.attack.isDown) {
                    this.hero.fsm.transition('Attack');
                    return;
                }
                if (this.hero.direction == Barbarian.Direction.Right) {
                    if (this.hero.keys.right.isDown) {
                        if (this.hero.keys.shift.isDown) {
                            this.hero.fsm.transition('Run');
                        }
                        else {
                            this.hero.fsm.transition('Walk');
                        }
                    }
                    else if (this.hero.keys.left.isDown)
                        this.hero.fsm.transition('ChangeDirection');
                }
                else if (this.hero.direction == Barbarian.Direction.Left) {
                    if (this.hero.keys.left.isDown)
                        this.hero.fsm.transition('Walk');
                    else if (this.hero.keys.right.isDown)
                        this.hero.fsm.transition('ChangeDirection');
                }
                if (this.hero.keys.down.isDown) {
                    if ("*+,".indexOf(this.hero.getTile()) != -1) {
                        this.hero.fsm.transition('DownLadder');
                    }
                }
                else if (this.hero.keys.up.isDown) {
                    if ("-+.".indexOf(this.hero.getTile()) != -1) {
                        this.hero.fsm.transition('UpLadder');
                    }
                }
            };
            Idle.prototype.onFrameChange = function () {
                if (this.hero.frame == 0) {
                    this.hero.animNum = this.hero.game.rnd.weightedPick([43, 43, 43, 12, 12, 13, 43]);
                    this.hero.frame = 0;
                }
            };
            Idle.prototype.onLeave = function () {
            };
            return Idle;
        }());
        HeroStates.Idle = Idle;
        var Walk = (function () {
            function Walk(hero) {
                this.hero = hero;
            }
            Walk.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.Walk;
                this.hero.frame = 0;
                if (this.hero.direction == Barbarian.Direction.Right)
                    this.hero.x += Barbarian.Hero.TILE_SIZE;
                else
                    this.hero.x -= Barbarian.Hero.TILE_SIZE;
                this.hero.checkMovement();
            };
            Walk.prototype.onUpdate = function () {
                if (this.hero.direction == Barbarian.Direction.Left && this.hero.keys.right.isDown) {
                    this.hero.fsm.transition('ChangeDirection');
                }
                else if (this.hero.direction == Barbarian.Direction.Right && this.hero.keys.left.isDown) {
                    this.hero.fsm.transition('ChangeDirection');
                }
                else if (!this.hero.keys.left.isDown && !this.hero.keys.right.isDown) {
                    this.hero.fsm.transition('Idle');
                }
            };
            Walk.prototype.onFrameChange = function () {
                if (this.hero.direction == Barbarian.Direction.Right)
                    this.hero.x += Barbarian.Hero.TILE_SIZE;
                else
                    this.hero.x -= Barbarian.Hero.TILE_SIZE;
                this.hero.checkMovement();
            };
            Walk.prototype.onLeave = function () {
            };
            return Walk;
        }());
        HeroStates.Walk = Walk;
        var Run = (function () {
            function Run(hero) {
                this.hero = hero;
            }
            Run.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.Run;
                this.hero.frame = 0;
                if (this.hero.direction == Barbarian.Direction.Right)
                    this.hero.x += Barbarian.Hero.TILE_SIZE << 1;
                else
                    this.hero.x -= Barbarian.Hero.TILE_SIZE << 1;
                this.hero.checkMovement();
            };
            Run.prototype.onUpdate = function () {
                if (this.hero.direction == Barbarian.Direction.Left && this.hero.keys.right.isDown) {
                    this.hero.fsm.transition('ChangeDirection');
                }
                else if (this.hero.direction == Barbarian.Direction.Right && this.hero.keys.left.isDown) {
                    this.hero.fsm.transition('ChangeDirection');
                }
                else if (!this.hero.keys.left.isDown && !this.hero.keys.right.isDown) {
                    this.hero.fsm.transition('Idle');
                }
            };
            Run.prototype.onFrameChange = function () {
                if (this.hero.direction == Barbarian.Direction.Right)
                    this.hero.x += Barbarian.Hero.TILE_SIZE << 1;
                else
                    this.hero.x -= Barbarian.Hero.TILE_SIZE << 1;
                this.hero.checkMovement();
            };
            Run.prototype.onLeave = function () {
            };
            return Run;
        }());
        HeroStates.Run = Run;
        var ChangeDirection = (function () {
            function ChangeDirection(hero) {
                this.hero = hero;
            }
            ChangeDirection.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.ChangeDirection;
                this.hero.frame = 0;
            };
            ChangeDirection.prototype.onUpdate = function () {
            };
            ChangeDirection.prototype.onFrameChange = function () {
                var adjust = this.hero.direction == Barbarian.Direction.Right ? 1 : -1;
                switch (this.hero.frame) {
                    case 1:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 2:
                        this.hero.x -= (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 3:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 4:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 0:
                        this.hero.x -= (3 * adjust * Barbarian.Hero.TILE_SIZE);
                        this.hero.fsm.transition('Idle');
                        break;
                }
            };
            ChangeDirection.prototype.onLeave = function () {
                if (this.hero.direction == Barbarian.Direction.Left)
                    this.hero.direction = Barbarian.Direction.Right;
                else
                    this.hero.direction = Barbarian.Direction.Left;
            };
            return ChangeDirection;
        }());
        HeroStates.ChangeDirection = ChangeDirection;
        var HitWall = (function () {
            function HitWall(hero) {
                this.hero = hero;
            }
            HitWall.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.HitWall;
                this.hero.frame = 0;
            };
            HitWall.prototype.onUpdate = function () {
            };
            HitWall.prototype.onFrameChange = function () {
                var adjust = this.hero.direction == Barbarian.Direction.Left ? 1 : -1;
                switch (this.hero.frame) {
                    case 1:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 2:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 3:
                        this.hero.x -= (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 0:
                        this.hero.fsm.transition('Idle');
                        break;
                }
            };
            HitWall.prototype.onLeave = function () {
            };
            return HitWall;
        }());
        HeroStates.HitWall = HitWall;
        var UpStairs = (function () {
            function UpStairs(hero) {
                this.hero = hero;
            }
            UpStairs.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.UpStairs;
                this.hero.frame = 0;
            };
            UpStairs.prototype.onUpdate = function () {
            };
            UpStairs.prototype.onFrameChange = function () {
                if ('$&BHE'.indexOf(this.hero.getTile(0, -1)) != -1)
                    this.hero.fsm.transition('Idle');
                var adjust = this.hero.direction == Barbarian.Direction.Right ? 1 : -1;
                switch (this.hero.frame) {
                    case 1:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        this.hero.y -= Barbarian.Hero.TILE_SIZE;
                        break;
                    case 2:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 3:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        this.hero.y -= Barbarian.Hero.TILE_SIZE;
                        break;
                    case 0:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                }
            };
            UpStairs.prototype.onLeave = function () {
                this.hero.y -= Barbarian.Hero.TILE_SIZE;
            };
            return UpStairs;
        }());
        HeroStates.UpStairs = UpStairs;
        var DownStairs = (function () {
            function DownStairs(hero) {
                this.hero = hero;
            }
            DownStairs.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.DownStairs;
                this.hero.frame = 0;
            };
            DownStairs.prototype.onUpdate = function () {
            };
            DownStairs.prototype.onFrameChange = function () {
                if ('%AGDJ('.indexOf(this.hero.getTile(0, +1)) != -1)
                    this.hero.fsm.transition('Idle');
                var adjust = this.hero.direction == Barbarian.Direction.Right ? 1 : -1;
                switch (this.hero.frame) {
                    case 1:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        this.hero.y += Barbarian.Hero.TILE_SIZE;
                        break;
                    case 2:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                    case 3:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        this.hero.y += Barbarian.Hero.TILE_SIZE;
                        break;
                    case 0:
                        this.hero.x += (Barbarian.Hero.TILE_SIZE * adjust);
                        break;
                }
            };
            DownStairs.prototype.onLeave = function () {
                this.hero.y += Barbarian.Hero.TILE_SIZE;
                var move = this.hero.direction == Barbarian.Direction.Left ? -Barbarian.Hero.TILE_SIZE : Barbarian.Hero.TILE_SIZE;
                this.hero.x += move;
            };
            return DownStairs;
        }());
        HeroStates.DownStairs = DownStairs;
        var DownLadder = (function () {
            function DownLadder(hero) {
                this.hero = hero;
            }
            DownLadder.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.DownLadder;
                this.hero.frame = 0;
                var tile = this.hero.getTile();
                var adjust = 0;
                if (tile == '*')
                    adjust = 1;
                else if (tile == ',')
                    adjust = -1;
                else if (tile == '+')
                    adjust = 0;
                else {
                    this.hero.fsm.transition('Idle');
                    return;
                }
                this.hero.x += this.hero.direction == Barbarian.Direction.Right ? adjust * Barbarian.Hero.TILE_SIZE : -adjust * Barbarian.Hero.TILE_SIZE;
                this.hero.y += Barbarian.Hero.TILE_SIZE / 2;
                this.hero.direction = Barbarian.Direction.Down;
            };
            DownLadder.prototype.onUpdate = function () {
            };
            DownLadder.prototype.onFrameChange = function () {
                if (this.hero.getTile() == '.') {
                    this.hero.fsm.transition('Idle');
                    return;
                }
                switch (this.hero.frame) {
                    case 0:
                    case 1:
                    case 4:
                    case 5:
                        this.hero.y += Barbarian.Hero.TILE_SIZE / 2;
                        break;
                }
            };
            DownLadder.prototype.onLeave = function () {
                this.hero.direction = Barbarian.Direction.Right;
            };
            return DownLadder;
        }());
        HeroStates.DownLadder = DownLadder;
        var UpLadder = (function () {
            function UpLadder(hero) {
                this.hero = hero;
            }
            UpLadder.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.UpLadder;
                this.hero.frame = 0;
                var tile = this.hero.getTile();
                var adjust = 0;
                if (tile == '-')
                    adjust = 1;
                else if (tile == '.')
                    adjust = -1;
                else if (tile == '+')
                    adjust = 0;
                else {
                    this.hero.fsm.transition('Idle');
                    return;
                }
                this.hero.x += this.hero.direction == Barbarian.Direction.Right ? adjust * Barbarian.Hero.TILE_SIZE : -adjust * Barbarian.Hero.TILE_SIZE;
                this.hero.direction = Barbarian.Direction.Up;
            };
            UpLadder.prototype.onUpdate = function () {
            };
            UpLadder.prototype.onFrameChange = function () {
                if (this.hero.getTile() == ',') {
                    this.hero.fsm.transition('Idle');
                    return;
                }
                switch (this.hero.frame) {
                    case 2:
                    case 3:
                    case 6:
                    case 7:
                        this.hero.y -= Barbarian.Hero.TILE_SIZE / 2;
                        break;
                }
            };
            UpLadder.prototype.onLeave = function () {
                this.hero.y -= Barbarian.Hero.TILE_SIZE / 2;
                this.hero.direction = Barbarian.Direction.Right;
            };
            return UpLadder;
        }());
        HeroStates.UpLadder = UpLadder;
        var Attack = (function () {
            function Attack(hero) {
                this.hero = hero;
            }
            Attack.prototype.onEnter = function () {
                if (this.hero.weapon === Barbarian.Weapon.Bow)
                    this.hero.animNum = Barbarian.Animations.ShootArrow;
                else
                    this.hero.animNum = this.hero.game.rnd.integerInRange(Barbarian.Animations.Attack1, Barbarian.Animations.Attack6);
                this.hero.frame = 0;
            };
            Attack.prototype.onUpdate = function () {
            };
            Attack.prototype.onFrameChange = function () {
                if (this.hero.frame == 0) {
                    this.hero.fsm.transition('Idle');
                }
            };
            Attack.prototype.onLeave = function () {
            };
            return Attack;
        }());
        HeroStates.Attack = Attack;
        var TripFall = (function () {
            function TripFall(hero) {
                this.hero = hero;
            }
            TripFall.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.TripFall;
                this.hero.frame = 0;
                this.hero.x += Barbarian.Hero.TILE_SIZE;
            };
            TripFall.prototype.onUpdate = function () {
            };
            TripFall.prototype.onFrameChange = function () {
                switch (this.hero.frame) {
                    case 1:
                        this.hero.x += Barbarian.Hero.TILE_SIZE;
                        break;
                    case 2:
                        this.hero.x += Barbarian.Hero.TILE_SIZE;
                        break;
                    case 3:
                        this.hero.x += Barbarian.Hero.TILE_SIZE * 2;
                        break;
                    case 4:
                        this.hero.y += Barbarian.Hero.TILE_SIZE;
                        break;
                }
                if (this.hero.frame == 0) {
                    this.hero.fsm.transition('Fall');
                }
            };
            TripFall.prototype.onLeave = function () {
            };
            return TripFall;
        }());
        HeroStates.TripFall = TripFall;
        var Fall = (function () {
            function Fall(hero) {
                this.hero = hero;
            }
            Fall.prototype.onEnter = function () {
                this.hero.animNum = Barbarian.Animations.Falling;
                this.hero.frame = 0;
                this.hero.y += Barbarian.Hero.TILE_SIZE;
            };
            Fall.prototype.onUpdate = function () {
            };
            Fall.prototype.onFrameChange = function () {
                this.hero.y += Barbarian.Hero.TILE_SIZE;
                this.hero.checkMovement();
            };
            Fall.prototype.onLeave = function () {
                this.hero.y -= Barbarian.Hero.TILE_SIZE;
            };
            return Fall;
        }());
        HeroStates.Fall = Fall;
    })(HeroStates = Barbarian.HeroStates || (Barbarian.HeroStates = {}));
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
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
    })(Barbarian.EnemyKeys || (Barbarian.EnemyKeys = {}));
    var EnemyKeys = Barbarian.EnemyKeys;
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
                var key = EnemyKeys[i];
                this.load.atlasJSONArray(key, 'assets/enemies/' + key + '.png', 'assets/enemies/' + key + '.json');
            }
        };
        Layout.prototype.create = function () {
            this.roomsJSON = this.cache.getJSON('rooms');
            this.stage.smoothed = false;
            this.drawRoom(Barbarian.Direction.Right);
            this.changeFrameRate = this.input.keyboard.addKeys({ 'fast': Phaser.KeyCode.PLUS, 'slow': Phaser.KeyCode.MINUS });
            var tmp = 20 * Barbarian.SCALE;
            var startPos = this.roomsJSON[this.game.roomNum].startPos;
            this.hero = new Barbarian.Hero(this.game, startPos.tileX, startPos.tileY);
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
                this.world.add(this.hero);
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
            for (var _d = 0, _e = this.roomsJSON[this.game.roomNum].enemies; _d < _e.length; _d++) {
                var enemy = _e[_d];
                if (enemy.id !== 0) {
                    this.drawEnemy(enemy, direction);
                }
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
        Layout.prototype.drawEnemy = function (enemy, direction) {
            var animData = this.game.cache.getJSON('enemies');
            var sprGrp = this.add.group();
            sprGrp.x = enemy.xOff[direction + 1];
            sprGrp.y = enemy.yOff;
            var rotate = enemy.flags[direction + 1];
            for (var _i = 0, _a = animData[enemy.id].animations[0].frames[0].parts; _i < _a.length; _i++) {
                var part = _a[_i];
                var x = rotate ? part.rx : part.x;
                var y = rotate ? part.ry : part.y;
                var spr = sprGrp.create(x, y, EnemyKeys[enemy.id], part.index);
                spr.x += spr.width / 2;
                spr.y += spr.height / 2;
                spr.anchor.setTo(0.5);
                var xScale = part.flags & 1 ? -1 : 1;
                var yScale = part.flags & 2 ? -1 : 1;
                xScale = rotate ? -xScale : xScale;
                spr.scale.setTo(xScale, yScale);
            }
        };
        Layout.prototype.drawHeroOld = function () {
            var anims = this.cache.getJSON('hero');
            var tmpGroup = this.add.group();
            var animNum = 43;
            var numFrames = anims[animNum].frames.length;
            var width = 240;
            var height = 200;
            var bmd = this.add.bitmapData(width * numFrames, height);
            for (var i = 0; i < numFrames; i++) {
                for (var _i = 0, _a = anims[animNum].frames[i].parts; _i < _a.length; _i++) {
                    var part = _a[_i];
                    var weapon = part.flags >> 4;
                    if (part.flags < 5 || weapon == 2) {
                        var spr = tmpGroup.create(part.x + (i * width) + (width / 2), part.y + height, 'hero', part.index);
                        spr.x += spr.width / 2 - 2;
                        spr.y += spr.height / 2 - 2;
                        spr.anchor.setTo(0.5);
                        var xScale = part.flags & 1 ? -1 : 1;
                        var yScale = part.flags & 2 ? -1 : 1;
                        spr.scale.setTo(xScale, yScale);
                        bmd.drawGroup(tmpGroup);
                    }
                }
            }
        };
        Layout.prototype.preRender = function () {
        };
        Layout.prototype.handleMovement = function () {
            if (this.hero.x >= this.world.width + Barbarian.Hero.TILE_SIZE && this.hero.direction == Barbarian.Direction.Right) {
                this.nextRoom(Barbarian.Direction.Right);
                this.hero.x = 0;
                this.hero.tilePos.x = 0;
            }
            else if (this.hero.x <= -16 && this.hero.direction == Barbarian.Direction.Left) {
                this.nextRoom(Barbarian.Direction.Left);
                this.hero.x = 640;
                this.hero.tilePos.x = 39;
            }
            else if (this.hero.y <= 0 && this.hero.direction == Barbarian.Direction.Up) {
                this.nextRoom(Barbarian.Direction.Up);
                this.hero.y = 320;
                this.hero.tilePos.y = 19;
            }
            else if (this.hero.y >= this.world.height) {
                this.nextRoom(Barbarian.Direction.Down);
                this.hero.y = Barbarian.Hero.TILE_SIZE;
                this.hero.tilePos.y = 1;
            }
        };
        Layout.prototype.update = function () {
            this.handleMovement();
            if (this.changeFrameRate.fast.isDown)
                Barbarian.Hero.ANIMATION_INTERVAL -= 5;
            else if (this.changeFrameRate.slow.isDown)
                Barbarian.Hero.ANIMATION_INTERVAL += 5;
        };
        Layout.prototype.moveHero = function () {
        };
        Layout.prototype.render = function () {
        };
        return Layout;
    }(Phaser.State));
    Barbarian.Layout = Layout;
})(Barbarian || (Barbarian = {}));
var Barbarian;
(function (Barbarian) {
    var TileMap = (function () {
        function TileMap(layout) {
            this.tileData = [];
        }
        return TileMap;
    }());
    Barbarian.TileMap = TileMap;
})(Barbarian || (Barbarian = {}));
//# sourceMappingURL=barbutils.js.map