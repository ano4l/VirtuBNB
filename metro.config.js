const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    const base = path.resolve(__dirname, moduleName.slice(2));
    const filePath = [base, `${base}.tsx`, `${base}.ts`, `${base}.js`].find((candidate) => fs.existsSync(candidate));
    if (filePath) return { type: 'sourceFile', filePath };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
