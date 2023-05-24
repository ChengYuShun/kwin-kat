// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

interface Tile {
    parent: this | null;
    tiles: Array<this>,
    layoutDirection: KWin.LayoutDirection;
}

enum Direction {
    Left,
    Right,
    Above,
    Below,
}

function directionType(direction: Direction): KWin.LayoutDirection {
    if (direction === Direction.Above || direction === Direction.Below) {
        return KWin.LayoutDirection.Vertical;
    } else {
        return KWin.LayoutDirection.Horizontal;
    }
}

function oppoDirection(direction: Direction): Direction {
    switch (direction) {
        case Direction.Above:
            return Direction.Below;
        case Direction.Below:
            return Direction.Above;
        case Direction.Left:
            return Direction.Right;
        case Direction.Right:
            return Direction.Left;
    }
}

// Get the tile itself or one of its children, such that it is approximately in
// a certain direction.
function getChildDir<T extends Tile>(
    tile: T, dir: Direction,
    // Returning true will immediately return the selected tile; returning
    // false will ignore the current tile and any of its children; returning
    // undefined will do nothing.
    validation: ((tile: T) => boolean | void),
): T | null {
    let res = validation(tile);
    if (res === true) {
        return tile;
    } else if (res === false) {
        return null
    }

    let tiles = tile.tiles;
    if (dir === Direction.Above || dir === Direction.Left) {
        for (let child of tiles) {
            let res = getChildDir(child, dir, validation);
            if (res !== null) {
                return res;
            }
        }
    } else {
        for (let i = tiles.length - 1; i >= 0; i--) {
            let res = getChildDir(tiles[i], dir, validation);
            if (res !== null) {
                return res;
            }
        }
    }

    return null;
}

// Get one of the siblings of the current tile, or any of its parents, that is
// guaranteed to be in a certain direction.
function getSibDir<T extends Tile>(
    tile: T, dir: Direction,
    // Return true for selecting the current one.
    validation: ((tile: T) => boolean) | null,
): T | null {
    let cur = tile;
    let parent = tile.parent;
    while (parent !== null) {
        let siblings = parent.tiles;
        if (directionType(dir) !== parent.layoutDirection) {
            cur = parent;
            parent = parent.parent;
            continue;
        }
        if (dir === Direction.Above || dir === Direction.Left) {
            let foundCur = false;
            for (let i = siblings.length - 1; i >= 0; i--) {
                let sibling = siblings[i]
                if (foundCur) {
                    if (validation === null || validation(sibling)) {
                        return sibling;
                    }
                } else if (sibling === cur) {
                    foundCur = true;
                }
            }
        } else {
            let foundCur = false;
            for (let sibling of siblings) {
                if (foundCur) {
                    if (validation === null || validation(sibling)) {
                        return sibling;
                    }
                } else if (sibling === cur) {
                    foundCur = true;
                }
            }
        }
        cur = parent;
        parent = parent.parent;
    }
    return null
}

// [full or not, number of windows]
type TileNode = [boolean, number];

class TileMap<W, T extends Tile> {
    // private debug: boolean = true;
    private inner: MMMap<string, number, T, W | TileNode> = new MMMap();

    // private printDebug(value: any) {
    //     if (this.debug) {
    //         print("KAT: ", value);
    //     }
    // }

    // Simply add the window to the tilemap; return true if it is added
    // successfully.
    tryAddWindow(
        activity: string, desktop: number, tile: T,
        window: W,
    ): boolean {
        let node = this.inner.get(activity, desktop, tile);

        // If this node has already been there, we will do nothing.
        if (node === window) {
            return true;
        }

        // If this node is not empty, we cannot tile the window.
        if (node !== undefined) {
            return false;
        }

        // If it not, though, we still have to figure out whether any of its
        // parent nodes is a window. We will proceed by first of all putting
        // all of its parent nodes in a list, given that they are empty or that
        // they are nodes, not windows.
        let parentTiles: Array<T> = [];
        let cur = tile.parent;
        while (cur !== null) {
            let node = this.inner.get(activity, desktop, cur);
            if (node !== undefined && !Array.isArray(node)) {
                // We cannot tile the window, neither, if one of its parents is
                // occupied.
                return false;
            }
            parentTiles.push(cur);
            cur = cur.parent;
        }

        // Now, given that we are pretty sure the window is going to be tiled,
        // we will put it in our tile nodes, and update its parent nodes
        // iteratively.
        this.inner.set(activity, desktop, tile, window);
        for (let parentTile of parentTiles) {
            let node = this.inner.get(activity, desktop, parentTile);
            if (node === undefined) {
                // If this node is empty, then at least one of its children is
                // empty as well.
                this.inner.set(activity, desktop, parentTile, [false, 1]);
            } else if (Array.isArray(node)) {
                // Check whether the node is full.
                let isFull = true;
                for (let sibling of parentTile.tiles) {
                    let node = this.inner.get(activity, desktop, sibling);
                    if (node === undefined) {
                        // If this node is empty, of course it is not full.
                        isFull = false;
                    } else if (Array.isArray(node)) {
                        // If this node is a parent node, then we should check
                        // whether it is full.
                        if (node[0] === false) {
                            isFull = false;
                        }
                    } else if (sibling.tiles.length !== 0) {
                        // If this node is a tiled window, we simply check
                        // whether it has any children.
                        isFull = false;
                    }
                    if (isFull === false) {
                        break;
                    }
                }

                this.inner.set(
                    activity, desktop, parentTile, [isFull, node[1] + 1],
                );
            }
        }

        return true;
    }

