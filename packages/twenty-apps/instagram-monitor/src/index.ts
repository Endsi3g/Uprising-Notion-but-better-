import { InstagramService } from './instagram-service';
import { OllamaIntegration } from './ollama-integration';

const instagram = new InstagramService();
const ollama = new OllamaIntegration();

const MONITOR_INTERVAL =
  parseInt(process.env.INSTAGRAM_MONITOR_INTERVAL || '300') * 1000;

async function startMonitor() {
  try {
    await instagram.login();
    console.log('Monitor started...');

    let lastProcessedTimestamps: Record<string, number> = {};

    setInterval(async () => {
      console.log('Checking for new messages...');
      const messages = await instagram.getLatestMessages();

      for (const msg of messages) {
        const timestamp = Number(msg.timestamp);
        if (
          !lastProcessedTimestamps[msg.id] ||
          timestamp > lastProcessedTimestamps[msg.id]
        ) {
          console.log(
            `New message from ${msg.users.join(', ')}: ${msg.lastMessage}`,
          );

          const response = await ollama.generateAction(msg.lastMessage);
          console.log('Ollama suggested response:', response.text);

          await instagram.sendMessage(msg.id, response.text);
          lastProcessedTimestamps[msg.id] = timestamp;
        }
      }
    }, MONITOR_INTERVAL);
  } catch (error) {
    console.error('Failed to start monitor:', error);
  }
}

startMonitor();
