import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import OfflinePlugin from 'offline-plugin';
import path from 'path';
const ENV = process.env.NODE_ENV || 'development';

const CSS_MAPS = ENV !== 'production';
var CompressionPlugin = require('compression-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const extractSass = new ExtractTextPlugin({
	filename: "[name].[contenthash].css",
	disable: process.env.NODE_ENV === "development"
});

module.exports = {
	context: path.resolve(__dirname, "src"),
	entry: {
		vendor1: ['react', 'react-router', 'react-router-dom', 'react-router-bootstrap','redux','react-redux'],
		vendor2: ['react-dom'],
		bootstrap: ['reactstrap'],
		app: ['./index.js']
	},
	output: {
		path: path.resolve(__dirname, "build"),
		publicPath: '/',
		filename: 'js/[name].js'
	},

	resolve: {
		extensions: ['.jsx', '.js', '.json', '.scss'],
		modules: [
			path.resolve(__dirname, "src/lib"),
			path.resolve(__dirname, "node_modules"),
			'node_modules'
		],
		alias: {
			components: path.resolve(__dirname, "src/components"),
			actions: path.resolve(__dirname, "src/actions"),
			reducers: path.resolve(__dirname, "src/reducers"),
			helpers: path.resolve(__dirname, "src/helpers"),
			store: path.resolve(__dirname, "src/store"),
			style: path.resolve(__dirname, "src/style"),
			// 'react': 'preact-compat',
			// 'react-dom': 'preact-compat'
		}
	},

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: path.resolve(__dirname, 'src'),
				enforce: 'pre',
				use: 'source-map-loader'
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				// Transform our own .(scss|css) files with PostCSS and CSS-modules
				test: /\.(scss|css)$/,
				include: [path.resolve(__dirname, 'src/components')],
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {modules: true, sourceMap: CSS_MAPS, importLoaders: 1}
						},
						{
							loader: `postcss-loader`,
							options: {
								sourceMap: CSS_MAPS,
								plugins: () => {
									autoprefixer({browsers: ['last 2 versions']});
								}
							}
						},
						{
							loader: 'sass-loader',
							options: {sourceMap: CSS_MAPS}
						}
					]
				})
			},
			{
				test: /\.(scss|css)$/,
				exclude: [path.resolve(__dirname, 'src/components')],
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {sourceMap: CSS_MAPS, importLoaders: 1}
						},
						{
							loader: `postcss-loader`,
							options: {
								sourceMap: CSS_MAPS,
								plugins: () => {
									autoprefixer({browsers: ['last 2 versions']});
								}
							}
						},
						{
							loader: 'sass-loader',
							options: {sourceMap: CSS_MAPS}
						}
					]
				})
			},
			{
				test: /\.json$/,
				use: 'json-loader'
			},
			{
				test: /\.(xml|html|txt|md)$/,
				use: 'raw-loader'
			},
			{
				test: /\.(jpe?g|png|gif)(\?.*)?$/i,
				use: ENV === 'production' ? 'file-loader' : 'url-loader'
			},
			{
				test: /\.(woff|woff2|eot|ttf|svg)$/,
				loader: ENV === 'production' ? 'file-loader' : 'url-loader',
				query: {
					name: 'fonts/glyphicons-halflings-regular.[ext]'
				}
			},
		]
	},
	plugins: ([
		new webpack.NoEmitOnErrorsPlugin(),
		new ExtractTextPlugin({
			filename: 'css/style.css',
			allChunks: true,
			disable: ENV !== 'production'
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(ENV)
		}),
		new HtmlWebpackPlugin({
			template: './index.ejs',
			minify: {collapseWhitespace: true},
		}),
		new CopyWebpackPlugin([
			{from: './manifest.json', to: './assets'},
			{from: './favicon.ico', to: './'}
		])
	]).concat(ENV === 'production' ? [
			extractSass,
			new BundleAnalyzerPlugin({
				analyzerMode: 'static'
			}),
			new webpack.optimize.UglifyJsPlugin({
				output: {
					comments: false
				},
				compress: {
					unsafe_comps: true,
					properties: true,
					keep_fargs: false,
					pure_getters: true,
					collapse_vars: true,
					unsafe: true,
					warnings: false,
					screw_ie8: true,
					sequences: true,
					dead_code: true,
					drop_debugger: true,
					comparisons: true,
					conditionals: true,
					evaluate: true,
					booleans: true,
					loops: true,
					unused: true,
					hoist_funs: true,
					if_return: true,
					join_vars: true,
					cascade: true,
					drop_console: true
				}
			}),
			new OfflinePlugin({
				relativePaths: false,
				AppCache: false,
				excludes: ['_redirects'],
				ServiceWorker: {
					events: true
				},
				cacheMaps: [
					{
						match: /.*/,
						to: '/',
						requestTypes: ['navigate']
					}
				],
				publicPath: '/'
			}),
			new webpack.optimize.CommonsChunkPlugin({names: ['app', 'bootstrap', 'vendor3', 'vendor2', 'vendor1']}),
			new﻿webpack.optimize.AggressiveMergingPlugin(),
			new CompressionPlugin({
				asset: "[path].gz[query]",
				algorithm: "gzip",
				test: /\.js$|\.css$|\.html$/,
				threshold: 10240,
				minRatio: 0.8
			}),
		] : []),

	stats: {colors: true},

	node: {
		global: true,
		process: false,
		Buffer: false,
		__filename: false,
		__dirname: false,
		setImmediate: false
	},

	devtool: ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',

	devServer: {
		port: process.env.PORT || 8080,
		host: 'localhost',
		publicPath: '/',
		contentBase: './src',
		historyApiFallback: true,
		open: true,
		openPage: '',
		proxy: {
			// OPTIONAL: proxy configuration:
			// '/optional-prefix/**': { // path pattern to rewrite
			//   target: 'http://target-host.com',
			//   pathRewrite: path => path.replace(/^\/[^\/]+\//, '')   // strip first path segment
			// }
		}
	}
};
