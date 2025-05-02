// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            // In Next.js the config.externals might be an array or a function.
            // We’ll prepend a function that checks for 'node-fetch' requests.
            if (Array.isArray(config.externals)) {
                // @ts-expect-error idk
                config.externals.unshift((context, request, callback) => {
                    if (request === 'node-fetch') {
                        // Tell webpack that "node-fetch" should be treated as a CommonJS module.
                        return callback(null, 'commonjs node-fetch');
                    }
                    callback();
                });
            } else if (typeof config.externals === 'object' && config.externals !== null) {
                // Fallback: if externals is an object, add an entry for node-fetch.
                config.externals['node-fetch'] = 'commonjs node-fetch';
            }

            // Ensure that webpack prefers the CommonJS entry point
            // (usually under the "main" field) over the ESM "module" field.
            if (config.resolve && config.resolve.mainFields) {
                config.resolve.mainFields = ['main', 'module'];
            }
        }

        return config;
    },
    serverExternalPackages: ['@mysten/walrus', '@mysten/walrus-wasm'],
};

export default nextConfig;
