import Discord from 'discord.js';
import fs from 'fs-extra';
import configModule from 'config';
const config: Config = configModule.util.toObject(configModule);

const main = async (role: string, dryrun: boolean) => {
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

      const qrfilename = `out/${role}/${userData.code}.png`;
      if (!fs.existsSync(qrfilename)) {
        console.warn('QRコードの画像ファイルが無い');
        continue;
      }

      const messageBase = fs.readFileSync(`data/${role}.txt`).toString();
      const message = messageBase.replace('{code}', userData.code);

      const dmchannel = await member.createDM();
      if (sendedId.includes(dmchannel.id)) {
        console.log('もう送ったのでskip');
        continue;
      }

      const sendObj = {
        content: message,
        files: [qrfilename],
      };

      if (!dryrun) {
        try {
          const result = await dmchannel.send(sendObj);
          fs.appendFileSync('data/send.log', JSON.stringify(result, null, '  ') + ',\n');

          sendedId.push(dmchannel.id);
          fs.appendFileSync(sendedfilename, `${dmchannel.id}\n`);
        } catch (e) {
          console.log((e as any).message);
        }
      } else {
        fs.appendFileSync('data/send.log', JSON.stringify({ id: member.id, sendObj }, null, '  ') + ',\n');
      }
    }

    // ログアウト
    client.destroy();
  } catch (error) {
    console.error('何かエラーがあった');
    console.error(error);
    process.exit();
  }
};

/** 送信が終わったやつ */
let sendedId: string[] = [];
let sendedfilename = 'data/send.log';

(() => {
  const dryrun = false;

  if (fs.existsSync(sendedfilename)) {
    sendedId = fs.readFileSync(sendedfilename).toString().split('\n');
  }

  const role: string = process.argv[2];
  if (role !== 'runner' && role !== 'commentator' && role !== 'volunteer' && role !== 'guest') {
    console.warn('引数のroleがおかしい: ' + role);
    process.exit(1);
  }
  sendedfilename = `data/send_${role}.log`;

  main(role, dryrun);
})();
