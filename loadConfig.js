// loadConfig.js
const fs = require('fs/promises');

async function loadConfig(filename) {
    try {
        const data = await fs.readFile(filename, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Помилка завантаження конфігурації:", error);
        process.exit(1);
    }
}

module.exports = { loadConfig };
