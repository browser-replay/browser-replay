declare const _default: {
    test: {
        /**
         * Keeps old (pre-jest 29) snapshot format
         * its a bit ugly and harder to read than the new format,
         * so we might want to remove this in its own PR
         */
        snapshotFormat: {
            escapeString: boolean;
            printBasicPrototype: boolean;
        };
        /**
         * Use forks instead of threads for Vite 6 compatibility
         * Vite 6 has issues with worker threads not cleaning up properly
         * causing tests to hang indefinitely
         */
        pool: string;
    };
};
export default _default;
