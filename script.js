var cntMouseClicked = 0;

function Obj(jenis, jumlahSisi, vertices, color) {
    this.jenis = jenis;
    this.jumlahSisi = parseInt(jumlahSisi);
    this.vertices = vertices;
    this.color = color;
}

var listObj = [];

var currVertices = [];
var currColor;
var idxSelected = -1; // buat ngubah size square

var jenis;
var jumlahSisi;
var menu;

const origin_x = 512, origin_y = 285;

function processInput() {
    // Reads input
    var input_jenis = document.getElementById("input_jenis");
    jenis = input_jenis.value;

    var input_color = document.getElementById("input_color");
    currColor = input_color.value;

    var input_jumlahSisi = document.getElementById("input_jumlahSisi");
    jumlahSisi = input_jumlahSisi.value;

    var input_menu = document.getElementById("input_menu");
    menu = input_menu.value;

    document.getElementById("new-size").disabled = true; // disable slider
    
    if (jenis == "square") { // set jumlah sisi to 4 
        input_jumlahSisi.value = 4;
        jumlahSisi = 4;
    } else if (jenis == "line") { // set jumlah sisi to 1
        input_jumlahSisi.value = 1;
        jumlahSisi = 2;
    } else if (menu == "change-size") {
        if (jenis == "polygon") {
            jenis = "square";
            input_jenis.value = "square";
        }
    }
}

function processDataFromFile() {
    // Reads a file from data.js
    for (var i = 0; i < data.length; ++i) {
        listObj.push(new Obj(data[i].jenis, data[i].jumlahSisi, data[i].vertices, data[i].color));
    }
}

function selectSquare(x, y) {

    for (let i = 0; i < listObj.length; i++) {
        let obj = listObj[i];
        if (obj.jenis === "square") {
            // Cek di dalam range square atau tidak
            let temp = obj.vertices;
            let x0 = temp[0], y0 = temp[1],
                x1 = temp[6], y1 = temp[7];
            // console.log(x0 + "," + x1 + "  " + y0 + "," + y1);

            if (x >= Math.min(x1, x0) && x <= Math.max(x1, x0)
                && y >= Math.min(y1, y0) && y <= Math.max(y1, y0)) {
                return i;
            }
        }
    }
    return -1;
}

