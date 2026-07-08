# obs-jisin

OBS Studio 用の地震情報テロップ・天気予報・時計表示ツール。

## 機能

| 機能 | 説明 |
|------|------|
| 地震テロップ | P2P地震情報 WebSocket APIからリアルタイム取得、画面下部にスライドイン表示 |
| NHKスタイル時計 | 左上に日付・時刻を常時表示 |
| 天気予報 | 各地の現在気象・最高/最低気温・降水確率を右上に表示（30分更新） |

## セットアップ

1. このリポジトリをクローンまたはダウンロード
2. OBS Studio → ソース追加 → **ブラウザ**
3. 設定:
   - **ローカルファイル** にチェック → `index.html` を指定
   - 幅: `1920` / 高さ: `1080`
4. ソース位置・サイズは画面フルスクリーンに合わせる

## カスタマイズ

`config.js` を編集して動作を変更できます:

```js
const CONFIG = {
  // 時計の表示（true / false）
  clock: {
    enabled: true,
  },

  // 天気予報の表示
  weather: {
    enabled: true,
    cities: [
      { name: "東京", lat: 35.6762, lon: 139.6503 },
      // 緯度・経度で自由に追加可能
    ],
    updateInterval: 1800000, // 更新間隔（ミリ秒）
  },

  // 地震テロップ
  earthquake: {
    displayDuration: 15000,     // テロップ表示時間（ミリ秒）
    initialHistoryHours: 6,     // 起動時に過去何時間分を表示するか
  },
};
```

## データソース

| データ | 提供元 |
|--------|--------|
| 地震情報 | [P2P地震情報 API](https://www.p2pquake.net/)（気象庁データ）WebSocket |
| 天気予報 | [Open-Meteo](https://open-meteo.com/)（無料・APIキー不要） |
