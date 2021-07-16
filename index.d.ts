
declare function persist4browser(options?: Partial<OptionType>): {
    save: typeof persistState;
    read: typeof readState;
};
declare function persistState(state: {}): {};
declare function readState(initialState?: {}): any;
declare type OptionType = {
    fields: string[]
    expire: string
    prefix: string
    encrypt: null | undefined | string | boolean
}
