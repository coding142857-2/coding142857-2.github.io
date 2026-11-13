var showTool = !0;
var inputInfo = {
    TA0: '00022E0961912FF000000FF000000000000000000000000000000FF000000FF1117F',

    TB0: 0,
    TB1: 6,
    TB2: 30,
    TB3: 1,

    TC0: 2,
    TC1: 0,
    TC2: false,
    TC3: false,

    TD0: false,
    TD1: false,
    TD2: false
};
var setIndex = [0, 0];
var initMap = [];
var size = 5;
var styleType = ['gress', 'ocean', 'random'];
var code;

const $ = t => document.querySelector(t);

const toolBar = $('#tool-bar');
const toolControl = $('#tool-control');
const mapGround = $('#map-ground');

function resetMatrix() {
    const e = $('#matrix');
    while (e.firstChild) {
        e.removeChild(e.firstChild);
    }
    e.style.height = `${e.clientWidth}px`;
    initMap = [];
    for (let x = 0; x < size; x++) {
        initMap.push([]);
        for (let y = 0; y < size; y++) {
            initMap[x].push('fill');
            let box = document.createElement('div');
            box.className = 'matrix-object';
            box.style.position = 'relative';
            box.style.display = 'inline-block';
            box.style.width = box.style.height = `calc((100% / ${size}) - (var(--border) * 2))`;
            box.style.setProperty('--border', `calc(3px / ${size} * 3)`);
            box.id = `matrix-${x}-${y}`;
            box.addEventListener('click', e => {
                setMode(e.currentTarget.id);
            })
            e.appendChild(box);
        }
        e.appendChild(document.createElement('br'));
    }
    setMode(`matrix-0-0`);
}

function setMode(id) {
    const c = id.split('-');
    setIndex = [c[1], c[2]];
    for (const e of document.getElementsByClassName('matrix-object')) {
        e.classList.remove('choose');
    }
    $(`#${id}`).classList.add('choose');
    getMap(...setIndex);
}

function getMap(x, y) {
    const h = initMap[x][y];
    if (h === 'random') {
        inputInfo.TC1 = 0;
        inputInfo.TC2 = true;
        inputInfo.TC3 = false;
    } else if (h === 'fill') {
        inputInfo.TC1 = 0;
        inputInfo.TC2 = false;
        inputInfo.TC3 = true;
    } else {
        inputInfo.TC1 = h - 0 || 0;
        inputInfo.TC2 = false;
        inputInfo.TC3 = false;
    }
    $('#TC1').value = inputInfo.TC1 - 0 || 0;
    $('#TC2').classList[inputInfo.TC2 ? 'add' : 'remove']('choose');
    $('#TC3').classList[inputInfo.TC3 ? 'add' : 'remove']('choose');
    setMap(x, y);
}

function setMap(x, y) {
    for (let t of styleType) $(`#matrix-${x}-${y}`).classList.remove(t);
    if (inputInfo.TC2 === true) {
        inputInfo.TC1 = 0;
        $('#TC1').value = 0;
        inputInfo.TC3 = false;
        initMap[x][y] = 'random';
        $(`#matrix-${x}-${y}`).classList.add('random');
    } else if (inputInfo.TC3 === true) {
        inputInfo.TC1 = 0;
        $('#TC1').value = 0;
        inputInfo.TC2 = false;
        initMap[x][y] = 'fill';
    } else {
        $('#TC1').value = inputInfo.TC1 - 0 || 0;
        initMap[x][y] = inputInfo.TC1;
        if ($('#TC1').value < 0) $(`#matrix-${x}-${y}`).classList.add('ocean');
        else $(`#matrix-${x}-${y}`).classList.add('gress');
    }
    $('#TC2').classList[inputInfo.TC2 ? 'add' : 'remove']('choose');
    $('#TC3').classList[inputInfo.TC3 ? 'add' : 'remove']('choose');
}

function reset() {
    resetMatrix();
    for (const e of document.getElementsByClassName('checkbox')) {
        e.addEventListener('click', e => {
            e.currentTarget.classList.toggle('choose');
            inputInfo[e.currentTarget.id] = e.currentTarget.classList.contains('choose');
            update(e.currentTarget.id);
        })
    }
    for (const e of document.getElementsByTagName('input')) {
        e.addEventListener('input', e => {
            if (e.currentTarget.type === 'number') {
                if (e.currentTarget.value > e.currentTarget.max - 0) e.currentTarget.value = e.currentTarget.max - 0;
                if (e.currentTarget.value < e.currentTarget.min - 0) e.currentTarget.value = e.currentTarget.min - 0;
            }
            inputInfo[e.currentTarget.id] = e.currentTarget.value;
            update(e.currentTarget.id);
        });
    }
    update('TA0');
    reload();
}

