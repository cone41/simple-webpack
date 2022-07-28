const path = require('path')
const ChangeOutPutPath = require('./ChangeOutPutPath')
const jsonLoader = require('./json-loader')

module.exports = {
   mode: "development",
   entry: './src/index.js',
   output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'main.js'
   },
   module: {
      rules: [
         {
            test: /\.json$/,
            use: jsonLoader
         }
      ]
   },
   plugins: [
      new ChangeOutPutPath()
   ]

}