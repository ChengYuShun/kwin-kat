// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

namespace KWin {
    export interface Window {
        initialized?: null,
        // This records the tile the window is originally at.
        tmpTile?: Tile | null,
        tmpActivity?: string | null,
        tmpDesktop?: number | null,
        tmpScreen?: number,
        // Whether the operation comes from autotile.
        fromKAT?: boolean,
    }

    export namespace LayoutDirection {
        export const Floating = 0;
        export const Horizontal = 1;
        export const Vertical = 2;
    }
}

interface Win extends KWin.Window {
    initialized: null;
    tmpTile: KWin.Tile | null;
    tmpActivity: string | null;
    tmpDesktop: number | null;
    tmpScreen: number;
    fromKAT: boolean,
}

function rectEq(rect1: QRectF, rect2: QRectF): boolean {
    return rect1.x == rect2.x && rect1.y == rect2.y
        && rect1.width == rect2.width && rect1.height == rect1.height;
}

