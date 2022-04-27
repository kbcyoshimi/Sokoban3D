const path = require('path');

module.exports = {
  //>cd C:\xampp\htdocs\Sokoban3D\javascript
  //>webpack --watch もしくは >webpack --mode production

  // モードの設定
  mode: 'development',

  // エントリーポイントの設定
  entry: `./index.js`,

  // ファイルの出力設定
  output: {
    // 出力するファイル名
    filename: "bundle.js",

    //  出力先のパス
    path: path.join(__dirname, '../public/js')
  }
};