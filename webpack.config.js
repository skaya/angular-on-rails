const path = require('path');
const webpack = require('webpack');
const ChunkWebpack = webpack.optimize.CommonsChunkPlugin;

const rootDir = path.resolve(__dirname, '.');

const config = {
    debug: true,
    devtool: 'source-map',
    entry: {
        vendor: [ path.resolve(rootDir, 'frontend', 'vendor') ],
        app: [ path.resolve(rootDir, 'frontend', 'app') ]
    },
    output: {
      path: (process.env.NODE_ENV === 'production') ? path.join(__dirname, 'public', 'frontend') : path.join(__dirname, 'frontend'),
      filename: '[name]-bundle.js',
      publicPath: "/frontend/"
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'to-string!style!css'
            },
            {
                test: /\.scss$/,
                loader: 'to-string!style!css!sass'
            },
            {
                test: /\.html$/,
                loader: 'html?-minimize'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file?name=assets/[name].[hash].[ext]',
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts!angular2-template-loader'
            }

        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor-bundle.js")
    ],

    resolve: {
        root: [
            path.resolve('./frontend/assets/')
        ],
        extensions: ['', '.js', '.ts']
    }
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
            compress: { screw_ie8: true }
        })
    )
}


module.exports = config
