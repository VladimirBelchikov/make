import { resolve, join } from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';
const PORT = Number.isNaN(Number(process.env.PORT)) ? 9000 : process.env.PORT;

const DIRNAME = resolve();

const config = {
  mode: isDev ? 'development' : 'production',

  devtool: isDev ? 'source-map' : false,

  entry: {
    main: [
      resolve(DIRNAME, './src/index.js'),
      resolve(DIRNAME, './src/index.scss'),
    ],
  },

  output: {
    filename: '[name].[hash].bundle.js',
    path: resolve(DIRNAME, './dist/'),
    assetModuleFilename: 'assets/[name][ext][query]',
    clean: true,
  },

  resolve: {
    alias: {
      Assets: resolve(DIRNAME, './src/assets'),
      Components: resolve(DIRNAME, './src/components'),
      Layout: resolve(DIRNAME, './src/layout'),
      Src: resolve(DIRNAME, './src'),
    },
  },

  module: {
    rules: [
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: 'asset/resource',
        exclude: /images/,
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
      {
        test: /\.(ico|png|jpe?g|gif|svg)$/i,
        type: 'asset',
        exclude: /fonts/,
        generator: { filename: 'assets/[name][ext]' },
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: {
                  'postcss-preset-env': { browsers: 'last 4 versions' },
                },
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(html)$/,
        use: ['html-loader'],
      },
    ],
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    chunkIds: isDev ? 'named' : 'total-size',
    minimize: !isDev,
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 75,
              },
            },
          },
        },
      }),
    ].concat(isDev ? [] : [new TerserPlugin()]),
  },

  devServer: {
    historyApiFallback: true,
    static: {
      directory: join(DIRNAME, './dist/assets'),
    },
    open: true,
    compress: true,
    port: PORT,
    watchFiles: ['./src/**/*'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
  ].concat(isDev ? [] : [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].min.css',
      chunkFilename: '[name].[contenthash].min.css',
    }),
  ]),
};

export default config;
