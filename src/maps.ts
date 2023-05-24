// Copyright 2023 Yushun Cheng <chengys@disroot.org>
// SPDX-License-Identifier: GPL-3.0-only

class FilterMap<K, V> extends Map<K, V> {
    // Return true for break, and false or undefined for continue;
    filter(
        callback: (key: K, value: V) => boolean | void, key?: K,
    ): boolean | void {
        if (key === undefined) {
            for (let [key, value] of this) {
                if (callback(key, value)) {
                    return true;
                }
            }
        } else {
            let value = this.get(key);
            if (value !== undefined) {
                return callback(key, value);
            }
        }
    }
}

class MMap<X, Y, V> {
    private inner: FilterMap<X, FilterMap<Y, V>> = new FilterMap();

    clear() {
        this.inner.clear();
    }

    delete(x: X, y: Y): boolean {
        let ymap = this.inner.get(x);
        if (ymap === undefined) {
            return false;
        }

        let ret = ymap.delete(y);
        if (ret === true && ymap.size === 0) {
            this.inner.delete(x);
        }
        return ret;
    }

    get(x: X, y: Y): V | undefined {
        let ymap = this.inner.get(x);
        if (ymap === undefined) {
            return undefined;
        }

        return ymap.get(y);
    }

    has(x: X, y: Y): boolean {
        let ymap = this.inner.get(x);
        if (ymap === undefined) {
            return false;
        }

        return ymap.has(y);
    }

    set(x: X, y: Y, value: V): this {
        let ymap = this.inner.get(x);
        if (ymap === undefined) {
            ymap = new FilterMap();
            this.inner.set(x, ymap);
        }

        ymap.set(y, value);
        return this;
    }

    filter(
        callback: (x: X, y: Y, value: V) => boolean | void, x?: X, y?: Y,
    ): boolean | void {
        return this.inner.filter((x: X, ymap: FilterMap<Y, V>) => {
            return ymap.filter((y: Y, value: V) => {
                return callback(x, y, value);
            }, y);
        }, x)
    }
}

class MMMap<X, Y, Z, V> {
    private inner: MMap<X, Y, FilterMap<Z, V>> = new MMap();

    clear() {
        this.inner.clear();
    }

    delete(x: X, y: Y, z: Z): boolean {
        let zmap = this.inner.get(x, y);
        if (zmap === undefined) {
            return false;
        }

        let ret = zmap.delete(z);
        if (ret === true && zmap.size === 0) {
            this.inner.delete(x, y);
        }
        return ret;
    }

    get(x: X, y: Y, z: Z): V | undefined {
        let zmap = this.inner.get(x, y);
        if (zmap === undefined) {
            return undefined;
        }

        return zmap.get(z);
    }

    has(x: X, y: Y, z: Z): boolean {
        let zmap = this.inner.get(x, y);
        if (zmap === undefined) {
            return false;
        }

        return zmap.has(z);
    }

    set(x: X, y: Y, z: Z, value: V): this {
        let zmap = this.inner.get(x, y);
        if (zmap === undefined) {
            zmap = new FilterMap();
            this.inner.set(x, y, zmap);
        }

        zmap.set(z, value);
        return this;
    }

    filter(
        callback: (x: X, y: Y, z: Z, value: V) => boolean | void,
        x?: X, y?: Y, z?: Z,
    ): boolean | void {
        return this.inner.filter((x: X, y: Y, zmap: FilterMap<Z, V>) => {
            return zmap.filter((z: Z, value: V) => {
                return callback(x, y, z, value);
            }, z);
        }, x, y);
    }
}

class MMMSet<X, Y, Z, V> {
    private inner: MMMap<X, Y, Z, Set<V>> = new MMMap();

    add(x: X, y: Y, z: Z, value: V): this {
        let vset = this.inner.get(x, y, z);
        if (vset === undefined) {
            vset = new Set();
            this.inner.set(x, y, z, vset);
        }
        vset.add(value)
        return this;
    }

    clear() {
        this.inner.clear();
    }

    delete(x: X, y: Y, z: Z, value: V): boolean {
        let vset = this.inner.get(x, y, z);
        if (vset === undefined) {
            return false;
        }
        return vset.delete(value);
    }

    has(x: X, y: Y, z: Z, value: V): boolean {
        let vset = this.inner.get(x, y, z);
        if (vset === undefined) {
            return false;
        }
        return vset.has(value);
    }

    filter(
        callback: (x: X, y: Y, z: Z, value: V) => boolean | void,
        x?: X, y?: Y, z?: Z,
    ): boolean | void {
        return this.inner.filter((x: X, y: Y, z: Z, vset: Set<V>) => {
            for (let value of vset) {
                if (callback(x, y, z, value)) {
                    return true;
                }
            }
        }, x, y, z)
    }
}
