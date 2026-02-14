const gamediv = document.querySelector("#game");
const menudiv = document.querySelector("#menu");
const start = document.querySelector("#start");
const pname = document.querySelector("#playername");
const gameForm = document.querySelector("form");
const select = document.querySelector("#difficulty");
const table = document.querySelector("table");
const oname = document.querySelector("#outname");
const otime = document.querySelector("#time");
const odif = document.querySelector("#outdif");
const oscore = document.querySelector("#score");
const drawBtn = document.querySelector("#draw");
const overDiv = document.querySelector("#gameover");
const homeBtn = document.querySelector("#home");
const restartBtn = document.querySelector("#restart");


const evoscores = document.querySelector("#evoscores");


start.addEventListener("click", startGame);
table.addEventListener("click", clickTile);
drawBtn.addEventListener("click", clickDraw);
homeBtn.addEventListener("click", goToMenu);
restartBtn.addEventListener("click", restart);

let evolutionScores = {};
let gameBoard = [];
let images = [];
let ends = [];
let seconds;
let selected;
let interval;
let playername;
let score = 0;
let target1 = null;
let target2 = null;

function startGame(){
    playername = pname.value;
    if (playername == ""){return;}
    selected = select.value;
    menudiv.hidden = true;
    overDiv.hidden = true;
    gamediv.hidden = false;

    const difficultyLevels = ["easy", "medium", "hard"];
    const selectedIndex = difficultyLevels.indexOf(selected);
    const validEvolutions = evolutions.filter( evo => difficultyLevels.indexOf(evo.difficulty) <= selectedIndex);
    images = validEvolutions.flatMap(evo =>evo.steps.filter(step => step.step === 1).map(step => step.img));
    ends = validEvolutions.flatMap(evo =>evo.steps.filter(step => step.step === 6).map(step => step.img));

    for (let evo of evolutions) {
        evolutionScores[evo.name] = 0;
    }
    evoprint();


    for (let i = 0; i < levels[selected].rows; i++){
        const row = []
        for (let j = 0; j < levels[selected].cols; j++){
            row.push("empty")
        }
        gameBoard.push(row)
    }
    let numb = 4;
    if (selected === "medium") {numb  = 6;}
    else if (selected === "hard") {numb  = 8;}
    const randomstart = [];
    for (let i = 0; i<numb ; i++){randomstart.push(getRand1());}
    while (randomstart.length > 0){
        let l = Math.floor(Math.random() * gameBoard.length);
        let k = Math.floor(Math.random() * gameBoard[0].length);
        if(gameBoard[l][k] === "empty"){
            gameBoard[l][k] = randomstart.pop();
        }
    }

    paintTable()
    oname.textContent = playername;
    odif.textContent = selected;
    oscore.textContent = 0;

    seconds = levels[selected].time * 60;
    interval = setInterval(tick, 1000);     
}

