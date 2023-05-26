// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

class Kat {
    // (activity, virtual desktop, screen) -> windows
    private untiledWindows: MMMSet<string, number, number, KWin.Window>
        = new MMMSet();

    private tileMap: TileMap<KWin.Window, KWin.Tile> = new TileMap();

    private autotile: boolean = true;

    private debug: boolean = true;

    private minHeight: number = 400;
    private minWidth: number = 500;

    private printDebug(...values: any[]) {
        if (this.debug) {
            print("KAT:", ...values);
        }
    }

    private checkWinGeo(win: KWin.Window): boolean {
        let geo = win.frameGeometry;
        return geo.height >= this.minHeight && geo.width >= this.minWidth;
    }

    private onActivityDesktopChanged(kwin: KWin.Window): void {
        if (kwin.fromKAT === true) {
            return;
        }

        this.printDebug("handling activity desktop change");

        let win = this.newWindow(kwin);
        let screen = win.screen;
        let lastActivity = win.tmpActivity;
        let lastDesktop = win.tmpDesktop;
        let desktop = win.desktop;
        let activities = win.activities;
        win.tmpActivity = activities.length == 1 ? activities[0] : null;
        win.tmpDesktop = desktop == -1 ? null : desktop;

        // Do nothing if it is not the right kind of window.
        if (win.desktopWindow || win.popupMenu || win.popupWindow) {
            return;
        }

        if (lastActivity === null || lastDesktop === null) {
            // If it is previously shared.
            if (activities.length == 1 && desktop != -1) {
                // If it is now dedicated.
                if (this.autotile && this.checkWinGeo(win)) {
                    // TODO: may record tiling status in the shared window.
                    this.tile(win);
                } else {
                    // Add it to the untiled list if autotile is disabled.
                    this.untiledWindows.add(
                        win.activities[0],
                        win.desktop,
                        screen,
                        win,
                    );
                }
            }
            // We do nothing if it is now still shared.
        } else {
            // If it is previously dedicated.
            if (desktop == -1 || activities.length != 1) {
                // If it is now shared.
                let tile = win.tmpTile;
                if (tile === null) {
                    // If it is untiled, we will remove it from the untiled
                    // windows.
                    this.untiledWindows.delete(
                        lastActivity,
                        lastDesktop,
                        screen,
                        win,
                    );
                } else {
                    // If it is tiled, we will remove it from the tile map, and
                    // untile it.
                    this.tileMap.tryDelWindow(
                        lastActivity,
                        lastDesktop,
                        tile,
                    );
                    win.fromKAT = true;
                    win.tmpTile = win.tile = null;
                    win.fromKAT = false;
                }
            } else {
                // If it is still dedicated.
                //
                // TODO: check the logic here.
                let activity = win.activities[0];
                let tile = win.tmpTile;
                if (tile === null) {
                    // If this window is not tiled, we will simply update
                    // untiled windows.
                    this.untiledWindows.delete(
                        lastActivity, lastDesktop, screen, win,
                    );
                    this.untiledWindows.add(activity, desktop, screen, win);
                } else {
                    // If this window is tiled, we will update tile map, and
                    // retile.
                    let last = this.tileMap
                        .get(lastActivity, lastDesktop, tile);
                    // Extra test to avoid retiling.
                    if (last !== undefined && !Array.isArray(last)) {
                        this.tileMap
                            .tryDelWindow(lastActivity, lastDesktop, tile);
                        this.retile(lastActivity, lastDesktop, win.screen);
                    }
                    win.fromKAT = true;
                    win.tmpTile = win.tile = null;
                    win.fromKAT = false;
                    this.tile(win);
                }
            }
        }
    }

    // private onScreenChanged(kwin: KWin.Window): void {
    //     if (kwin.fromAutotile === true) {
    //         return;
    //     }

    //     this.printDebug("handling screen change");

    //     let win = this.newWindow(kwin);
    //     let desktop = win.desktop;
    //     let activities = win.activities;
    //     let screen = win.screen;
    //     let lastScreen = win.tmpScreen;
    //     win.tmpScreen = screen;

    //     // Do nothing if it is not the right kind of window.
    //     if (win.desktopWindow || win.popupMenu || win.popupWindow) {
    //         return;
    //     }

