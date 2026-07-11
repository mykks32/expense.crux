const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Some packages' "exports" map resolves to a raw ESM build containing `import.meta`
// (e.g. zustand/middleware) when bundling for web, which Metro serves as a classic
// (non-module) script — `import.meta` is invalid there and crashes the whole bundle
// with a SyntaxError. Disabling package-exports resolution falls back to "main",
// which points at a proper CJS build with no `import.meta`.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './src/global.css' });
