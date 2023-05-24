// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

var autotile: Autotile;
function main() {
    print("main");
    autotile = new Autotile();
    registerShortcut(
        "test", "test", "Meta+Shift+Space",
        () => {
            let active = workspace.activeClient;
            if (active) {
                autotile.tile(active);
            }
        },
    );
    registerShortcut(
        "swapLeft", "swapLeft", "Meta+Ctrl+H",
        () => {
            autotile.swapDirection(Direction.Left);
        }
    );
    registerShortcut(
        "swapRight", "swapRight", "Meta+Ctrl+L",
        () => {
            autotile.swapDirection(Direction.Right);
        }
    );
    registerShortcut(
        "swapAbove", "swapAbove", "Meta+Ctrl+K",
        () => {
            autotile.swapDirection(Direction.Above);
        }
    );
    registerShortcut(
        "swapBelow", "swapBelow", "Meta+Ctrl+J",
        () => {
            autotile.swapDirection(Direction.Below);
        }
    );
    registerShortcut(
        "focusLeft", "focusLeft", "Meta+H",
        () => {
            autotile.focusDirection(Direction.Left);
        }
    );
    registerShortcut(
        "focusRight", "focusRight", "Meta+L",
        () => {
            autotile.focusDirection(Direction.Right);
        }
    );
    registerShortcut(
        "focusAbove", "focusAbove", "Meta+K",
        () => {
            autotile.focusDirection(Direction.Above);
        }
    );
    registerShortcut(
        "focusBelow", "focusBelow", "Meta+J",
        () => {
            autotile.focusDirection(Direction.Below);
        }
    );
}