    //     if (desktop != -1 && activities.length == 1) {
    //         let activity = win.activities[0];
    //         let desktop = win.desktop;
    //         // If it is dedicated.
    //         if (win.tmpTile === null) {
    //             // If it is untiled, we will update untiled window.
    //             this.untiledWindows.delete(
    //                 activity,
    //                 desktop,
    //                 lastScreen,
    //                 win,
    //             );
    //             this.untiledWindows.add(
    //                 activity,
    //                 desktop,
    //                 screen,
    //                 win,
    //             );
    //         } else if (win.fullScreen === true) {
    //             win.tmpTile = null;
    //             this.tileMap.tryTileWindow(
    //                 activity, desktop, screen, win,
    //                 (w, t) => {
    //                     w.fromAutotile = true;
    //                     w.fullScreen ? w.tmpTile = t : w.tmpTile = w.tile = t;
    //                     w.fromAutotile = false;
    //                 },
    //             );
    //         }
    //     }
    // }

    private onFullScreenChanged(kwin: KWin.Window): void {
        if (kwin.fromKAT === true) {
            return;
        }

        this.printDebug("handling full screen change");

        let win = this.newWindow(kwin);

        // Do nothing if it is not the right kind of window.
        if (win.desktopWindow || win.popupMenu || win.popupWindow) {
            return;
        }

        if (win.fullScreen === true) {
            win.tmpTile = win.tile;
            win.fromKAT = true
            win.tile = null;
            win.fromKAT = false;
        } else {
            // If it is recovered from full screen, we will recover the tile.
            win.fromKAT = true;
            win.tile = win.tmpTile;
            win.fromKAT = false;
        }
    }

    private onGeometryChanged(kwin: KWin.Window): void {
        if (kwin.fromKAT === true) {
            return;
        }

        this.printDebug("handling geometry change");

        let win = this.newWindow(kwin);

        // Do nothing if it is not the right kind of window.
        if (win.desktopWindow || win.popupMenu || win.popupWindow) {
            return;
        }

        let tile = win.tmpTile;

        if (!win.fullScreen && tile !== null
            && !rectEq(win.frameGeometry, tile.windowGeometry)) {
            win.tile = null;
        }
    }

    private onTileChanged(kwin: KWin.Window): void {
        if (kwin.fromKAT === true) {
            return;
        }

        this.printDebug("handling tile change");

        let win = this.newWindow(kwin);

        if (win.tile === null) {
            // If it is full screened, just return.
            if (win.fullScreen) {
                return;
            }

            let lastTile = win.tmpTile as KWin.Tile;
            win.tmpTile = null;

            // Do nothing if it is not the right kind of window.
            if (win.desktopWindow || win.popupMenu || win.popupWindow) {
                return;
            }

            let desktop = win.desktop;
            let activities = win.activities;

            if (desktop != -1 && activities.length == 1) {
                // If it is dedicated.
                let activity = activities[0];
                let lastScreen = win.tmpScreen;
                this.tileMap.tryDelWindow(activity, desktop, lastTile);
                this.untiledWindows.add(activity, desktop, win.screen, win);
                this.retile(activity, desktop, lastScreen);
            }
        } else {
            let tile = win.tile;
            let lastTile = win.tmpTile;
            win.tmpTile = tile;

            // Untile it immediately if it is not the right kind of window.
            if (win.desktopWindow || win.popupMenu || win.popupWindow) {
                win.fromKAT = true;
                win.tmpTile = win.tile = null;
                win.fromKAT = false;
                return;
            }

            let desktop = win.desktop;
            let activities = win.activities;
            let screen = win.screen;

            if (desktop != -1 && activities.length == 1) {
                let activity = activities[0];

                // First of all delete it, so there are space for insert.
                if (lastTile !== null) {
                    this.tileMap.tryDelWindow(activity, desktop, lastTile);
                }
                // Try to add it to the map.
                if (this.tileMap.tryAddWindow(activity, desktop, tile, win)) {
                    this.untiledWindows.delete(
                        activity, desktop, screen, win,
                    );
                    this.untiledWindows.delete(
                        activity, desktop, win.tmpScreen, win,
                    );
                    if (win.fullScreen) {
                        win.fromKAT = true;
                        win.tile = null;
                        win.fromKAT = false;
                    }
                } else {
                    // Tile it automatically if it cannot be inserted into the
                    // map directly.
                    win.fromKAT = true;
                    win.tmpTile = win.tile = null;
                    win.fromKAT = false;
                    this.untiledWindows.add(activity, desktop, screen, win);
                    if (this.autotile && this.checkWinGeo(win)) {
                        this.tile(win);
                    }
                }
            } else {
                // If it is shared, untile it immediately.
                win.fromKAT = true;
                win.tile = null;
                win.fromKAT = false;
            }
        }
    }

