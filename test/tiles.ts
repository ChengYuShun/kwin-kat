// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

class TestTile implements Tile {
    parent: this | null = null;
    tiles: Array<this> = [];
    layoutDirection: KWin.LayoutDirection;

    constructor(layoutDirection: KWin.LayoutDirection) {
        this.layoutDirection = layoutDirection;
    }
}

function testTiles() {
    console.log("start testing tiles");

    // Setup the map. It looks something like:
    //
    // earth:
    //
    // +---------+----------+--------------+---------+
    // |         |          |              |         |
    // | america | atlantic | afro-eurasia | pacific |
    // |         |          |              |         |
    // +---------+----------+--------------+---------+
    //
    //
    // america:
    //
    // +---------------+
    // | north america |
    // +---------------+
    // | south america |
    // +---------------+
    //
    // afro-eurasia:
    //
    // +---------+
    // | eurasia |
    // +---------+
    // | africa  |
    // +---------+
    //
    // eurasia:
    // 
    // +--------+------+
    // | europe | asia |
    // +--------+------+
    let earth = new TestTile(KWin.LayoutDirection.Horizontal);

    let america = new TestTile(KWin.LayoutDirection.Vertical);
    let atlantic = new TestTile(KWin.LayoutDirection.Vertical);
    let afro_eurasia = new TestTile(KWin.LayoutDirection.Vertical);
    let pacific = new TestTile(KWin.LayoutDirection.Vertical);

    america.parent
        = atlantic.parent
        = afro_eurasia.parent
        = pacific.parent
        = earth;
    earth.tiles = [america, atlantic, afro_eurasia, pacific];

    let north_america = new TestTile(KWin.LayoutDirection.Vertical);
    let south_america = new TestTile(KWin.LayoutDirection.Vertical);

    north_america.parent = south_america.parent = america;
    america.tiles = [north_america, south_america];

    let eurasia = new TestTile(KWin.LayoutDirection.Horizontal);
    let africa = new TestTile(KWin.LayoutDirection.Vertical);

    eurasia.parent = africa.parent = afro_eurasia;
    afro_eurasia.tiles = [eurasia, africa];

    let europe = new TestTile(KWin.LayoutDirection.Horizontal);
    let asia = new TestTile(KWin.LayoutDirection.Horizontal);

    europe.parent = asia.parent = eurasia;
    eurasia.tiles = [europe, asia];

    let tilemap = new TileMap<string, TestTile>();

    // tryAddWindow method.
    assertEq(tilemap.tryAddWindow("high", 0, asia, "everest"), true);
    assertEq(tilemap.tryAddWindow("high", 0, africa, "kenya"), true);
    assertEq(tilemap.tryAddWindow("high", 0, eurasia, "alps"), false);
    assertEq(tilemap.tryAddWindow("high", 0, europe, "alps"), true);

    // tryDelWindow method.
    assertEq(tilemap.tryDelWindow("high", 0, africa), true);
    assertEq(tilemap.tryDelWindow("high", 0, eurasia), false);

    // get method.
    assertEq(tilemap.get("high", 0, america), undefined);
    let eurasia_mountains = tilemap.get("high", 0, eurasia) as TileNode;
    assertEq(eurasia_mountains[1], 2);
    assertEq(eurasia_mountains[0], true);
    let afro_eurasia_mountains = tilemap.get("high", 0, afro_eurasia) as
        TileNode;
    assertEq(afro_eurasia_mountains[0], false);
    assertEq(afro_eurasia_mountains[1], 2);
    assertEq(tilemap.get("low", 0, eurasia), undefined);

    // tryTileWindow method.
    assertEq(tilemap.tryTileWindow("high", 0, america, "rocky", null), true);
    assertEq(tilemap.get("high", 0, america), "rocky");
    assertEq(tilemap.tryTileWindow("high", 0, america, "andes", null), true);
    let america_mountains = tilemap.get("high", 0, america) as TileNode;
    assertEq(america_mountains[0], true);
    assertEq(america_mountains[1], 2);
    assertEq(tilemap.get("high", 0, north_america), "rocky");
    assertEq(tilemap.get("high", 0, south_america), "andes");

    assertEq(tilemap
        .tryTileWindow("high", 0, earth, "nothing", null), true);
    assertEq(tilemap
        .tryTileWindow("high", 0, earth, "mauna kea", null), true);
    assertEq(tilemap
        .tryTileWindow("high", 0, earth, "kilimanjaro", null), true);

    assertEq(tilemap.get("high", 0, pacific), "mauna kea");
    assertEq(tilemap.get("high", 0, atlantic), "nothing");
    assertEq(tilemap.get("high", 0, africa), "kilimanjaro");

    // Now, the map looks like:
    //
    // +-------+---------+------+---------+-----------+
    // |       |         |      |         |           |
    // | rocky |         | alps | everest |           |
    // |       |         |      |         |           |
    // +-------+ nothing +------+---------+ mauna kea |
    // |       |         |                |           |
    // | andes |         |   kilimanjaro  |           |
    // |       |         |                |           |
    // +-------+---------+----------------+-----------+

    // getChildDir function.
    assertEq(getChildDir(
        afro_eurasia, Direction.Below,
        (tile: TestTile) => tile.tiles.length == 0 ? true : undefined,
    ), africa);
    let orderList = [
        "rocky", "andes", "nothing", "alps", "everest", "kilimanjaro",
        "mauna kea",
    ];
    let counter = 0;
    assertEq(getChildDir(
        earth, Direction.Left,
        (tile: TestTile) => {
            let node = tilemap.get("high", 0, tile);
            if (!Array.isArray(node)) {
                assertEq(node, orderList[counter]);
                counter++;
            }
        },
    ), null);

    // getSibDir function.
    assertEq(getSibDir(
        asia, Direction.Left, (tile: TestTile) => tile !== europe,
    ), atlantic);
    assertEq(getSibDir(europe, Direction.Above, null), null);
    assertEq(getSibDir(europe, Direction.Below, null), africa);

    // getDirection.
    // assertEq(tilemap.getDirection("high", 0, asia, Direction.Right), pacific);

    console.log("finish testing tiles");
}
