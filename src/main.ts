// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

function main() {
    let kat = new Kat();
    registerShortcut(
        "KatTileWindow", "KAT: Tile Window", "Meta+Shift+Space",
        () => {
            let active = workspace.activeClient;
            if (active) {
                kat.tile(active);
            }
        },
    );
    registerShortcut(
        "KatSwapLeft", "KAT: Swap Left", "Meta+Ctrl+H",
        () => {
            kat.swapDirection(Direction.Left);
        }
    );
    registerShortcut(
        "KatSwapRight", "KAT: Swap Right", "Meta+Ctrl+L",
        () => {
            kat.swapDirection(Direction.Right);
        }
    );
    registerShortcut(
        "KatSwapAbove", "KAT: Swap Above", "Meta+Ctrl+K",
        () => {
            kat.swapDirection(Direction.Above);
        }
    );
    registerShortcut(
        "KatSwapBelow", "KAT: Swap Below", "Meta+Ctrl+J",
        () => {
            kat.swapDirection(Direction.Below);
        }
    );
    registerShortcut(
        "KatFocusLeft", "KAT: Focus Left", "Meta+H",
        () => {
            kat.focusDirection(Direction.Left);
        }
    );
    registerShortcut(
        "KatFocusRight", "KAT: Focus Right", "Meta+L",
        () => {
            kat.focusDirection(Direction.Right);
        }
    );
    registerShortcut(
        "KatFocusAbove", "KAT: Focus Above", "Meta+K",
        () => {
            kat.focusDirection(Direction.Above);
        }
    );
    registerShortcut(
        "KatFocusBelow", "KAT: Focus Below", "Meta+J",
        () => {
            kat.focusDirection(Direction.Below);
        }
    );
}
