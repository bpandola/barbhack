/// <reference path="../entity.ts" />
/// <reference path="../game.ts" />
namespace Barbarian.Enemies {

    export enum EnemyKeys {
        NLL,
        AXE,
        THR,
        POP,
        DOG,
        HOP,
        REP,
        ARO,
        MET,
        REN,
        VER,
        BAD,
        ROC,
        APE,
        SCY,
        RHI,
        MN1,
        MN2,
        MN3,
        MN4,
        MN5,
        MN6,
        MN7,
        MOR,
        OC1,
        OC2,
        NT1,
        NT2,
        NT3,
        AC1,
        AC2,
        AC3,
        BLK,
        SPK,
        STN,
        DRA,
        ROT,
        VSP,
        misc
    }

    // Encapsulates Enemy JSON Blob
    export interface EnemyJSON {
        id: number;
        yOff: number;
        xMin: number;
        xMax: number;
        xOff: number[];
        flags: number[];
    }

    export class Enemy extends Entity {

        tilePos: Phaser.Point = new Phaser.Point();
        public animNum: number;
        frame: number;
        animData: any;
        
        game: Barbarian.Game;
      
        dataBlob: EnemyJSON;
        

        constructor(game: Barbarian.Game, dataBlob: EnemyJSON, direction: Direction) {
            super(game, EnemyKeys[dataBlob.id]);

            this.dataBlob = dataBlob;
            
            this.x = dataBlob.xOff[direction+1];
            this.y = dataBlob.yOff;

            this.animData = this.game.cache.getJSON('enemies')[dataBlob.id].animations;
            this.animNum = 0;
            this.frame = 0;

            this.direction = direction;
            
            this.facing = this.dataBlob.flags[this.direction + 1] ? Direction.Left : Direction.Right;

            // Make sure we update right away
            this.timeStep = FIXED_TIMESTEP;

            //this.render();
        }

        /**
        * Factory Method for Enemy Creation
        *  
        * @param game A reference to the currently running game.
        * @param data A structure defining the enemy metadata.
        * @param direction The direction the player entered the current room, which determines enemy placement/facing direction.
        * @return The newly-created Enemy object.
        */
        public static createEnemy(game: Barbarian.Game, data: EnemyJSON, direction: Direction): Enemy {
            switch (data.id) {
                case EnemyKeys.ROT:
                    return new Rotate(game, data, direction);
                case EnemyKeys.SCY:
                    return new Scythe(game, data, direction);
                case EnemyKeys.BLK:
                    return new Block(game, data, direction);
                case EnemyKeys.SPK:
                    return new Spikes(game, data, direction);
                case EnemyKeys.POP:
                    return new Pop(game, data, direction);
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
                    return new Man(game, data, direction);
                default:
                    return new Enemy(game, data, direction);
            }
        }

        get currentParts() {
            // TODO: Fix this for NLLSPR so I don't have to do this check.
            if (this.dataBlob.id === EnemyKeys.NLL)
                return [];
            return this.animData[this.animNum].frames[this.frame].parts;
        }

        get isKillable(): boolean {
            return this.dataBlob.xMin > 0
                && this.dataBlob.xMax > 0
                && this.children.length > 0
                && this.alive;
        }

        kill() {
            //this.game.world.add(new Ghost(this));
            this.game.world.add(new Spirit(this));
            this.destroy();
        }

        animate() {

            if (this.animData.length === 0)
                return;

            var numFrames = this.animData[this.animNum].frames.length;

            this.frame++;

            if (this.frame >= numFrames)
                this.frame = 0;
        }

        tick() {
      
         

            

                if (this.dataBlob.xMin > 0 && this.dataBlob.xMax > 0) {
                    //this.x += TILE_SIZE;
                    //if (this.x > this.dataBlob.xMax)
                    //    this.x = this.dataBlob.xMin;

                    if (this.game.hero.y == this.y) {
                        var delta = this.game.hero.x - this.x;
                        if (Math.abs(delta) < 320 && Math.abs(delta) > TILE_SIZE * 2) {
                            if (delta < 0) {
                                this.x -= TILE_SIZE;
                            } else {
                                this.x += TILE_SIZE;
                            }
                            this.animNum = 1;
                        } else if (Math.abs(delta) > 0 && Math.abs(delta) <= TILE_SIZE * 2) {
                            //this.animNum = 2;
                        } else {
                            this.animNum = 0;
                        }
                    
                    } else {
                        this.animNum = 0;
                    }

                    if (this.x < this.game.hero.x)
                        this.facing = Direction.Right;
                    else
                        this.facing = Direction.Left;

                    if (this.x < this.dataBlob.xMin)
                        this.x = this.dataBlob.xMin;
                    if (this.x > this.dataBlob.xMax)
                        this.x = this.dataBlob.xMax;

                    
                }

                if (this.dataBlob.id == EnemyKeys.THR)
                    this.animNum = 1;

                this.animate();
            

            
            this.render();

        }

        

    }

    

}