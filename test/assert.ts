// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

function assert(b: boolean) {
    if (!b) {
        console.log("assert failed");
        throw new Error();
    }
}

function assertEq(x: any, y: any) {
    if (x !== y) {
        console.log("assert failed:", x, "!==", y);
        throw new Error();
    }
}
