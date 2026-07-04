const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ─── Fix: tslib ESM/CJS interop crash on Metro web bundler ───────────────────
//
// Root cause:
//   moti → framer-motion → tslib
//   framer-motion imports tslib via its .mjs ESM files.
//   Metro resolves these using tslib's `exports` field, landing on:
//     tslib/modules/index.js  (Node ESM wrapper)
//   …which does `import tslib from 'tslib'` and then destructures:
//     const { __extends } = tslib.default   ← tslib.default is undefined in CJS!
//
// Fix: Use resolveRequest to intercept ALL tslib imports—regardless of which
// subpath or condition Metro would normally pick—and redirect to the pre-built
// CJS flat file (tslib/tslib.js), which exports all helpers at the top level.
//
const tslibCJS = path.resolve(__dirname, 'node_modules/tslib/tslib.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'tslib' ||
    moduleName === 'tslib/modules/index.js' ||
    moduleName.endsWith('/tslib/tslib.es6.mjs') ||
    moduleName.endsWith('/tslib/modules/index.js')
  ) {
    return { filePath: tslibCJS, type: 'sourceFile' };
  }
  // Fall back to default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
