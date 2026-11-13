var seed;

var run = true;

function randomFloat() {
    let gets = seed += 0X6D2B79F5;
    gets = Math.imul(gets ^ (gets >>> 15), gets | 61);
    return ((gets ^ (gets >>> 14)) >>> 0) / 4294967296;
}

function random(n) {
    return randomFloat() * n;
}

const sin = (d) => (Math.sin(d / 180 * Math.PI));
const cos = (d) => (Math.cos(d / 180 * Math.PI));
const abs = Math.abs;
const min = Math.min;
const max = Math.max;
const sum = (l) => ((l.length === 1) ? l[0] - 0 : l.pop() + sum(l));

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

var trun = false;
var move = false;
var mouse = { x: 0, y: 0 };

var dx = -120;
var dy = -40;

var tx = 0;
var ty = 0;

var scale = 5;

function reload() {
    run = true;

    const sizeExp = inputInfo.TB1 - 0;

    const length = 2 ** sizeExp + 1;

    var map;
    var value;

    seed = inputInfo.TB0 - 0;

    const getIndex = (x, y) => map[((y >= 0) ? y : length + y)][((x >= 0) ? x : length + x)];
    const setIndex = (x, y, v) => map[((y >= 0) ? y : length + y)][((x >= 0) ? x : length + x)] = v;

    const getValue = (x, y) => value[((y >= 0) ? y : length + y)][((x >= 0) ? x : length + x)];
    const setValue = (x, y, v) => value[((y >= 0) ? y : length + y)][((x >= 0) ? x : length + x)] = v;

    var sin_dx;
    var cos_dx;
    var sin_dy;
    var cos_dy;

    var paint = [];

    var maxHeight = 0;
    var minHeight = 0;
    const boxHeight = 5;
    const boxLine = inputInfo.TD2;
    const seaLine = inputInfo.TD0;
    const heightLine = inputInfo.TD1;
    const seaHeight = inputInfo.TD3;

    const color = [
        [0, 45, 88],
        [0, 115, 162],
        [43, 174, 192],
        [129, 221, 176],
        [130, 204, 38],
        [255, 231, 148],
        [233, 146, 84],
        [255, 127, 127],
    ];

    var data;

    class line {
        drawX = 0;
        drawY = 0;
        constructor(x, y, h) {
            this.x = x;
            this.y = y;
            this.h = h;
        }
        update() {
            [this.drawX, this.drawY] = turnPos(this.x, this.y);
            this.drawH = max(0.1, (max(0, this.h - seaHeight) + 2) * cos_dy) * length / 60;
        }
        draw() {
            if (this.drawX * scale < -window.innerWidth / 2 - tx || this.drawX * scale > window.innerWidth / 2 - tx) return;
            let px = this.x + (length - 1) / 2;
            let py = (length - 1) / 2 - this.y;
            ctx.beginPath();
            ctx.strokeStyle = rgb(px, py, this.h);
            ctx.moveTo(this.drawX, this.drawY);
            ctx.lineTo(this.drawX, this.drawY - this.drawH);
            ctx.stroke();
            ctx.closePath();
        }
    }

    function summon() {
        data = [
            [inputInfo.TB2 - 0, 0.5, inputInfo.TB3 - 0],
        ];

        for (let x = 0; x < initMap.length; x++) {
            for (let y = 0; y < initMap[x].length; y++) {
                let h = initMap[x][y];
                let r;
                if (h === 'fill') continue;
                else if (h === 'random') {
                    h = 0;
                    r = 50;
                } else {
                    h = h - 0;
                    r = 5;
                }
                data.push([x / (initMap.length - 1), y / (initMap[x].length - 1), h, r]);
            }
        }
        console.log(initMap, data);

    }

    function turnPos(x, y) {
        let drawX = x * cos_dx + y * sin_dx;
        let drawY = -(y * cos_dx - x * sin_dx) * sin_dy;;
        return [drawX, drawY];
    }

    function rgb(x, y, h) {
        if (h === maxHeight) return '#ffffff';

        if (h < seaHeight && seaLine) {
            if (x > 1 && getValue(x - 1, y) > seaHeight) return '#ff00ff';
            if (y > 1 && getValue(x, y - 1) > seaHeight) return '#ff00ff';
            if (x < length - 2 && getValue(x + 1, y) > seaHeight) return '#ff00ff';
            if (y < length - 2 && getValue(x, y + 1) > seaHeight) return '#ff00ff';
        }

        if (h > seaHeight && heightLine) {
            if (x > 0 && Math.ceil(getValue(x - 1, y) / 10) > Math.ceil(getValue(x, y) / 10)) return '#ffffff';
            if (y > 0 && Math.ceil(getValue(x, y - 1) / 10) > Math.ceil(getValue(x, y) / 10)) return '#ffffff';
            if (x < length - 1 && Math.ceil(getValue(x + 1, y) / 10) > Math.ceil(getValue(x, y) / 10)) return '#ffffff';
            if (y < length - 1 && Math.ceil(getValue(x, y + 1) / 10) > Math.ceil(getValue(x, y) / 10)) return '#ffffff';
        }

        maxHeight -= boxHeight - 1;
        let lcolor;
        let rcolor;
        let r;
        if (h > seaHeight) {
            lcolor = color[max(0, Math.ceil(((h - seaHeight) / (maxHeight - seaHeight)) * 3) + 3)];
            rcolor = color[max(0, Math.ceil(((h - seaHeight) / (maxHeight - seaHeight)) * 3) + 4)];
            r = ((h - seaHeight) / (maxHeight - seaHeight) * 3) - Math.ceil((h - seaHeight) / (maxHeight - seaHeight) * 3) + 1;
        } else {
            lcolor = color[max(0, 4 - Math.ceil(abs((h - seaHeight) / (minHeight - seaHeight)) * 3))];
            rcolor = color[max(0, 3 - Math.ceil(abs((h - seaHeight) / (minHeight - seaHeight)) * 3))];
            r = (abs((h - seaHeight) / (minHeight - seaHeight)) * 3) - Math.ceil(abs((h - seaHeight) / (minHeight - seaHeight)) * 3) + 1;
        }

        let d = ((getValue(x, y) > 0) ? (
            1 + (
                (h - getValue((x > 1) ? x - 1 : x, (y > 1) ? y - 0 : y)) * 0.05 +
                (h - getValue((x > 1) ? x - 0 : x, (y > 1) ? y - 1 : y)) * 0.05 +
                (h - getValue((x > 1) ? x - 1 : x, (y > 1) ? y - 1 : y)) * 0.025
            ) * length / 100
        ) : 1);
        maxHeight += boxHeight - 1;

        try {
            return `rgb(${
            max(0, (255, (lcolor[0] + (rcolor[0] - lcolor[0]) * r) * d))
        }, ${
            max(0, (255, (lcolor[1] + (rcolor[1] - lcolor[1]) * r) * d))
        }, ${
            max(0, (255, (lcolor[2] + (rcolor[2] - lcolor[2]) * r) * d))
        })`;
        } catch (e) {
            return '#ff00ff';
        }
    }

    function drawLine() {
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';

        if (dx > 180) {
            ctx.moveTo(...turnPos((length - 1) / 2, (length - 1) / 2));
            ctx.lineTo(...turnPos((length - 1) / 2, -(length - 1) / 2));
            ctx.stroke();
        } else {
            ctx.moveTo(...turnPos(-(length - 1) / 2, (length - 1) / 2));
            ctx.lineTo(...turnPos(-(length - 1) / 2, -(length - 1) / 2));
            ctx.stroke();
        }
        if (abs(180 - dx) > 90) {
            ctx.moveTo(...turnPos((length - 1) / 2, (length - 1) / 2));
            ctx.lineTo(...turnPos(-(length - 1) / 2, (length - 1) / 2));
            ctx.stroke();
        } else {
            ctx.moveTo(...turnPos((length - 1) / 2, -(length - 1) / 2));
            ctx.lineTo(...turnPos(-(length - 1) / 2, -(length - 1) / 2));
            ctx.stroke();
        }
        let [p0, p1, p2, p3] = [
            turnPos((length - 1) / 2, (length - 1) / 2),
            turnPos(-(length - 1) / 2, (length - 1) / 2),
            turnPos(-(length - 1) / 2, -(length - 1) / 2),
            turnPos((length - 1) / 2, -(length - 1) / 2)
        ]
        ctx.moveTo(p0[0], p0[1] - (max(0, maxHeight - seaHeight) + 2) * cos_dy * length / 60);
        ctx.lineTo(p1[0], p1[1] - (max(0, maxHeight - seaHeight) + 2) * cos_dy * length / 60);
        ctx.moveTo(p1[0], p1[1] - (max(0, maxHeight - seaHeight) + 2) * cos_dy * length / 60);
        ctx.lineTo(p2[0], p2[1] - (max(0, maxHeight - seaHeight) + 2) * cos_dy * length / 60);
        ctx.moveTo(p2[0], p2[1] - (max(0, maxHeight - seaHeight) + 2) * cos_dy * length / 60);
        ctx.lineTo(p3[0], p3[1] - (max(0, maxHeight - seaHeight) + 2) * cos_dy * length / 60);
        ctx.moveTo(p3[0], p3[1] - (max(0, maxHeight - seaHeight) + 2) * cos_dy * length / 60);
        ctx.lineTo(p0[0], p0[1] - (max(0, maxHeight - seaHeight) + 2) * cos_dy * length / 60);
        ctx.stroke();

        ctx.closePath();
    }

    function resize() {
        canvas.style.width = `${window.innerWidth * (1 - showTool * 0.3)}px`;
        canvas.style.height = `${window.innerHeight}px`;
        canvas.width = window.innerWidth * (1 - showTool * 0.3);
        canvas.height = window.innerHeight;

        sin_dx = sin(dx);
        cos_dx = cos(dx);
        sin_dy = sin(dy);
        cos_dy = cos(dy);
    }

    function reset() {
        summon();
        map = Array.from({ length: length }, (_) => Array(length).fill(null));
        value = Array.from({ length: length }, (_) => Array(length).fill(null));

        for (let i = 1; i < data.length; i++) setIndex(
            Math.round((length - 1) * data[i][0]),
            Math.round((length - 1) * data[i][1]),
            data[i][2] + (random(data[i][3] * 2) - data[i][3])
        );

        let step = 2 ** (sizeExp - 1);

        while (step >= 1) {
            for (let x = step; x < length; x += step * 2) {
                for (let y = step; y < length; y += step * 2) {
                    if (getIndex(x, y) !== null) continue;
                    let t = 0;
                    let l = 0;
                    let d = [
                        [1, 1],
                        [-1, 1],
                        [-1, -1],
                        [1, -1]
                    ];
                    for (let r of d) {
                        if (
                            x + r[0] * step < 0 ||
                            y + r[1] * step < 0 ||
                            x + r[0] * step >= length ||
                            y + r[1] * step >= length
                        ) continue;
                        t += getIndex(x + r[0] * step, y + r[1] * step);
                        l++;
                    }
                    setIndex(x, y, (t / l + (random(data[0][0] * 2) - data[0][0])));
                }
            }
            for (let x = 0; x < length; x += step) {
                for (let y = 0; y < length; y += step) {
                    if (getIndex(x, y) !== null) continue;
                    let t = 0;
                    let l = 0;
                    let d = [
                        [1, 0],
                        [-1, 0],
                        [0, 1],
                        [0, -1]
                    ];
                    for (let r of d) {
                        if (
                            x + r[0] * step < 0 ||
                            y + r[1] * step < 0 ||
                            x + r[0] * step >= length ||
                            y + r[1] * step >= length
                        ) continue;
                        t += getIndex(x + r[0] * step, y + r[1] * step);
                        l++;
                    }
                    setIndex(x, y, (t / l + (random(data[0][0] * 2) - data[0][0])));
                }
            }

            data[0][0] *= data[0][1];
            step *= 0.5;

            maxHeight = 0;
            minHeight = 0;
        }

        for (let x = 0; x < length; x++) {
            for (let y = 0; y < length; y++) {
                if (getIndex(x, y) === null) continue;
                let t = 0;
                let l = 0;
                for (let dx = -data[0][2]; dx <= data[0][2]; dx++) {
                    for (let dy = -data[0][2]; dy <= data[0][2]; dy++) {
                        if (
                            x + dx < 0 ||
                            y + dy < 0 ||
                            x + dx >= length ||
                            y + dy >= length
                        ) continue;
                        if (getIndex(x + dx, y + dy) === null) continue;
                        t += (data[0][2] * 2 + 1 - abs(dx) - abs(dy)) * getIndex(x + dx, y + dy);
                        l += (data[0][2] * 2 + 1 - abs(dx) - abs(dy));
                    }
                }
                setValue(x, y, (t / l));
                if ((t / l) < minHeight) minHeight = (t / l);
                if ((t / l) > maxHeight) maxHeight = (t / l);
            }
        }

        maxHeight += boxHeight;
        if (boxLine) {
            setValue(0, 0, maxHeight);
            setValue(0, -1, maxHeight);
            setValue(-1, -1, maxHeight);
            setValue(-1, 0, maxHeight);
        }

        init();
    }

    function init() {
        paint = [];
        for (let x = 0; x < length; x++) {
            for (let y = 0; y < length; y++) {
                if (getValue(x, y) === null) continue;
                paint.push(new line(x - (length - 1) / 2, (length - 1) / 2 - y, getValue(x, y)));
            }
        }
    }

    function update() {
        resize();

        dy = min(max(dy, -90), -0.01);
        dx = (dx + 360) % 360;
        dx = dx.toFixed(3) - 0;
        ctx.save();
        ctx.translate(canvas.width / 2 + tx, canvas.height * 3 / 5 + ty);
        ctx.scale(scale, scale);
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        for (index of paint) index.update();
        paint.sort((a, b) => -dy * (a.drawY - b.drawY));
        for (index of paint) index.draw();

        if (boxLine) {
            drawLine();
        }

        ctx.restore();

        if (run) requestAnimationFrame(update);
        else setTimeout(reload, 10);
    }

    resize();
    reset();
    update();
}
canvas.addEventListener('mousemove', (e) => {
    let deltaX = mouse.x - e.pageX;
    let deltaY = mouse.y - e.pageY;
    mouse.x = e.pageX;
    mouse.y = e.pageY;
    if (trun) {
        dx -= deltaX / 2 / Math.sqrt(scale);
        dy += deltaY / 2 / Math.sqrt(scale);
        dy = min(max(dy, -90), -0.01);
    } else if (move) {
        tx -= deltaX;
        ty -= deltaY;
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) trun = true;
    if (e.button === 0) move = true;
    if (e.button === 1) reset();
});

document.addEventListener('mouseup', (e) => {
    if (e.button === 2) trun = false;
    if (e.button === 0) move = false;
});

canvas.addEventListener('wheel', (e) => {
    if (e.deltaY < 0) {
        if (scale < 100) {
            scale *= 11 / 9;
            tx *= 11 / 9;
            ty *= 11 / 9;
        }
    } else if (scale > 0.05) {
        scale *= 9 / 11;
        tx *= 9 / 11;
        ty *= 9 / 11;
    }
});

document.addEventListener('contextmenu', (e) => { e.preventDefault(); });
document.addEventListener('selectstart', (e) => { e.preventDefault(); });
document.addEventListener('dragstart', (e) => { e.preventDefault(); });