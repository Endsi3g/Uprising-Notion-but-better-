import * as path from 'path';
import { type UserConfig, defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isExternal = (id: string): boolean => {
  const isRelative = id.startsWith('.') || id.startsWith('\0');
  const isAbsolute = path.isAbsolute(id);
  const isProjectSrc =
    id.startsWith('src/') ||
    id.startsWith('@/') ||
    (isAbsolute && !id.includes('node_modules'));

  if (isRelative || isProjectSrc) {
    return false;
  }

  return true;
};

export default defineConfig((): UserConfig => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk-sdk',
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
    ],
    build: {
      minify: 'esbuild',
      sourcemap: true,
      outDir: './dist/sdk',
      emptyOutDir: false,
      lib: {
        entry: {
          index: 'src/sdk/index.ts',
        },
        formats: ['es'],
      },
      rollupOptions: {
        external: isExternal,
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src/sdk',
          entryFileNames: '[name].js',
        },
      },
    },
    logLevel: 'warn',
  };
});
