import { registerAs } from '@nestjs/config';

export default registerAs('line', () => ({
  // LINE Channel credentials
  channelId: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,

  // LINE LIFF
  liffId: process.env.LINE_LIFF_ID,

  // LINE API endpoints
  apiEndpoint: 'https://api.line.me',
  loginEndpoint: 'https://access.line.me/oauth2/v2.1/authorize',
  tokenEndpoint: 'https://api.line.me/oauth2/v2.1/token',
  profileEndpoint: 'https://api.line.me/v2/profile',

  // LINE Messaging API
  messagingApiEndpoint: 'https://api.line.me/v2/bot/message',
  pushEndpoint: 'https://api.line.me/v2/bot/message/push',
  replyEndpoint: 'https://api.line.me/v2/bot/message/reply',

  // LINE Notify (if needed)
  notifyEndpoint: 'https://notify-api.line.me/api/notify',
}));