function tick() {
    --seconds;
    if (seconds <= 0) { 
        gameOver()
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    otime.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getRand1() {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

function paintTable(){
    table.innerHTML ="";
    for(let i = 0; i<gameBoard.length; i++){
        const tr = document.createElement("tr");
        for(let j = 0; j<gameBoard[i].length; j++){
            const td = document.createElement("td");
            if(gameBoard[i][j] !== "empty"){
                td.style.backgroundImage = "url(assets/logos/"+ gameBoard[i][j] +")";
            }else{
                td.style.backgroundImage = "";
            }
            tr.append(td);
            table.appendChild(tr);
        }
    }
    addHoverEffectToTiles();
}

function clickTile(event){
    if (event.target.tagName !== "TD") return;

    const td = event.target;
    const tr = td.parentElement;
    const rowIndex = Array.from(tr.parentElement.children).indexOf(tr);
    const colIndex = Array.from(tr.children).indexOf(td);

    if (!target1 && gameBoard[rowIndex][colIndex] === "empty") {
        gameBoard[rowIndex][colIndex] = getRand1();
        paintTable();
        return;
    }

    if (gameBoard[rowIndex][colIndex] === "empty") return;

    if (!target1) {
        if (ends.includes(gameBoard[rowIndex][colIndex])) {
            gameBoard[rowIndex][colIndex] = getNext(gameBoard[rowIndex][colIndex]);
            paintTable();
            return;
        }
        
        target1 = { row: rowIndex, col: colIndex };
        td.classList.add("red");
        drawBtn.disabled = true;
    } 

    else if (!target2 && !(target1.row === rowIndex && target1.col === colIndex)) {
        target2 = { row: rowIndex, col: colIndex };

        const firstVal = gameBoard[target1.row][target1.col];
        const secondVal = gameBoard[target2.row][target2.col];

        if (firstVal === secondVal) {
            gameBoard[target2.row][target2.col] = getNext(secondVal);
            gameBoard[target1.row][target1.col] = "empty";
            clickDraw();
        }

        target1 = null;
        target2 = null;
        drawBtn.disabled = false;
        paintTable();
    }
}




function getNext(image) {
    for (let evo of evolutions) {
        for (let i = 0; i < evo.steps.length; i++) {
            if (evo.steps[i].img === image) {
                if (evo.steps[i].step === 6) {
                    const evolutionName = evo.name;
                    const points = evo.points;
                    evolutionScores[evolutionName] += points;
                    evoprint()
                    score += points;
                    oscore.textContent = score;
                    return "empty"; 
                }
                if (evo.steps[i + 1]) {
                    return evo.steps[i + 1].img;
                }
            }
        }
    }
}

function evoprint(){
    evoscores.textContent = "";
    for (const key in evolutionScores) {
        if (evolutionScores.hasOwnProperty(key)) {
            evoscores.textContent += `${key} = ${evolutionScores[key]}\n`;
        }
    }; 
}
        


function clickDraw(){
    let haveEmpty = false;
    for(let i = 0; i < gameBoard.length;i++){
        for(let j = 0; j<gameBoard[i].length; j++){
            if (gameBoard[i][j] === "empty"){
                haveEmpty = true;
                break;
            }
        }
        if (haveEmpty) break;
    }
    let b = true;
    while(haveEmpty && b){
        let i = Math.floor(Math.random() * gameBoard.length);
        let j = Math.floor(Math.random() * gameBoard[0].length);
        if(gameBoard[i][j] ==="empty"){
            gameBoard[i][j] = getRand1();
            b = false;
        }
    }
    console.log(gameBoard);
    paintTable();
}

function addHoverEffectToTiles() {
    const tdElements = document.querySelectorAll("td"); 
    const tooltip = document.querySelector("#tooltip");
    const tooltipText = document.querySelector("#tooltip-text");
    
    tdElements.forEach(td => {
        let tooltipTimeout;
        td.addEventListener("mouseenter", () => {
            tooltipTimeout = setTimeout(() => {
                const bgImg = td.style.backgroundImage;
                if (!bgImg) return;
                const match = bgImg.match(/\/([^\/]+\.png)/);
                if (!match) return;
                const imageName = match[1];
                let found = false;
                for (const evo of evolutions) {
                    for (const step of evo.steps) {
                        if (step.img === imageName) {
                            tooltip.style.display = "block";
                            tooltipText.innerHTML = `
                                <strong>${evo.name}</strong><br>
                                ${evo.description}<br>
                                <img src="assets/evolutions/${evo.tooltip}" />
                            `;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                const rect = td.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
                tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
                
            }, 1000);
        });

        td.addEventListener("mouseleave", () => {
            clearTimeout(tooltipTimeout);
            tooltip.style.display = "none";
        });
    });
}

function gameOver(){
    gamediv.hidden = false;
    overDiv.hidden = false;
    clearInterval(interval);
    interval = undefined;
    evolutionScores = {};
    gameBoard = [];
    images = [];
    ends = [];
    seconds = 0;
    score = 0;
    target1 = null;
    target2 = null;
}

function goToMenu(){
    menudiv.hidden = false;
    gamediv.hidden = true;
    overDiv.hidden = true;
    playername = "";

}

function restart(){
    table.innerHTML="";
    startGame();
}






