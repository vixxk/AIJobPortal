const axios = require('axios');
const fireworksApi = axios.create({
    baseURL: 'https://api.fireworks.ai/inference/v1/chat/completions',
    headers: {
        'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
        'Content-Type': 'application/json'
    }
});
module.exports = fireworksApi;