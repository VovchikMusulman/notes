let cards = JSON.parse(localStorage.getItem('cards')) || { column1: [], column2: [], column3: [] };

function render() {
    document.getElementById('cards1').innerHTML = '';
    document.getElementById('cards2').innerHTML = '';
    document.getElementById('cards3').innerHTML = '';

    cards.column1.forEach((card, index) => {
        document.getElementById('cards1').innerHTML += createCardHTML(card, index, 1);
    });

    cards.column2.forEach((card, index) => {
        document.getElementById('cards2').innerHTML += createCardHTML(card, index, 2);
    });

    cards.column3.forEach((card, index) => {
        document.getElementById('cards3').innerHTML += createCardHTML(card, index, 3);
    });
}
