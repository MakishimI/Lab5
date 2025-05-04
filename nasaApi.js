const https = require('https');

async function getDataFromApi(apiKey, date = null) {
    const baseUrl = 'https://api.nasa.gov/planetary/apod';
    const url = `${baseUrl}?api_key=${apiKey}${date ? `&date=${date}` : ''}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Помилка API: ${res.statusCode} - ${data}`));
                }
            });
        }).on('error', reject);
    });
}

module.exports = { getDataFromApi };
