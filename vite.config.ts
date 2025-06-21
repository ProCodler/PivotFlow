import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      nodePolyfills({
        // To exclude specific polyfills, add them to this list.
        exclude: [
          'fs', // Excludes the polyfill for `fs` and `node:fs`.
        ],
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Polyfill for 'stream' is often needed for crypto libraries
        // 'stream': 'vite-compatible-readable-stream',
        // Polyfill for 'buffer'
        'buffer': 'buffer/',
      },
    },
    define: {
      // By default, Vite doesn't include shims for NodeJS/CommonJS global variables like `process` or `Buffer`.
      // `vite-plugin-node-polyfills` handles many of these, but explicitly defining them can be necessary.
      'process.env': JSON.stringify(env), // Make all env vars available via process.env
      'global': 'globalThis', // Or 'window' or '{}' depending on needs
    },
    server: {
      port: 3000, // Optional: define a port for the dev server
      // proxy: { // Optional: configure proxy for local development if backend is on different port
      //   '/api': { // Example: if your canister calls are proxied via /api
      //     target: 'http://localhost:4943', // dfx local replica
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, ''),
      //   },
      // },
    },
    build: {
      // commonjsOptions: {
      //   transformMixedEsModules: true, // May be needed for some Dfinity libraries
      // },
      rollupOptions: {
        // Output settings if needed
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        // plugins: [
        //   NodeGlobalsPolyfillPlugin({
        //     process: true,
        //     buffer: true,
        //   }),
        //   NodeModulesPolyfillPlugin()
        // ] // These might require installing additional packages like @esbuild-plugins/node-globals-polyfill
      }
    },
    // Required by dfx when running `dfx deploy` or `dfx build`
    // This is only relevant if you are using dfx to build the frontend assets
    // For a standalone Vite build, this might not be necessary.
    // root: ".", // Default is process.cwd()
    // publicDir: "dist", // Default is "public"
  };
});