function barEvent(type = 'show') {
    if (type === 'show') {
        toolControl.classList.add('onBar');
        toolBar.classList.add('onBar');
        mapGround.classList.add('onBar');
    } else {
        toolControl.classList.remove('onBar');
        toolBar.classList.remove('onBar');
        mapGround.classList.remove('onBar');
    }
}

function read(code) {
    code = code.split('');

    function gets(length) {
        let s = '';
        for (let i = 0; i < length; i++) s += code.shift();
        return s;
    }

    function readInput(id, type, length) {
        if (type === 'Int') {
            inputInfo[id] = parseInt(gets(length), 16);
            $(`#${id}`).value = inputInfo[id];
        }
        if (type === 'Bool') {
            inputInfo[id] = !!parseInt(gets(length), 16);
            if (inputInfo[id]) {
                $(`#${id}`).classList.add('choose');
            } else {
                $(`#${id}`).classList.remove('choose');
            }
        }
        update(id);
    }

    function readMatrix(x, y) {
        setIndex = [x, y];
        d = parseInt(gets(2), 16);
        if (d === 0) {
            initMap[x][y] = 'fill';
            getMap(...setIndex);
        } else if (d === 255) {
            initMap[x][y] = 'random';
            getMap(...setIndex);
        } else {
            initMap[x][y] = d - 127;
            getMap(...setIndex);
        }
    }
    readInput('TB0', 'Int', 8);
    readInput('TB1', 'Int', 1);
    readInput('TB2', 'Int', 2);
    readInput('TB3', 'Bool', 1);
    readInput('TC0', 'Bool', 1);
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            readMatrix(x, y);
        }
    }
    setMode('matrix-0-0');
    readInput('TD0', 'Bool', 1);
    readInput('TD1', 'Bool', 1);
    readInput('TD2', 'Bool', 1);
    readInput('TD3', 'Int', 2);
}

toolControl.addEventListener('click', (e) => {
    if (showTool = !showTool) barEvent('show');
    else barEvent('hide');

})
toolBar.addEventListener('click', (e) => {
    if (!showTool) {
        if (showTool = !showTool) barEvent('show');
        else barEvent('hide');
    }
})
window.addEventListener('load', reset);

function update(id) {
    if (id === 'TC0') {
        size = (2 ** (inputInfo.TC0 - 0) + 1)
        $('#matrix').ariaLabel = size;
        setIndex = [0, 0];
        resetMatrix();
    }
    if (id === 'TC1') {
        setMap(...setIndex);
    }
    if (id === 'TC2') {
        inputInfo.TC3 = false;
        setMap(...setIndex);
    }
    if (id === 'TC3') {
        inputInfo.TC2 = false;
        setMap(...setIndex);
    }
    if (id === 'TA0') {
        // $('#TA0').classList.add('error');
        // $('#TA0').classList.remove('error');
        read(inputInfo.TA0);
    } else {
        code = '';
        code += (inputInfo.TB0 - 0).toString(16).padStart(8, '0');
        code += (inputInfo.TB1 - 0).toString(16).padStart(1, '0');
        code += (inputInfo.TB2 - 0).toString(16).padStart(2, '0');
        code += (inputInfo.TB3 - 0).toString(16).padStart(1, '0');
        code += (inputInfo.TC0 - 0).toString(16).padStart(1, '0');
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let h = initMap[x][y];
                if (h === 'random') code += 'FF';
                else if (h === 'fill') code += '00';
                else code += ((h - 0) + 127).toString(16).padStart(2, '0');
            }
        }
        code += (inputInfo.TD0 - 0).toString(16).padStart(1, '0');
        code += (inputInfo.TD1 - 0).toString(16).padStart(1, '0');
        code += (inputInfo.TD2 - 0).toString(16).padStart(1, '0');
        code += (inputInfo.TD3 - 0 + 127).toString(16).padStart(2, '0');
        $('#TA0').value = code.toUpperCase();
        run = false;
    }
}