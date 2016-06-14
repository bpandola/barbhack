namespace Barbarian {

    export enum TileMapLocation {
        LadderTop,
        LadderBottom
    }

    export interface TileMapEntity {
        game: Barbarian.Game;
        getTileMapPosition(adjustX?: number, adjustY?: number): Phaser.Point;
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

            var tile = this.entity.game.cache.getJSON('rooms')[this.entity.game.roomNum]
                .layout[position.y].rowData
                .substring(position.x, position.x + 1);

            return tile;
        }

        isEntityAt(location: TileMapLocation): boolean {

            var searchString: string;

            switch (location) {
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

            var tileMapRow: string = this.entity.game.cache.getJSON('rooms')[this.entity.game.roomNum].layout[position.y].rowData

            var index = tileMapRow.indexOf(searchString);

            if (index == -1)
                return false;

            if (position.x >= index && position.x <= index + searchString.length - 1)
                return true;
            else
                return false;


        }

    }

}