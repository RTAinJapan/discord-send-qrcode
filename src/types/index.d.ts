type Config = {
  /**
   * 操作対象のサーバID
   * @description サーバ名のところ右クリックしたらメニューが出てきて取得できる
   */
  guildId: string;
  /**
   * DiscordのAPIトークン
   * @description Configに無ければ環境変数 NODE_ENV_DISCORD_TOKEN を使用する
   */
  discordToken: string;
};

type Users = User[];
type User = {
  name: string;
  discordId: string;
  code: string;
};
