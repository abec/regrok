var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: {
    app: ['webpack/hot/dev-server', './src/manage.js'],
  },
  output: {
    path: './public/built',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      loaders: ['babel-loader', 'react-hot'],
      include: path.join(__dirname, 'src')
    }, {
      test: /\.json$/,
      loader: "json"
    }]
  },
  node: {
    console: true,
    __dirname: true,
    __filename: true
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  target: "atom",
  noParse: /lie\.js$|\/leveldown\//
};
