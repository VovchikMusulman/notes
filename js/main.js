// Компонент карточки заметки
Vue.component('note-card', {
    props: ['card', 'isSecondColumn', 'secondColumnCardCount'],
    template: `
        <div class="card" :style="{ backgroundColor: card.color }">
            <input type="text" v-model="card.title" placeholder="Заголовок карточки" />
            <ul>
                <li v-for="(item, itemIndex) in card.items" :key="itemIndex">
                    <input type="checkbox" v-model="item.completed" @change="updateCard" :disabled="!isSecondColumn && secondColumnCardCount >= 5">
                    <input type="text" v-model="item.text" placeholder="Пункт списка" />
                </li>
            </ul>
            <input type="text" v-model="newItemText" placeholder="Новый пункт списка" />
            <button @click="addItem" :disabled="itemCount >= 5">Добавить пункт</button>
            <input type="color" v-model="card.color" />
            <p v-if="card.completedDate">Завершено: {{ card.completedDate }}</p>
        </div>
    `,
    data() {
        return {
            newItemText: '', // Переменная для хранения текста нового пункта
        };
    },
    computed: {
        // Вычисляемое свойство для подсчета количества пунктов в карточке
        itemCount() {
            return this.card.items.length; // Количество пунктов в карточке
        }
    },
    methods: {
        // Метод для обновления состояния карточки
        updateCard() {
            this.$emit('update-card', this.card); // Эмитируем событие обновления карточки
        },
        // Метод для добавления нового пункта в список
        addItem() {
            if (this.newItemText.trim() !== '' && this.itemCount < 5) {
                this.card.items.push({ text: this.newItemText, completed: false }); // Добавляем новый пункт
                this.newItemText = ''; // Очищаем поле ввода
                this.updateCard(); // Обновляем карточку
            }
        }
    }
});

// Компонент колонки заметок
Vue.component('note-column', {
    props: ['column'],
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <note-card
                v-for="(card, cardIndex) in column.cards"
                :key="card.id"
                :card="card"
                :isSecondColumn="column.title === 'Столбец 2'"
                :secondColumnCardCount="getSecondColumnCardCount()"
                @update-card="$emit('update-card', $event)"
            ></note-card>
            <button v-if="canAddCard(column)" @click="$emit('add-card', column)">Добавить карточку</button>
        </div>
    `,
    methods: {
        // Метод для проверки, можно ли добавить новую карточку в колонку
        canAddCard(column) {
            if (column.title === 'Столбец 1' && column.cards.length >= 3) return false; // Ограничение для первого столбца
            if (column.title === 'Столбец 2' && column.cards.length >= 5) return false; // Ограничение для второго столбца
            return true; // Если ограничения не нарушены, возвращаем true
        },
        // Метод для получения количества карточек во втором столбце
        getSecondColumnCardCount() {
            const secondColumn = this.$parent.columns.find(col => col.title === 'Столбец 2');
            return secondColumn ? secondColumn.cards.length : 0; // Возвращаем количество карточек во втором столбце
        }
    }
});

// Основной компонент приложения заметок
Vue.component('note-app', {
    data() {
        return {
            columns: [
                { title: 'Столбец 1', cards: [] },
                { title: 'Столбец 2', cards: [] },
                { title: 'Столбец 3', cards: [] }
            ],
            nextCardId: 1 // Идентификатор для следующей карточки
        };
    },
    created() {
        this.loadCards(); // Загружаем карточки из localStorage при создании компонента
    },
    methods: {
        // Метод для загрузки карточек из localStorage
        loadCards() {
            const savedData = JSON.parse(localStorage.getItem('cards'));
            if (savedData) {
                this.columns = savedData.columns; // Загружаем колонки
                this.nextCardId = savedData.nextCardId; // Загружаем следующий ID карточки
            }
        },
        // Метод для сохранения карточек в localStorage
        saveCards() {
            localStorage.setItem('cards', JSON.stringify({ columns: this.columns, nextCardId: this.nextCardId }));
        },
        // Метод для добавления новой карточки в колонку
        addCard(column) {
            const newCard = {
                id: this.nextCardId++, // Увеличиваем ID для новой карточки
                title: `Карточка ${this.nextCardId}`, // Заголовок карточки
                color: '#f9f9f9', // Цвет по умолчанию
                items: [
                    { text: 'Пункт 1', completed: false },
                    { text: 'Пункт 2', completed: false },
                    { text: 'Пункт 3', completed: false }
                ],
                completedDate: null // Дата завершения по умолчанию
            };
            column.cards.push(newCard); // Добавляем новую карточку в колонку
            this.saveCards(); // Сохраняем изменения в localStorage
        },
        // Метод для обновления состояния карточки
        updateCard(card) {
            const completedItems = card.items.filter(item => item.completed).length; // Считаем завершенные пункты
            const totalItems = card.items.length; // Общее количество пунктов

            if (totalItems > 0) {
                const completionRate = completedItems / totalItems; // Рассчитываем процент завершения

                // Перемещение карточки в другой столбец в зависимости от процента завершения
                if (completionRate > 0.5 && this.columns[0].cards.includes(card)) {
                    this.moveCard(card, 1); // Перемещение во второй столбец
                } else if (completionRate === 1 && this.columns[1].cards.includes(card)) {
                    this.moveCard(card, 2); // Перемещение в третий столбец
                    card.completedDate = new Date().toLocaleString(); // Установка даты завершения
                }
            }
            this.saveCards(); // Сохраняем изменения в localStorage
        },
        // Метод для перемещения карточки между столбцами
        moveCard(card, targetColumnIndex) {
            for (let column of this.columns) {
                const index = column.cards.findIndex(c => c.id === card.id); // Находим индекс карточки
                if (index !== -1) {
                    column.cards.splice(index, 1); // Удаление из текущего столбца
                    this.columns[targetColumnIndex].cards.push(card); // Добавление в целевой столбец
                    break; // Выходим из цикла после перемещения
                }
            }
        }
    },
    template: `
        <div>
            <div class="columns">
                <note-column
                    v-for="(column, index) in columns"
                    :key="index"
                    :column="column"
                    @update-card="updateCard"
                    @add-card="addCard"
                ></note-column>
            </div>
        </div>
    `
});

// Создание экземпляра Vue приложения
new Vue({
    el: '#app' // Привязываем приложение к элементу с id "app"
});