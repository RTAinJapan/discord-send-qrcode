import fs from 'fs-extra';
import QRCode from 'qrcode';
import configModule from 'config';
const config: Config = configModule.util.toObject(configModule);

/** QRの画像を生成 */
const createQr = async (role: string) => {
  // ファイル読込
  const filename = `data/${role}.json`;
  if (!fs.existsSync(filename)) {
    console.warn('ファイルが無い');
    process.exit(2);
  }
  const list: Users = JSON.parse(fs.readFileSync(filename).toString());

  const basedir = `out/${role}`;
  if (!fs.existsSync(basedir)) {
    fs.mkdirpSync(basedir);
  }

  // QR作成
  for (const item of list) {
    console.log(`${item.name} ${item.code}`);
    const qrpath = `${basedir}/${item.code}.png`;
    const text = item.code;
    const option: QRCode.QRCodeToFileOptions = {
      type: 'png', //未指定ならpng
      errorCorrectionLevel: 'H',
    };

    QRCode.toFile(qrpath, text, option, function (err) {
      if (err) {
        console.log(`${item.name} ${item.code} でエラー`);
        console.log(err);
      }
    });
  }
  console.log('完了');
};

// QR画像を出力
const role: string = process.argv[2];
if (role !== 'runner' && role !== 'commentator' && role !== 'volunteer' && role !== 'guest') {
  console.warn('引数のroleがおかしい: ' + role);
  process.exit(1);
}

createQr(role);
