type Config = {
  /** 
   * 日付のリスト
   * @example ['12/26','12/27']
   */
  date: string[];
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
}