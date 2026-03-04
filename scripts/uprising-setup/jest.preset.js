/**
 * ============================================================
 * Project: Uprising CRM
 * Author: Uprising Studio
 * Description: jest.preset.js
 * Last Modified: 2026-03-04
 * ============================================================
 */
const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  // Override the new testEnvironmentOptions added in @nx/jest 22.3.3
  // which breaks Lingui's module resolution
  testEnvironmentOptions: {},
};