    // Simply try to delete the window, if there is one, at the given position;
    // return true if it the node is set to empty successfully.
    tryDelWindow(
        activity: string, desktop: number, tile: T,
    ): boolean {
        let node = this.inner.get(activity, desktop, tile);
        // There's nothing we can do if it is already not there.
        if (node === undefined) {
            return true;
        }

        // We cannot delete a parent node.
        if (Array.isArray(node)) {
            return false;
        }

        // Now, we can delete the window, and update parent nodes iteratively.
        this.inner.delete(activity, desktop, tile);
        let cur = tile.parent;
        while (cur !== null) {
            let parentCount
                = (this.inner.get(activity, desktop, cur) as [boolean, number])
                [1];
            if (parentCount == 1) {
                this.inner.delete(activity, desktop, cur);
            } else {
                this.inner.set(
                    activity, desktop, cur, [false, parentCount - 1],
                );
            }
            cur = cur.parent;
        }
        return true;
    }

    // Simply get a node.
    get(
        activity: string, desktop: number, tile: T,
    ): W | TileNode | undefined {
        return this.inner.get(activity, desktop, tile);
    }

    // Iterate over all windows specific to an activity, a desktop, and a
    // screen in order.  If the callback returns true it breaks, otherwise it
    // continues.
    forEach(
        activity: string, desktop: number, root: T,
        callback: (tile: T, w: W) => boolean | void,
    ): boolean | void {
        let node = this.inner.get(activity, desktop, root);

        if (Array.isArray(node)) {
            for (let childTile of root.tiles) {
                if (this.forEach(
                    activity, desktop, childTile, callback,
                ) === true) {
                    return true;
                }
            }
        } else if (node !== undefined) {
            return callback(root, node);
        }
    }

    // Try to tile a window in a screen; return true if it is tiled
    // successfully.
    tryTileWindow(
        activity: string, desktop: number, tile: T, w: W,
        setTile: ((w: W, tile: T) => void) | null,
    ): boolean {
        let node = this.inner.get(activity, desktop, tile);

        if (node === undefined) {
            if (this.tryAddWindow(activity, desktop, tile, w)) {
                if (setTile !== null) {
                    setTile(w, tile);
                }
                return true;
            } else {
                return false;
            }
        } else if (Array.isArray(node)) {
            if (node[0] === true) {
                return false;
            }

            let children = tile.tiles;
            let minNum: null | number = null;
            let minIdx: null | number = null;

            for (let i = 0; i < children.length; i++) {
                let child = children[i]
                let childNode = this.inner.get(activity, desktop, child);
                if (childNode === undefined) {
                    return this.tryTileWindow(
                        activity, desktop, child, w, setTile,
                    );
                } else if (Array.isArray(childNode)) {
                    let num = childNode[1]
                    if (childNode[0] !== true
                        && (minNum === null || minNum > num)) {
                        minNum = num;
                        minIdx = i;
                    }
                } else {
                    if ((minNum === null || minNum > 1)
                        && child.tiles.length > 0) {
                        minNum = 1;
                        minIdx = i;
                    }
                }
            }

            if (minIdx === null) {
                return false;
            } else {
                return this.tryTileWindow(
                    activity, desktop, children[minIdx], w, setTile,
                );
            }
        } else {
            let children = tile.tiles;
            if (children.length >= 2) {
                let child1 = children[0];
                let child2 = children[1];
                this.tryDelWindow(activity, desktop, tile);
                this.tryAddWindow(activity, desktop, child1, node);
                this.tryAddWindow(activity, desktop, child2, w);
                if (setTile !== null) {
                    setTile(node, child1);
                    setTile(w, child2);
                }
                return true;
            } else {
                return false;
            }
        }
    }

    // getDirection(
    //     activity: string, desktop: number, tile: T,
    //     direction: Direction,
    // ): T | null {
    //     // Get the proper sibling.
    //     let sibling: T | null = null;
    //     let prev = tile;
    //     let parent = tile.parent;
    //     let dirType = directionType(direction);
    //     parentLoop: while (parent !== null) {
    //         if (parent.layoutDirection !== dirType) {
    //             prev = parent;
    //             parent = parent.parent;
    //             continue;
    //         }

    //         let children = parent.tiles;
    //         for (let i = 0; i < children.length; i++) {
    //             let child = children[i]
    //             if (child !== prev) {
    //                 continue;
    //             }

    //             if (direction === Direction.Above
    //                 || direction === Direction.Left) {
    //                 if (i > 0) {
    //                     sibling = children[i - 1];
    //                     break parentLoop;
    //                 }
    //             } else {
    //                 if (i < children.length - 1) {
    //                     sibling = child[i + 1];
    //                     break parentLoop;
    //                 }
    //             }
    //             prev = parent;
    //             parent = parent.parent;
    //             continue parentLoop;
    //         }

    //         prev = parent;
    //         parent = parent.parent;
    //     }
    //     if (sibling === null) {
    //         return null;
    //     }

    //     // Get the proper child of that sibling.
    //     // let oppoDir = oppoDirection(direction);
    //     let node = this.get(activity, desktop, sibling);
    //     while (Array.isArray(node)) {
    //         // TODO: find the child at the opposite direction.
    //         let len = sibling.tiles.length;
    //         sibling = sibling.tiles[(len - 1) >> 1];
    //         node = this.get(activity, desktop, sibling);
    //     }

    //     return sibling;
    // }
}
