import Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import configModule from 'config';
const config: Config = configModule.util.toObject(configModule);

const main = async (role: string) => {
  try {
    //  Discordのトークン取得
    const token = config.discordToken ? config.discordToken : process.env.NODE_ENV_DISCORD_TOKEN;
    if (!token) throw new Error('Discord認証トークンが指定されていません。');

    // ファイル読込
    const filename = `data/${role}.json`;
    if (!fs.existsSync(filename)) {
      console.warn('ファイルが無い');
      process.exit(2);
    }
    const list: Users = JSON.parse(fs.readFileSync(filename).toString());

    // Discordログイン
    /** DiscordのClientオブジェクト */
    const client = new Discord.Client();
    await client.login(token);
    if (!client.user) throw new Error('ログインに失敗しました。');

    // 何か裏でいろいろしてるので準備完了を待つ
    await (async () => {
      return new Promise<void>((resolve, reject) => {
        client.once('ready', () => {
          console.log('Ready!');
          resolve();
        });
      });
    })();

    // 操作対象のサーバ取得
    const guild = await client.guilds.fetch(config.guildId);
    if (!guild) throw new Error('操作対象のサーバ情報を取得できません。');
    console.log(`サーバ名: ${guild.name}`);

    // オフライン勢も含めてサーバの全メンバーを取得する
    await guild.members.fetch();
    const guildFullMembers = guild.members.cache;

    // 付与対象に絞り込み
    const targetMember = guildFullMembers.filter((member) => {
      return list.map((item) => item.discordId).includes(member.id);
    });

    // 操作対象として指定されているのにサーバにいない人をチェック
    for (const member of list.map((item) => item.discordId)) {
      if (!targetMember.get(member)) console.warn(`サーバにいない： ${member}`);
    }

    // リストに合致したメンバーにDM送信
    for (const memberTmp of targetMember) {
      const member = memberTmp[1];
      console.log(`"${member.id}", "${member.user.tag}"`);
      const userData = list.find((item) => item.discordId === member.id);
      if (!userData) {
        console.warn('データ不整合');
        continue;
      }

      const file = `out/${role}/${userData.discordId}.png`;
      if (!fs.existsSync(file)) {
        console.warn('QRコードの画像ファイルが無い');
        continue;
      }

      const messageBase = fs.readFileSync(`data/${role}.txt`).toString();
      const message = messageBase.replace('{code}', userData.code);

      const dmchannel = await member.createDM();
      await dmchannel.send({
        content: message,
        files: [file],
      });
    }

    // ログアウト
    client.destroy();
  } catch (error) {
    console.error('何かエラーがあった');
    console.error(error);
    process.exit();
  }
};

/**
 * awaitで囲いたいreadFile
 * @param filePath ファイルのパス
 * @param code 文字コード
 * @return 読み込んだ文字列
 */
export const readFileText = (filePath: string, code: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, code, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

(() => {
  const role: string = process.argv[2];
  if (role !== 'runner' && role !== 'commentary' && role !== 'volunteer') {
    console.warn('引数のroleがおかしい: ' + role);
    process.exit(1);
  }
  main(role);
})();
