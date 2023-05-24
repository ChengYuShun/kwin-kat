// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

function testFilterMap() {
    console.log("start testing FilterMap");

    let map = new Map();
    map.set("a", 1)
        .set("b", 2)
        .set("c", 3);
    let filterMap = new FilterMap();
    filterMap.set("a", 1)
        .set("b", 2)
        .set("c", 3);

    // Iterating through.
    filterMap.filter((k, v) => {
        assertEq(map.get(k), v);
        map.delete(k);
    });
    assertEq(map.size, 0);

    // Iterating through with filter.
    filterMap.filter((k, v) => {
        assertEq(k, "b");
        assertEq(v, 2);
    }, "b");

    // Iterating through with break.
    let counter = 0;
    filterMap.filter((_k, _v) => {
        assertEq(counter, 0);
        counter++;
        return true;
    });

    // Non-existing key.
    filterMap.filter(() => { assertEq(1, 2); }, "d");

    console.log("finish testing FilterMap");
}

function testMMap() {
    console.log("start testing MMap");

    let mmap = new MMap();

    // set method.
    mmap.set(1, 2, 3)
        .set(2, 4, 5)
        .set(1, 3, 4)
        .set(1, 4, 5);

    // delete method.
    mmap.delete(1, 4);

    // get method.
    assertEq(mmap.get(2, 4), 5);
    assertEq(mmap.get(1, 4), undefined);

    // has method.
    assertEq(mmap.has(1, 2), true);

    // TODO: filter method.

    console.log("finish testing MMap");
}

function testMMMap() {
    console.log("start testing MMMap");

    let mmmap = new MMMap();

    // set method.
    mmmap.set(1, 2, 4, 2)
        .set(1, 2, 2, 4)
        .set(14, 2, 2, 3)
        .set(1, 2, 2, 3)
        .set(3, 5, 2, 3);

    // delete.
    mmmap.delete(3, 5, 2);

    // has method.
    assertEq(mmmap.has(3, 5, 2), false);
    assertEq(mmmap.has(1, 2, 2), true);

    // get method.
    assertEq(mmmap.get(1, 2, 4), 2);
    assertEq(mmmap.get(1, 2, 2), 3);

    // TODO: filter method.

    console.log("finish testing MMMap");
}

function testMMMSet() {
    console.log("start testing MMMSet");

    let mmmset = new MMMSet();

    // add method.
    mmmset.add(1, 3, 4, 2)
        .add(1, 3, 4, 3)
        .add(1, 4, 3, 4)
        .add(1, 4, 3, 5)
        .add(1, 5, 3, 2);

    // delete method.
    assertEq(mmmset.delete(1, 4, 3, 4), true);
    assertEq(mmmset.delete(1, 3, 4, 5), false);
    assertEq(mmmset.delete(1, 5, 3, 2), true);

    // has method.
    assertEq(mmmset.has(1, 3, 4, 2), true);
    assertEq(mmmset.has(1, 3, 4, 3), true);
    assertEq(mmmset.has(1, 4, 3, 4), false);
    assertEq(mmmset.has(1, 4, 3, 5), true);
    assertEq(mmmset.has(1, 5, 3, 2), false);

    // TODO: filter method.

    console.log("finish testing MMMSet");
}

function testMaps() {
    console.log("start testing maps");

    testFilterMap();
    testMMap();
    testMMMap();
    testMMMSet();

    console.log("finish testing maps");
}
