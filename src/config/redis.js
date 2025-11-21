import { createClient } from 'redis';

// Kết nối Redis ở localhost mặc định
const client = createClient({
    url: 'redis://127.0.0.1:6379'
});

client.on('error', (err) => console.log('❌ Redis Error:', err));
client.on('connect', () => console.log('✅ Connected to Redis'));

await client.connect();

export default client;