/// <reference path="../entity.ts" />

namespace Barbarian.Enemies {

    export enum EnemyKeys {
        nll,
        axe,
        thr,
        pop,
        dog,
        hop,
        rep,
        aro,
        met,
        ren,
        ver,
        bad,
        roc,
        ape,
        scy,
        rhi,
        mn1,
        mn2,
        mn3,
        mn4,
        mn5,
        mn6,
        mn7,
        mor,
        oc1,
        oc2,
        nt1,
        nt2,
        nt3,
        ac1,
        ac2,
        ac3,
        blk,
        spk,
        stn,
        dra,
        rot,
        vsp
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

            this.render();
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
                case EnemyKeys.rot:
                    return new Rotate(game, data, direction);
                case EnemyKeys.scy:
                    return new Scythe(game, data, direction);
                case EnemyKeys.blk:
                    return new Block(game, data, direction);
                case EnemyKeys.spk:
                    return new Spikes(game, data, direction);
                case EnemyKeys.mn1:
                case EnemyKeys.mn2:
                case EnemyKeys.mn3:
                case EnemyKeys.mn4:
                case EnemyKeys.mn5:
                case EnemyKeys.mn6:
                case EnemyKeys.mn7:
                case EnemyKeys.ape:
                case EnemyKeys.oc1:
                case EnemyKeys.oc2:
                case EnemyKeys.nt1:
                case EnemyKeys.nt2:
                case EnemyKeys.nt3:
                    return new Man(game, data, direction);
                default:
                    return new Enemy(game, data, direction);
            }
        }

        get currentParts() {
            // TODO: Fix this for NLLSPR so I don't have to do this check.
            if (this.dataBlob.id === EnemyKeys.nll)
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
            //this.game.world.add(new Ghost(this.game, this));
            var ghost: Phaser.Sprite = this.game.add.sprite(this.x, this.y - TILE_SIZE, 'misc');
            var xAnchor = this.facing == Direction.Left ? 0 : 1;
            ghost.anchor.setTo(xAnchor, 1);
            var deathAnim: Phaser.Animation = ghost.animations.add('rise', [20, 21, 22, 21, 20, 23, 24, 25, 26, 27], 1000/FIXED_TIMESTEP, false, true);

            deathAnim.killOnComplete = true;
            deathAnim.enableUpdate = true;
            deathAnim.onUpdate.add(() => {
                ghost.y -= TILE_SIZE;
            }, this, 0, ghost);
            ghost.animations.play('rise');
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

                if (this.dataBlob.id == EnemyKeys.thr)
                    this.animNum = 1;

                this.animate();
            

            
            this.render();

        }

        

    }

    

}