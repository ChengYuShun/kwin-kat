// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

var autotile: Autotile;
function main() {
    print("main");
    autotile = new Autotile();
    registerShortcut(
        "KatTileWindow", "KAT: Tile Window", "Meta+Shift+Space",
        () => {
            let active = workspace.activeClient;
            if (active) {
                autotile.tile(active);
            }
        },
    );
    registerShortcut(
        "KatSwapLeft", "KAT: Swap Left", "Meta+Ctrl+H",
        () => {
            autotile.swapDirection(Direction.Left);
        }
    );
    registerShortcut(
        "KatSwapRight", "KAT: Swap Right", "Meta+Ctrl+L",
        () => {
            autotile.swapDirection(Direction.Right);
        }
    );
    registerShortcut(
        "KatSwapAbove", "KAT: Swap Above", "Meta+Ctrl+K",
        () => {
            autotile.swapDirection(Direction.Above);
        }
    );
    registerShortcut(
        "KatSwapBelow", "KAT: Swap Below", "Meta+Ctrl+J",
        () => {
            autotile.swapDirection(Direction.Below);
        }
    );
    registerShortcut(
        "KatFocusLeft", "KAT: Focus Left", "Meta+H",
        () => {
            autotile.focusDirection(Direction.Left);
        }
    );
    registerShortcut(
        "KatFocusRight", "KAT: Focus Right", "Meta+L",
        () => {
            autotile.focusDirection(Direction.Right);
        }
    );
    registerShortcut(
        "KatFocusAbove", "KAT: Focus Above", "Meta+K",
        () => {
            autotile.focusDirection(Direction.Above);
        }
    );
    registerShortcut(
        "KatFocusBelow", "KAT: Focus Below", "Meta+J",
        () => {
            autotile.focusDirection(Direction.Below);
        }
    );
}
