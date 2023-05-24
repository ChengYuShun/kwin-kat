# KAT - KWin Automatic Tiling

A KWin script making use of the tiling features provided in version 5.27.

# Build & Test

To build the project, you will need:

- GNU make
- coreutils
- zip utility
- typescript compiler

To test the project, you will additionally need a javascript interpreter.

Build command:

```sh
make
```

Test command:

```sh
echo "JS = node" > config.mk  # or whatever interpreter you prefer
make test
```

# Acknowledges

This script is heavily inspired by by
[kwin-autotile](https://github.com/zeroxoneafour/kwin-autotile).

# License

This program is licensed under GPL version 3.0, and a license file can be
found at the root of the project.
