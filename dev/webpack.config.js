const HtmlWebPackPlugin = require('html-webpack-plugin')

const htmlWebpackPlugin = new HtmlWebPackPlugin({
  template: './examples/index1.html',
  filename: './index.html'
})

module.exports = {
  entry: {
    app: ['./src/index.js']
  },
  plugins: [
    htmlWebpackPlugin
  ]
}
