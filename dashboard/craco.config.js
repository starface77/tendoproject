module.exports = {
  devServer: {
    allowedHosts: 'all',
    host: 'localhost',
    port: 3001,
    hot: true,
    open: true,
    setupMiddlewares: (middlewares, devServer) => {
      // Custom middleware setup if needed
      return middlewares;
    }
  }
};