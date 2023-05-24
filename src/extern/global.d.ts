// Prints everything.
declare function print(...values: any[]): void;

// Reads the config value for key.
declare function readConfig(key: string, defaultValue?: any): any;

// Registers keySequence as a global shortcut. When the shortcut is invoked the
// callback will be called. Title and text are used to name the shortcut and
// make it available to the global shortcut configuration module.
declare function registerShortcut(
    title: string, text: string, keySequence: string,
    callback: (action: any) => any,
): boolean;

declare const workspace: KWin.WorkspaceWrapper;
declare const options: KWin.Options;

declare interface Signal<T> {
    connect(callback: T): void;
    disconnect(callback: T): void;
}
