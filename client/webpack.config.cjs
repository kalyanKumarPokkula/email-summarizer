const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'main.js',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { targets: 'defaults' }]],
					},
				},
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: 'public/manifest.json', to: 'manifest.json' },
				{ from: 'src/styles.css', to: 'styles.css' },
			],
		}),
	],
	resolve: {
		extensions: ['.js'],
	},
};
