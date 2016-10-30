namespace Barbarian {

    export enum TileMapLocation {
        LadderTop,
        LadderBottom,
        StairsTop,
        StairsBottom,
        StairsUp,
        StairsUpOptional,
        StairsDown,
        StairsDownOptional
    }

    export interface TileMapEntity {
        game: Barbarian.Game;
        getTileMapPosition(adjustX?: number, adjustY?: number): Phaser.Point;
        moveRelative(numTilesX: number, numTilesY: number): void;
        facing: Direction;
    }

    export class TileMap {

        entity: TileMapEntity;

        constructor(entity: TileMapEntity) {
            this.entity = entity;
        }

        getTile(adjustX?: number, adjustY?: number): string {
            if (adjustX == null) { adjustX = 0 }
            if (adjustY == null) { adjustY = 0 }

            var position: Phaser.Point = this.entity.getTileMapPosition(adjustX, adjustY);

            if (position.x == -1 || position.y == -1)
                return '?';

            var tile = this.entity.game.level.currentRoom
                .layout[position.y].rowData
                .substring(position.x, position.x + 1);

            return tile;
        }

        isAbleToJump(): boolean {
            var position: Phaser.Point = this.entity.getTileMapPosition();

            if (position.x == -1 || position.y == -1)
                return false;

            // Get one row above entity because '#' is not on same row as entity.
            var tileMapRow: string = this.entity.game.level.currentRoom.layout[position.y-1].rowData;

            var relativeMovement = this.entity.facing == Direction.Right ? 1 : -1;

            for (var x = 0; x < 10; x++) {
                if (tileMapRow.charAt(position.x) === '#')
                    return false;

                position.x += relativeMovement;

                if (position.x < 0 || position.x > 39)
                    return true;
            }

            return true;
        }

        // Strings are pipe-delimited to ensure no false positives (e.g. %A%G would hit %A using the % from G...).
        isEntityAt(location: TileMapLocation): boolean {
            
            var searchString: string;

            switch (location) {
                case TileMapLocation.StairsTop:
                    return 'H$|B$|E&'.indexOf(this.getTile(0,-1) + this.getTile(1,-1)) != -1;
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

            var position: Phaser.Point = this.entity.getTileMapPosition();

            if (position.x == -1 || position.y == -1)
                return false;

            var tileMapRow: string = this.entity.game. level.currentRoom.layout[position.y].rowData;

            var index: number = 0;
            // Need to loop through all matches because sometimes there are multiple ladders on the same row.
            while (tileMapRow.indexOf(searchString, index) != -1) {
                
                index = tileMapRow.indexOf(searchString, index);
                if (position.x >= index && position.x <= index + searchString.length - 1)
                    return true;
                else
                    index++;
            }

            return false;
        }

        positionOnLadder() {
            var tile = this.getTile();

            var adjustX = 0;

            if (tile == '-' || tile == '*')
                adjustX = 1;
            else if (tile == '.' || tile == ',')
                adjustX = -1;

            this.entity.moveRelative(adjustX, 0);      
        }

    }

}