import * as dotenv from 'dotenv';
import { IgApiClient } from 'instagram-private-api';

dotenv.config();

export class InstagramService {
  private ig: IgApiClient;

  constructor() {
    this.ig = new IgApiClient();
  }

  async login() {
    const username = process.env.INSTAGRAM_USERNAME;
    const password = process.env.INSTAGRAM_PASSWORD;

    if (!username || !password) {
      throw new Error('INSTAGRAM_USERNAME or INSTAGRAM_PASSWORD not set');
    }

    this.ig.state.generateDevice(username);
    await this.ig.account.login(username, password);
    console.log('Logged in to Instagram as:', username);
  }

  async getLatestMessages() {
    const inbox = this.ig.feed.directInbox();
    const threads = await inbox.items();
    return threads.map(thread => ({
      id: thread.thread_id,
      users: thread.users.map(u => u.username),
      lastMessage: thread.last_permanent_item?.text || '',
      timestamp: thread.last_activity_at
    }));
  }

  async sendMessage(threadId: string, text: string) {
    const thread = this.ig.entity.directThread(threadId);
    await thread.broadcastText(text);
    console.log(`Sent message to thread ${threadId}: ${text}`);
  }
}
