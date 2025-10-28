import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'juno',
  minifyCss: true,
  minifyJs: true,
  buildEs5: true,
  devServer: {
    reloadStrategy: 'pageReload',
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
};