    private onWindowClosed(kwin: KWin.Window): void {
        this.printDebug("handling window close of " + kwin.resourceClass);
        let desktop = kwin.tmpDesktop;
        let activity = kwin.tmpActivity;
        if (desktop && activity) {
            let tile = kwin.tmpTile;
            this.untiledWindows.delete(activity, desktop, kwin.screen, kwin);
            if (tile !== null && tile !== undefined) {
                this.tileMap.tryDelWindow(activity, desktop, tile);
            }
            kwin.fromKAT = true;
            kwin.tmpTile = kwin.tile = null;
            this.retile(activity, desktop, kwin.screen);
        }
    }

    // Fully initialize a window, if it hasn't been so.
    private newWindow(kwin: KWin.Window): Win {
        if (kwin.initialized === null) {
            return kwin as Win;
        }

        this.printDebug("handling new window");

        let activities = kwin.activities;
        let desktop = kwin.desktop;
        kwin.tmpActivity = activities.length == 1 ? activities[0] : null;
        kwin.tmpDesktop = desktop == -1 ? null : desktop;
        kwin.tmpScreen = kwin.screen;
        kwin.initialized = null;
        kwin.fromKAT = false;
        let tile = kwin.tmpTile = kwin.tile;
        let win = kwin as Win;

        // Bind signals.
        // win.screenChanged.connect(this.onScreenChanged.bind(this, win));
        win.desktopChanged.connect(
            this.onActivityDesktopChanged.bind(this, win),
        );
        win.activitiesChanged.connect(
            this.onActivityDesktopChanged.bind(this, win),
        );
        win.frameGeometryChanged.connect(
            this.onGeometryChanged.bind(this, win),
        );
        win.fullScreenChanged.connect(
            this.onFullScreenChanged.bind(this, win),
        );
        win.tileChanged.connect(this.onTileChanged.bind(this, win));

        // Untile it if it is in full screen.
        if (win.fullScreen) {
            win.fromKAT = true;
            win.tile = null;
            win.fromKAT = false;
        }

        // If it is dedicated.
        if (activities.length == 1 && desktop != -1) {
            let activity = activities[0];
            let screen = win.screen;

            if (tile === null) {
                // If it should not be tiled, add it to the untiled list. May
                // optionally tile it if autotile is enabled.
                if (!(this.autotile && this.checkWinGeo(win) && this.tile(win))) {
                    this.untiledWindows.add(activity, desktop, screen, win);
                }
            } else {
                // If it is already somehow tiled, try to add it to the tile
                // map.
                if (!this.tileMap.tryAddWindow(activity, desktop, tile, win)) {
                    // If the insertion is not successful, we may tile it again
                    // automatically.
                    win.fromKAT = true;
                    win.tmpTile = win.tile = null;
                    win.fromKAT = false;
                    if (!this.tile(win)) {
                        this.untiledWindows
                            .add(activity, desktop, screen, win);
                    }
                }
            }
        }

        return win;
    }

    constructor() {
        for (let window of workspace.clientList()) {
            this.newWindow(window);
        }

        this.printDebug("before binding added");
        workspace.clientAdded.connect(this.newWindow.bind(this))
        workspace.clientRemoved.connect(this.onWindowClosed.bind(this));
        this.printDebug("after binding added");

        // TODO: bind callbacks for options
    }

    swapDirection(direction: Direction): boolean {
        this.printDebug("moving window in a certain direction");

        let active = workspace.activeClient;
        if (active === null) {
            this.printDebug("cannot get active window");
            return false;
        }
        this.printDebug("successfully get active window");

        let activeWin = this.newWindow(active);
        let tile = activeWin.tmpTile;
        let activities = activeWin.activities;
        let desktop = activeWin.desktop;
        if (tile === null) {
            this.printDebug("active window is untiled");
            return false;
        }
        if (desktop == -1 || activities.length != 1) {
            this.printDebug("active window is shared")
            return false;
        }
        let activity = activities[0];

        let sibling = getSibDir(tile, direction, null);
        if (sibling === null) {
            return false;
        }
        let newTile = getChildDir(
            sibling, oppoDirection(direction), (tile: KWin.Tile) => {
                if (!Array.isArray(this.tileMap.get(activity, desktop, tile))) {
                    return true;
                }
            },
        );
        // let newTile = this.tileMap.getDirection(
        //     activity, desktop, tile, direction,
        // );
        if (newTile === null) {
            this.printDebug("cannot get tile in that direction");
            return false;
        }
        this.printDebug("successfully get the tile in that direction");

        let newNode = this.tileMap.get(activity, desktop, newTile);
        if (Array.isArray(newNode)) {
            this.printDebug("cannot tile as we are getting a node");
            return false;
        }
        this.printDebug("successfully get the new node");

        if (newNode !== undefined) {
            this.tileMap.tryDelWindow(activity, desktop, newTile);
        }
        this.tileMap.tryDelWindow(activity, desktop, tile);
        this.tileMap.tryAddWindow(activity, desktop, newTile, activeWin);
        if (!activeWin.fullScreen) {
            activeWin.fromKAT = true;
            activeWin.tile = newTile;
            activeWin.fromKAT = false;
        }
        activeWin.tmpTile = newTile;
        if (newNode !== undefined) {
            if (!newNode.fullScreen) {
                newNode.fromKAT = true;
                newNode.tile = tile;
                newNode.fromKAT = false;
            }
            newNode.tmpTile = tile;
            this.tileMap.tryAddWindow(activity, desktop, tile, newNode);
        }

        this.printDebug("successfully swapped")
        return true;
    }

