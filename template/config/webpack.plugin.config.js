const glob = require('glob')
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const { dependencies } = require('../package.json')

module.exports = {
    entry: {
        plugins: path.join(__dirname, '../plugins/main.js')
    },
    externals: [],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        extractCSS: process.env.NODE_ENV === 'production',
                        loaders: {
                            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
                            scss: 'vue-style-loader!css-loader!sass-loader'
                        }
                    }
                }
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, '../dist/')
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.css', '.node']
    },
    devtool: "source-map",
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: false
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
}