window.onload = function init() {
    processDataFromFile();
    processInput();

    var slider = document.getElementById("new-size");
    var canvas = document.getElementById('my_Canvas');
    var clicked = false; var selectedObjIdx = 0, nearestIdx = 0;

    canvas.style.width = "1024px";
    canvas.style.height = "570px";

    gl = canvas.getContext('webgl');

    gl.clearColor(0.95, 0.90, 0.85, 0.9);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    render(gl, listObj);

    canvas.addEventListener("mousedown", function (event) {
        if (menu == "drawing") {// Handle input buat drawing

            if (cntMouseClicked == jumlahSisi - 1 || (jenis === "square" && cntMouseClicked == 1)) {

                if (jenis === "square") {

                    let x0 = currVertices[currVertices.length - 3]; let y0 = currVertices[currVertices.length - 2];
                    let currPos = getCursorPosition(event, canvas);
                    let x1 = currPos.x; let y1 = currPos.y;

                    let dx = Math.abs(x1 - x0); let dy = Math.abs(y1 - y0);
                    let ratio = canvas.height / canvas.width;

                    if (dy > dx) { // sisi persegi sebesar dx
                        currVertices.push(
                            x1, y0, 0.0,
                            x1, y0 + ((y1 > y0) ? 1 : -1) * (dx / ratio), 0.0,
                            x0, y0 + ((y1 > y0) ? 1 : -1) * (dx / ratio), 0.0
                        );
                    } else {
                        currVertices.push(
                            (x0 + ((x1 > x0) ? 1 : -1) * dy * ratio), y0, 0.0,
                            (x0 + ((x1 > x0) ? 1 : -1) * dy * ratio), y1, 0.0,
                            x0, y1, 0.0
                        );
                    }

                } else { // Polygon
                    let pos = getCursorPosition(event, canvas);
                    currVertices.push(
                        pos.x, pos.y, 0.0
                    );
                }

                listObj.push(new Obj(jenis, jumlahSisi, currVertices, currColor));

                // fungsi ada di common.js
                render(gl, listObj);

                currVertices = []
                cntMouseClicked = 0;
            }
            else {
                cntMouseClicked += 1;
                let pos = getCursorPosition(event, canvas);
                currVertices.push(pos.x, pos.y, 0.0);
            }
        } else if (menu == "change-size") {
            // Finds the nearest square or line
            let pos = getCursorPosition(event, canvas);
            let errMsg = document.getElementById("polyDetected");
            idxSelected = findNearestObj(listObj, pos.x, pos.y);
            if (listObj[idxSelected].jenis == "polygon") {
                errMsg.innerHTML = "Please select square or line";
            } else {
                slider.disabled = false; // Enables the slider menu
                errMsg.innerHTML = "";
            }
        }
        else if (menu == "change-color") {
            let pos = getCursorPosition(event, canvas);
            changeColor(canvas, pos, listObj);
            render(gl, listObj);
            clicked = false;
        }
        else if (menu == "move-point") {

            if (clicked) {
                let pos = getCursorPosition(event, canvas);
                listObj[selectedObjIdx].vertices[nearestIdx] = pos.x;
                listObj[selectedObjIdx].vertices[nearestIdx + 1] = pos.y;
                render(gl, listObj);
                clicked = false;
            } else {
                // pilih vertexnya dulu
                let pos = getCursorPosition(event, canvas);
                let idx = findNearestObj(listObj, pos.x, pos.y);
                let vert = listObj[idx].vertices;
                selectedObjIdx = idx;
                let minDist = 2;

                for (let i = 0; i < vert.length; i += 3) {
                    let tempDist = Math.min(minDist, eucDist(vert[i], vert[i + 1], pos));
                    if (minDist > tempDist) {
                        minDist = Math.min(minDist, eucDist(vert[i], vert[i + 1], pos));
                        nearestIdx = i;
                    }
                }

                clicked = true;
            }

        }
    });

    canvas.addEventListener('mousemove', function (event) {
        
        if (clicked) {

            // Cursor position
            let pos = getCursorPosition(event, canvas);
            listObj[selectedObjIdx].vertices[nearestIdx] = pos.x;
            listObj[selectedObjIdx].vertices[nearestIdx + 1] = pos.y;

            if (listObj[selectedObjIdx].jenis == "square") {
                // Special case : square could be only transformed to a rectangular form
                let vert = listObj[selectedObjIdx].vertices; // nearestIdx can only be the following values : 0, 3, 6, 9
                switch (nearestIdx) {
                    case 0:
                        vert[3] = pos.x; vert[4] = vert[7];
                        vert[9] = vert[6]; vert[10] = pos.y;
                        break;
                    case 3:
                        console.log(3);
                        vert[0] = pos.x; vert[1] = vert[10];
                        vert[6] = vert[9]; vert[7] = pos.y;
                        break;
                    case 6:
                        vert[3] = pos.x; vert[4] = vert[1];
                        vert[9] = vert[0]; vert[10] = pos.y;
                        break;
                    case 9:
                        console.log(9);
                        vert[0] = pos.x; vert[1] = vert[4];
                        vert[6] = vert[3]; vert[7] = pos.y;
                        break;
                }
            }
            render(gl, listObj);
        }
    });
}

function getCursorPosition(event, canvas) {
    // Returns cursor position relative to the WebGL Canvas
    const rect = canvas.getBoundingClientRect();
    const xpos = event.clientX - rect.left;
    const ypos = event.clientY - rect.top;

    return {
        x: (xpos - origin_x) / origin_x,
        y: ((ypos > origin_y) ? -1 : 1) * Math.abs(ypos - origin_y) / origin_y
    };
}

