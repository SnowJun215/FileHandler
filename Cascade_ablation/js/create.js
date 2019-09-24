let create = new Game(document.getElementById('create'), shake);
create.initCreate();

function getQuestion() {
    console.log(JSON.stringify(Game.getOriginData(create.resultList)));
}

function resetQuestion() {
    this.clearArea();
    this.initArea(0, 0, this.canvas.width, Math.ceil(this.itemWidth * 6));
    this.initArea(0, Math.ceil(this.itemWidth * 6 + 10), this.canvas.width, this.canvas.height);
    this.drawBlock(this.data);
    this.drawBlock(this.resultList || [], {x: 0, y: this.itemWidth * 6 + 10});
}