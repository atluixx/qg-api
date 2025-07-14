import axios from 'axios';
import 'dotenv/config';

const API_KEY = process.env.CLOUD_API;
const TOPIC = 'PrintMessage';
const universe = 8088082175;

const sendMessage = async (message) => {
  try {
    const response = await axios.post(
      `https://apis.roblox.com/messaging-service/v1/universes/${universe}/topics/${TOPIC}`,
      { message },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Message sent:', response.status);
  } catch (error) {
    console.error(
      '❌ Error sending message:',
      error.response?.data || error.message
    );
  }
};

await sendMessage('Hello!');
