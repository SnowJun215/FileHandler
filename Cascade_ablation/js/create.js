let create = new Game(document.getElementById('create'), shake);
create.initCreate();

function getQuestion() {
    console.log(JSON.stringify(Game.getOriginData(create.resultList)));
}

function resetQuestion() {
    create.resetCreate();
}