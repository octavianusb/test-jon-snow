const path = require('path');

module.exports = {
    webpack: {
        configure: (config) => {
            // Allow .mjs from node_modules
            config.module.rules.push({
                test: /\.m?js$/,
                include: /node_modules\/pdfjs-dist/,
                type: 'javascript/auto',
            });

            // file-loader will emit pdf.worker.mjs as static asset
            config.module.rules.push({
                test: /pdf\.worker\.min\.mjs$/,
                include: path.resolve(__dirname, 'node_modules/pdfjs-dist/build'),
                use: [{
                    loader: require.resolve('file-loader'),
                    options: {
                        name: 'static/media/[name].[contenthash].[ext]',
                    },
                }],
            });

            // Loader for WASM from pdfjs-dist
            config.module.rules.push({
                test: /\.wasm$/,
                include: /node_modules\/pdfjs-dist/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/wasm/[name][ext]',
                },
            });

            return config;
        },
    },
    style: {
        postcss: {
            mode: 'file',
        },
    },
};
