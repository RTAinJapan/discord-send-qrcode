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
  "date": ["12/26", "12/27", "12/28", "12/29", "12/30", "12/31"],
  "guildId": "DiscordサーバのID(数値のやつ)",
  "discordToken": "Token"
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

# 実行

- QR 画像作成

```shll
yarn createqr:runner
```

- DM 送信

```
yarn sendqr:runner
```