    focusDirection(direction: Direction): boolean {
        this.printDebug("focusing on a window in a certain direction");

        let active = workspace.activeClient;
        if (active === null) {
            return false;
        }

        let activeWin = this.newWindow(active);

        if (activeWin.fullScreen === true) {
            return false;
        }

        let tile = activeWin.tile;
        let activities = activeWin.activities;
        let desktop = activeWin.desktop;
        if (tile === null) {
            return false;
        }
        if (desktop == -1 || activities.length != 1) {
            return false;
        }
        let activity = activities[0];

        let sibling = getSibDir(tile, direction, (tile: KWin.Tile) => {
            return this.tileMap.get(activity, desktop, tile) !== undefined;
        });
        if (sibling === null) {
            return false;
        }

        let newTile = getChildDir(
            sibling, oppoDirection(direction), (tile: KWin.Tile) => {
                let node = this.tileMap.get(activity, desktop, tile);
                if (node === undefined) {
                    return false;
                } else if (!Array.isArray(node)) {
                    return true;
                }
            },
        );
        if (newTile === null) {
            return false;
        }

        let newFocus = this.tileMap.get(activity, desktop, newTile);
        if (newFocus === undefined || Array.isArray(newFocus)) {
            return false;
        }

        workspace.activeClient = newFocus;
        return true;
    }

    tile(kwin: KWin.Window): boolean {
        this.printDebug("tiling window", kwin.resourceClass);

        let win = this.newWindow(kwin);

        if (win.desktopWindow || win.popupMenu || win.popupWindow) {
            return false;
        }

        if (win.tmpTile !== null || win.tile !== null) {
            return true;
        }

        let activities = win.activities;
        let desktop = win.desktop;

        if (activities.length == 1 && desktop != -1) {
            let activity = activities[0];
            let screen = win.screen;
            let root = workspace.tilingForScreen(screen)?.rootTile;
            if (root !== undefined && this.tileMap.tryTileWindow(
                activity, desktop, root, win,
                (w, t) => {
                    w.fromKAT = true;
                    this.printDebug("settings window");
                    w.fullScreen ? w.tmpTile = t : w.tmpTile = w.tile = t;
                    // w.tmpTile = w.tile = t;
                    w.fromKAT = false;
                },
            )) {
                this.untiledWindows.delete(activity, desktop, screen, win);
                this.printDebug("deleting from untiled");
                return true;
            } else {
                // Add this line to be safe.
                this.untiledWindows.add(activity, desktop, screen, win);
                this.printDebug("adding to untiled");
                return false;
            }
        } else {
            return false;
        }
    }

    retile(activity: string, desktop: number, screen: number): void {
        this.printDebug("retiling window");

        let toBeRetiled: Array<KWin.Window> = [];
        let rootTile = workspace.tilingForScreen(screen)?.rootTile;

        if (rootTile === undefined) {
            return;
        }

        // Collect all windows to be retiled.
        this.tileMap.forEach(
            activity, desktop, rootTile, (_tile: KWin.Tile, w: KWin.Window) => {
                toBeRetiled.push(w);
            },
        );

        // Untile all windows.
        for (let w of toBeRetiled) {
            this.tileMap.tryDelWindow(w.activities[0], w.desktop, w.tmpTile!);
        }

        let retileMap: Map<KWin.Window, KWin.Tile> = new Map();

        // Insert all windows into the tile map.
        for (let w of toBeRetiled) {
            if (!this.tileMap.tryTileWindow(
                activity, desktop, rootTile, w,
                (w, t) => { retileMap.set(w, t) },
            )) {
                break;
            }
        }

        // Retile all windows.
        for (let [w, t] of retileMap) {
            w.fromKAT = true;
            w.fullScreen ? w.tmpTile = t : w.tmpTile = w.tile = t;
            // w.tmpTile = w.tile = t;
            w.fromKAT = false;
        }
    }
}
