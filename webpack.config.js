const webpack = require('webpack');
const path = require('path');

let APP_DIR		= path.resolve(__dirname,'app/');
let BUILD_DIR	= path.resolve(__dirname,'build');

module.exports = [
	{
		name: "Global",
		entry: APP_DIR + '/main.js',
		target:'node',
		output:{
			path: BUILD_DIR,
			filename: 'main.js'
		},
		module:{
			loaders:[
			{
				test : /\.jsx?/,
				include : APP_DIR,
				exclude : [/node_modules/],
				loader : 'babel-loader',
				query : {
					presets: ['es2015']
				}
			}
			]
		}
	}
];