let cards = JSON.parse(localStorage.getItem('cards')) || { column1: [], column2: [], column3: [] };

function render() {
    document.getElementById('cards1').innerHTML = '';
    document.getElementById('cards2').innerHTML = '';
    document.getElementById('cards3').innerHTML = '';

    // Отображаем карточки в первом столбце
    cards.column1.forEach((card, index) => {
        document.getElementById('cards1').innerHTML += createCardHTML(card, index, 1);
    });

    // Отображаем карточки во втором столбце
    cards.column2.forEach((card, index) => {
        document.getElementById('cards2').innerHTML += createCardHTML(card, index, 2);
    });

    // Отображаем карточки в третьем столбце
    cards.column3.forEach((card, index) => {
        document.getElementById('cards3').innerHTML += createCardHTML(card, index, 3);
    });

    // Скрываем или показываем кнопки добавления карточек в зависимости от количества карточек
    document.getElementById('addCardButton1').style.display = cards.column1.length < 3 ? 'block' : 'none';
    document.getElementById('addCardButton2').style.display = cards.column2.length < 5 ? 'block' : 'none';
}

// Функция для создания HTML-кода карточки
function createCardHTML(card, index, column) {
    const canMoveToNextColumn = (column === 1 && cards.column2.length < 5) || (column === 2 && cards.column3.length < 5);

    return `
        <div class="card" style="background-color: ${card.bgColor}; color: ${card.textColor};">
            <h3 contenteditable="true" onblur="editCardTitle(${column}, ${index}, this.innerText)">${card.title}</h3>
            <textarea onblur="editCardDescription(${column}, ${index}, this.value)">${card.description || ''}</textarea>
            <ul>
                ${card.items.map((item, i) => `
                    <li>
                        <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleItem(${column}, ${index}, ${i})" ${canMoveToNextColumn ? '' : 'disabled'}>
                        <span contenteditable="true" onblur="editItem(${column}, ${index}, ${i}, this.innerText)">${item.text}</span>
                    </li>
                `).join('')}
            </ul>
            <button onclick="customizeCard(${column}, ${index})">Кастомизировать</button>
            ${card.completedDate ? `<p>Завершено: ${card.completedDate}</p>` : ''}
        </div>
    `;
}

function addCard(column) {
    const title = prompt('Введите заголовок карточки:'); // Запрашиваем заголовок карточки
    let numberOfItems; // Переменная для хранения количества пунктов

    // Запрашиваем количество пунктов, пока пользователь не введет корректное значение
    do {
        numberOfItems = parseInt(prompt('Введите количество пунктов списка (от 3 до 5):'), 10);
    } while (isNaN(numberOfItems) || numberOfItems < 3 || numberOfItems > 5);

    const items = []; // Массив для хранения пунктов списка
    for (let i = 0; i < numberOfItems; i++) {
        const itemText = prompt(`Введите текст пункта списка ${i + 1}:`); // Запрашиваем текст для каждого пункта
        items.push({ text: itemText, completed: false }); // Добавляем пункт в массив
    }

    // Создаем новую карточку с заданными свойствами
    const newCard = { title, items, bgColor: '#fff', textColor: '#000', description: '' };

    // Проверяем, можно ли добавить карточку в выбранный столбец
    if (column === 1 && cards.column1.length < 3) {
        cards.column1.push(newCard); // Добавляем карточку в первый столбец
    } else if (column === 2 && cards.column2.length < 5) {
        cards.column2.push(newCard); // Добавляем карточку во второй столбец
    } else {
        alert('Достигнуто максимальное количество карточек в этом столбце.'); // Уведомляем пользователя о превышении лимита
    }

    saveAndRender(); // Сохраняем данные и обновляем отображение
}

function editCardTitle(column, index, newTitle) {
    cards['column' + column][index].title = newTitle; // Обновляем заголовок карточки
    saveAndRender(); // Сохраняем изменения и обновляем отображение
}

function editCardDescription(column, index, newDescription) {
    cards['column' + column][index].description = newDescription; // Обновляем описание карточки
    saveAndRender(); // Сохраняем изменения и обновляем отображение
}

function editItem(column, cardIndex, itemIndex, newText) {
    cards['column' + column][cardIndex].items[itemIndex].text = newText; // Обновляем текст пункта
    saveAndRender(); // Сохраняем изменения и обновляем отображение
}

function customizeCard(column, index) {
    const bgColor = prompt('Введите цвет фона (например, #ff0000):', cards['column' + column][index].bgColor); // Запрашиваем цвет фона
    const textColor = prompt('Введите цвет текста (например, #000000):', cards['column' + column][index].textColor); // Запрашиваем цвет текста
    cards['column' + column][index].bgColor = bgColor; // Обновляем цвет фона карточки
    cards['column' + column][index].textColor = textColor; // Обновляем цвет текста карточки
    saveAndRender(); // Сохраняем изменения и обновляем отображение
}

function toggleItem(column, cardIndex, itemIndex) {
    const card = cards['column' + column][cardIndex]; // Получаем карточку по индексу
    card.items[itemIndex].completed = !card.items[itemIndex].completed; // Переключаем состояние выполнения пункта

    const completedCount = card.items.filter(item => item.completed).length; // Считаем количество выполненных пунктов
    const totalCount = card.items.length; // Получаем общее количество пунктов

    if (column === 1) {
        // Если более 50% пунктов выполнены, перемещаем карточку во второй столбец
        if (completedCount > totalCount / 2 && cards.column2.length < 5) {
            cards.column2.push(cards.column1.splice(cardIndex, 1)[0]); // Перемещаем карточку во второй столбец
        }
    } else if (column === 2) {
        // Если все пункты выполнены, перемещаем карточку в третий столбец
        if (completedCount === totalCount && cards.column3.length < 5) {
            const completedCard = cards.column2.splice(cardIndex, 1)[0]; // Удаляем карточку из второго столбца
            completedCard.completedDate = new Date().toLocaleString(); // Устанавливаем дату и время завершения
            cards.column3.push(completedCard); // Перемещаем карточку в третий столбец
        }
    }
    saveAndRender(); // Сохраняем изменения и обновляем отображение
}

function deleteCard(column, index) {
    cards['column' + column].splice(index, 1); // Удаляем карточку по индексу
    saveAndRender(); // Сохраняем изменения и обновляем отображение
}

function saveAndRender() {
    localStorage.setItem('cards', JSON.stringify(cards)); // Сохраняем карточки в localStorage
    render(); // Обновляем отображение карточек
}

function clearAll() {
    cards = { column1: [], column2: [], column3: [] }; // Инициализируем пустые столбцы
    saveAndRender(); // Сохраняем изменения и обновляем отображение
}

// Вызов функции render при загрузке страницы
window.onload = function() {
    render(); // Отображаем карточки при загрузке
};