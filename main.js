const fs = require('fs');
const readline = require('readline');
const { loadConfig } = require('./loadConfig');
const { getDataFromApi } = require('./nasaApi');

const specialDates = [
    { label: '🔭 Запуск James Webb Space Telescope', date: '2021-12-25' },
    { label: '🌌 Найпопулярніше APOD фото (2012)', date: '2012-02-12' },
    { label: '🌍 Земля з орбіти (2020)', date: '2020-04-22' },
    { label: '🪐 Юпітер крупним планом (2021)', date: '2021-08-19' },
    { label: '👉 Ввести власну дату', date: null }
];

function isValidApodDate(dateStr) {
    const minDate = new Date('1995-06-16');
    const maxDate = new Date();
    const inputDate = new Date(dateStr);
    return inputDate >= minDate && inputDate <= maxDate;
}

async function handleApiCall(date, apiKey) {
    if (!isValidApodDate(date)) {
        console.error(`🚫 Обрана дата (${date}) поза допустимим діапазоном: 1995-06-16 до сьогодні.`);
        return;
    }

    try {
        const data = await getDataFromApi(apiKey, date);

        console.log('\n📸 Фото дня від NASA:');
        console.log('📅 Дата:', data.date);
        console.log('🧾 Заголовок:', data.title);
        console.log('🔗 Посилання:', data.url);
        console.log('📝 Опис:', data.explanation.substring(0, 200) + '...');

        fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
        console.log('\n✅ Результат збережено у файлі output.json');
    } catch (err) {
        console.error('🚫 Помилка під час запиту:', err.message);
    }
}

async function promptUser(rl, question) {
    return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function main() {
    try {
        const config = await loadConfig('config.json');
        const apiKey = config.api_key;

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        let continueProgram = true;

        while (continueProgram) {
            console.log('\n🔭 Оберіть одну з визначних космічних дат або введіть свою:\n');
            specialDates.forEach((item, index) => {
                console.log(`${index + 1}. ${item.label} ${item.date ? `(${item.date})` : ''}`);
            });

            const choice = await promptUser(rl, '\nВаш вибір (1-5): ');
            const index = parseInt(choice) - 1;

            let selectedDate = null;

            if (index >= 0 && index < specialDates.length) {
                if (specialDates[index].date) {
                    selectedDate = specialDates[index].date;
                } else {
                    const customDate = await promptUser(rl, 'Введіть власну дату у форматі YYYY-MM-DD: ');
                    selectedDate = customDate;
                }

                await handleApiCall(selectedDate, apiKey);
            } else {
                console.log('❌ Некоректний вибір.');
            }

            const again = await promptUser(rl, '\n🔁 Бажаєте продовжити? (y/n): ');
            if (again.toLowerCase() !== 'y') {
                continueProgram = false;
            }
        }

        rl.close();
        console.log('\n👋 До побачення!');
    } catch (err) {
        console.error('🚫 Помилка при завантаженні конфігурації:', err.message);
    }
}

main();
