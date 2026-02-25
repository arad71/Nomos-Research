module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        '@mui/icons-material': '@mui/icons-material/esm',
      };

      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        include: /node_modules\/(ra-ui-materialui|react-admin|ra-core|@react-admin)\//,
        resolve: {
          fullySpecified: false,
        },
      });
      return webpackConfig;
    },
  },
};
