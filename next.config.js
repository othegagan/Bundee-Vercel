const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.unsplash.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: '**.pexels.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: '**.tshaonline.org',
                port: '',
            },
            {
                protocol: 'https',
                hostname: '**.istockphoto.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: '**.b-cdn.net',
                port: '',
            },
            {
                protocol: 'https',
                hostname: '**.fs1.hubspotusercontent-na1.net',
                port: '',
            },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {

        // Create a separate rule for @idscan/idvc2 CSS files
        config.module.rules.push({
            test: /node_modules\/@idscan\/idvc2\/.*\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        modules: false,
                    },
                },
            ],
        });

        // Add MiniCssExtractPlugin to plugins
        config.plugins.push(
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].css',
                chunkFilename: 'static/css/[id].css',
            })
        );

        // Add CopyWebpackPlugin for neural networks files
        config.plugins.push(new CopyPlugin({
            patterns: [
                {
                    from: 'node_modules/@idscan/idvc2/dist/networks/*',
                    to: 'networks/[name][ext]',
                    toType: 'template',
                },
            ],
        }));


        config.externals.push({ canvas: 'commonjs canvas' });
        return config;
    },
};

module.exports = nextConfig;
