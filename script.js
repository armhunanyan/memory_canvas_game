const gameInfo = {
    get width() {
        return Math.min(window.innerWidth, 700);
    },
    get height() {
        return this.width
    },
    get gap() {
        return this.width / 70;
    },
    get images(){

        const images = [];

        for (let y = 0; y < (this.cells * this.rows / 2); y++) {

            images.push(`images/${y}.png`);

        }

        return images;
    },
    rows: 4,
    cells: 4,
}

class Game {

    #canFlip = true;

    #cards = [];

    #flippedCards = [];

    #steps = 0;

    #time = 0;

    #_int = null;

    constructor(canvas, infoPanel = null) {

        canvas.width = gameInfo.width;

        canvas.height = gameInfo.height;

        this.canvas = canvas;

        this.context = canvas.getContext('2d');

        this.page = 'game';

        if (infoPanel) {

            infoPanel.style.width = gameInfo.width + 'px';

            infoPanel.style.marginBottom = gameInfo.gap + 'px';

            this.infoPanel = infoPanel;

        }

    }

    #shuffleCards(array) {

        array.sort(() => Math.random() - 0.5);
    }

    #draw() {

        var that = this;

        this.context.clearRect(0, 0, gameInfo.width, gameInfo.height);

        if(this.page === 'game'){

            this.#cards.forEach(card => {
                card.render(that.context);
            });
    
            if(this.infoPanel){
    
                this.infoPanel.querySelector('*[data-time]').innerText = this.#time;
    
                this.infoPanel.querySelector('*[data-steps]').innerText = this.#steps;
            }
        }
        else if(this.page === 'final'){

            let textString = "Thank you";

            this.context.font = `${gameInfo.width / 15 }px Arial`;

            this.context.textBaseline = 'middle';

            this.context.textAlign = "center";

            this.context.fillText(textString , gameInfo.width/2, gameInfo.height/2);

        }

    }

    #render() {

        requestAnimationFrame(this.#render.bind(this));

        this.#cards = this.#cards.filter(card => {
            return card.hidden === false
        });

        if(this.#time > 0 && this.#cards.length === 0){

            this.#clearTime();

            this.page = 'final';

        }

        this.#draw();

    }

    flipCard(card) {

        if (this.#flippedCards.length > 0 && this.#flippedCards[0].id === card.id) {

            return false;

        } else {
            this.#flippedCards.push(card);
        }

        card.flip();

        if (this.#flippedCards.length === 2) {

            var that = this;

            this.#canFlip = false;

            this.#steps += 1;

            setTimeout(function() { //Hide cards or flip back

                if (Math.floor(that.#flippedCards[0].id / 2) === Math.floor(that.#flippedCards[1].id / 2)) {

                    that.#flippedCards[0].hide();

                    that.#flippedCards[1].hide();

                } else {
                    that.#flippedCards[0].flip();

                    that.#flippedCards[1].flip();
                }

                that.#canFlip = true;

                that.#flippedCards = [];

            }, 1000);

        }

    }

    #addUserEvents() {

        var that = this;

        this.canvas.addEventListener('click', function(e) {

            if (that.#canFlip) {

                that.#cards.forEach(card => {

                    if (e.offsetX > card.x && e.offsetX < card.x + card.width && e.offsetY > card.y && e.offsetY < card.y + card.height) {

                        that.flipCard(card);

                    }

                });

            }

        })

    }

    #createCards() {

        const cards = [];

        const cardsOrder = [...Array(gameInfo.rows * gameInfo.cells).keys()];

        this.#shuffleCards(cardsOrder);

        for (let i = 0; i < cardsOrder.length; i++) {

            const card = new Card(i, cardsOrder[i]);

            cards.push(card);

        }

        this.#cards = cards;
    }

    #countTime() {

        var that = this;

        this.#_int = setInterval(function() {

            that.#time += 1;

        }, 1000);

    }

    #clearTime(){

        clearInterval(this.#_int);

    }

    #start() {

        this.#createCards();

        this.#countTime();

    }

    refreshGame() {

        this.#time = 0;

        this.#steps = 0;

        this.#canFlip = true;

        this.#flippedCards = [];

        this.#createCards();

    }

    init() {

        this.#render();

        this.#addUserEvents();

        this.#start();

    }

}

class Card {

    constructor(i, id) {

        const x = i % gameInfo.cells;

        const y = Math.floor(i / gameInfo.cells);

        this.id = id;

        this.hidden = false;

        this.flipped = false;

        this.width = (gameInfo.width - (gameInfo.cells + 1) * gameInfo.gap) / gameInfo.cells;

        this.height = (gameInfo.height - (gameInfo.rows + 1) * gameInfo.gap) / gameInfo.rows;

        this.x = (this.width + gameInfo.gap) * x + gameInfo.gap;

        this.y = (this.height + gameInfo.gap) * y + gameInfo.gap;

        this.frontImage = document.createElement('img');

        this.frontImage.src = gameInfo.images[Math.floor(id / 2)];

        this.backImage = document.createElement('img');

        this.backImage.src = 'images/ball.png';

    }

    flip() {
        this.flipped = !this.flipped;
    }
    hide() {
        this.hidden = true;
    }

    render(contex) {

        contex.fillStyle = 'white';

        contex.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        contex.drawImage(
            (this.flipped ? this.frontImage : this.backImage),
            this.x,
            this.y,
            this.width,
            this.height
        );

    }
}


const game = new Game(document.getElementById('app'), document.getElementById('info-panel'));

game.init();