function resize() {
    // Updates the size of a square each time the slider adjusted
    // Pre-condiiton: idxSelectedSquare > -1
    let ratio = document.getElementById("new-size").value / 100;

    if(listObj[idxSelected].jenis == "square") {
        // Cari titik dua diagonal square
        let vertices = listObj[idxSelected].vertices;
        let x0 = vertices[0], y0 = vertices[1],
            x1 = vertices[6], y1 = vertices[7];

        listObj[idxSelected].vertices = [];
        listObj[idxSelected].vertices.push(
            x0, y0, 0.0,
            x0, y0 + ratio * (y1 - y0), 0.0,
            x0 + ratio * (x1 - x0), y0 + ratio * (y1 - y0), 0.0,
            x0 + ratio * (x1 - x0), y0, 0.0
        )

    } else { // resize line
        let vertices = listObj[idxSelected].vertices;
        let x0 = vertices[0], y0 = vertices[1],
            x1 = vertices[3], y1 = vertices[4];
        
        listObj[idxSelected].vertices = []; // New value
        listObj[idxSelected].vertices.push(
            x0, y0, 0.0,
            x0 + ratio * (x1 - x0), y0 + ratio * (y1 - y0), 0.0
        )   
    }

    render(gl, listObj);
    document.getElementById("new-size").value = 100; // Returns slider position to default
    document.getElementById("new-size").disabled = true;
}

function changeColor(canvas, pos, listObj) {
    let idxNearestObj = findNearestObj(listObj, pos.x, pos.y);
    listObj[idxNearestObj].color = currColor;
}

function findNearestObj(listObj, x, y) {
    let nearestDistance = Number.MAX_SAFE_INTEGER;
    let idxNearestObj = -1;
    for (var i = 0; i < listObj.length; ++i) {
        let obj = listObj[i];
        for (var j = 0; j < obj.jumlahSisi; j += 3) {
            // Calculate distance
            let dist = Math.pow(Math.pow(obj.vertices[j] - x, 2) + Math.pow(obj.vertices[j + 1] - y, 2), 0.5);
            if (dist < nearestDistance) {
                nearestDistance = dist;
                idxNearestObj = i;
            }
        }
    }
    return idxNearestObj;
}

function eucDist(x, y, pos) {
    // Calculates distance between two points
    return Math.pow(
        Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2),
        0.5
    )
}

var isHelp = false;
function displayHelp() {
    let help = document.getElementById("help");
    if (!isHelp) {
        help.innerHTML = `
        <h3> Klik tombol "Change Mode" setiap ada perubahan setting yang dilakukan </h3>
        <p>1. Drawing: Pilih menu "drawing" dan di sampingnya pilih model yang ingin digambar. <br>
        Khusus untuk polygon, pilih jumlah sisi yang diinginkan pada input jumlah sisi.</p> 
        <p>2. Change Size: Pilih menu "change size" dan tombol "Change Mode". <br>
        Klik model <b>square atau line</b> yang ingin diubah ukurannya<br>
        lalu geser slider ke kanan untuk memperbesar, dan kiri untuk memperkecil.<br></p>
        <p>3. Change Color: Pilih menu "change color", pilih warna yang diinginkan di menu dropdown ke tiga. Lalu, klik tombol "Change Mode". <br>
        Klik model pada canvas yang ingin diubah warnanya<br></p>
        <p>4. Move point: Pilih menu "move point" dan klik tombol "Change Mode". <br>
        Klik salah satu titik simpul pada model yang ingin diubah posisinya, lalu geser sesuai lokasi yang diinginkan, lalu klik lagi.<br></p>
        `;
    } else {
        help.innerHTML = "";
    }
    isHelp = !isHelp;
}