declare namespace KWin {

    class Window {
        // Whether it is a desktop background window.
        readonly desktopWindow: boolean;

        // Whether it is a popup window or not.
        readonly popupWindow: boolean;

        // Whether it is a popup menu or not.
        readonly popupMenu: boolean;

        // Whether the window is on all desktops.
        readonly onAllDesktops: boolean;

        // Whether the Window can be resized.
        readonly resizeable: boolean;

        // Whether the Window is moveable.
        readonly moveable: boolean;

        // Whether the Window is a transient Window to another Window.
        readonly transient: boolean;

        // Whether the Window is any of special windows types (desktop, dock,
        // spash, ...), i.e. window types that usually don't have a window
        // frame and user does not use window management on them.
        readonly specialWindow: boolean;

        // The desktop this Window is on. If it is on all desktops the property
        // has value -1.
        //
        // This should be deprecated, but since property desktops is currently
        // undefined, we have to use this for now.
        desktop: number;

        // The virtual desktops this window in on. If it is on all desktops,
        // the list is empty.
        //
        // Currently undefined.
        // readonly desktops: Array<VirtualDesktop>;

        // The Tile this Window is associated to, if any. If the Window is
        // resized or moved, the tile won't be emptied.
        tile: Tile | null;

        // Whether the Window is set to be kept above other windows.
        keepAbove: boolean;

        // Whether the Window is set to be kept below other windows.
        keepBelow: boolean;

        // Whether the Window has a decoration or not.
        readonly noBorder: boolean;

        // Whether this Window is fullScreen.
        fullScreen: boolean;

        // The geometry of the Window.
        frameGeometry: QRectF;

        // The screen where the window center is on.
        screen: number;

        // The activities this client is on. If it's on all activities the
        // property is empty.
        activities: string[];

        resourceClass: string;

        // Emitted when the Window is closed.
        windowClosed: Signal<(window: Window, deleted: Deleted) => void>;

        // This signal is emitted when the Window's client geometry has
        // changed.
        frameGeometryChanged: Signal<(client: Window, oldGeometry: QRectF) => void>;

        // Emitted whenever the Window starts or ends move/resize mode.
        moveResizedChanged: Signal<() => void>;

        // Emitted whenever the Window's screen changes.
        screenChanged: Signal<() => void>;

        activitiesChanged: Signal<(client: Window) => void>;
        desktopChanged: Signal<() => void>;
        fullScreenChanged: Signal<() => void>;

        // Emitted whenever the its tile changes.
        tileChanged: Signal<(tile: Tile) => void>;
    }

    class Deleted extends Window {}

    class X11Window extends Window {}

    type LayoutDirection = number;

    // A tile block.
    class Tile {
        // All tiles directly children of this tile.
        readonly tiles: Array<Tile>;

        // Returns all the windows currently being put at this tile in all
        // activities and on all virtual desktops, but not those put at its
        // children tiles.
        readonly windows: Array<Window>;

        // Geometry of the tile in absolute coordinates.  What does that mean?
        readonly absoluteGeometry: QRectF;

        // Absolute geometry minus the padding and reserved areas such as
        // panels.
        readonly windowGeometry: QRectF;

        readonly layoutDirection: LayoutDirection;

        // null for root tile.
        readonly parent: Tile | null;

        padding: number;

        // Signals.
        windowAdded: Signal<(window: Window) => void>;
        windowRemoved: Signal<(window: Window) => void>;
    }

    class CustomTile extends Tile {
        layoutModified: Signal<() => void>;
    }

    class TileManager {
        rootTile: CustomTile;
        bestTileForPosition(x: number, y: number): Tile;
    }

    class VirtualDesktop {
        readonly id: number;
        x11DesktopNumber: number;
        name: string;
    }

    class WorkspaceWrapper {
        // Returns the active client, or null if no window that has the focus.
        activeClient: Window | null;

        activeScreen: number;

        currentActivity: string;

        // Deprecated
        currentDesktop: number;

        currentVirtualDesktop: VirtualDesktop;

        // The number of desktops currently used. Minimum number of desktops is
        // 1, maximum is 20.
        desktops: number;

        // All activities.
        activities: string[];

        tilingForScreen(screen: number): KWin.TileManager | null;
        // tilingForScreen(screen: number): KWin.TileManager | null;

        supportInformation(): string;

        // List of clients currently managed by KWin.
        clientList(): Window[];

        // doesnt actually exist in api, i made it up
        lastActiveClient: Window | null | undefined;

        // Signals.

        clientAdded: Signal<(client: Window) => void>;
        clientRemoved: Signal<(client: Window) => void>;

        // Emitted whenever a window get activated, i.e. the window that has
        // the focus.
        clientActivated: Signal<(client: Window) => void>;

        clientMinimized: Signal<(client: Window) => void>;

        clientUnminimized: Signal<(client: Window) => void>;

        // Emitted whenever a window is set to be in full screen mode.
        clientFullScreenSet: Signal<
            (client: X11Window, fullscreen: boolean, user: boolean) => void
        >;

        // Emitted whenever current desktop changed.
        currentDesktopChanged: Signal<
            (oldDesktop: number, moveResizeWindow: Window | null) => void
        >;

        // Emitted whenever the current acivity changed.
        currentActivityChanged: Signal<(activity: string) => void>;
    }

    class Options {
        configChanged: Signal<() => void>;
    }
}
