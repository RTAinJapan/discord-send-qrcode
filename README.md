# discord-send-qrcode

Discord のユーザに QR コードのリンクとか画像を送りつけるやつ

# 準備

## package インストール

```
yarn
```

## Config

- config/default.json

```json
{
  "guildId": "DiscordサーバのID(数値のやつ)",
  "discordToken": "Discord BotのToken"
}
```

## Data

- data/runner.json
- data/commentator.json
- data/volunteer.json

```json
[
  {
    "name": "ぱすた",
    "code": "1234567890abcdef",
    "discordId": "163962550780821506"
  },
  ...
]
```

- data/runner.txt
- data/commentary.txt
- data/volunteer.txt

```
DMで送りたいメッセージを
そのまま

書く
```

`{code}` という文字はQRコードの文字列に置換される。リンクとかを埋め込みたい時に利用。

# 実行

- QR 画像作成

```shll
yarn createqr:runner
```

- DM 送信

```
yarn sendqr:runner
```
