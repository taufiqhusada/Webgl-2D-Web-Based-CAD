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

var jenis;
var jumlahSisi;
var menu;

function processInput() {
    var input_jenis = document.getElementById("input_jenis");
    jenis = input_jenis.value;

    var input_color = document.getElementById("input_color");
    currColor = input_color.value;

    var input_jumlahSisi = document.getElementById("input_jumlahSisi");
    jumlahSisi = input_jumlahSisi.value;

    var input_menu = document.getElementById("input_menu");
    menu = input_menu.value;
}

function processDataFromFile() {
    console.log(data);
    for (var i = 0; i < data.length; ++i) {
        listObj.push(new Obj(data[i].jenis, data[i].jumlahSisi, data[i].vertices, data[i].color));
    }
}

window.onload = function init() {
    processDataFromFile();
    processInput();

    var canvas = document.getElementById('my_Canvas');
    gl = canvas.getContext('webgl');

    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    render(gl, listObj);

    canvas.addEventListener("mousedown", function (event) {
        if (menu == "drawing") {

            
            if (jenis === "square") { jumlahSisi = 4; }

            if (cntMouseClicked == jumlahSisi - 1 || (jenis === "square" && cntMouseClicked == 1)) {

                if (jenis === "square") {
                    
                    let x0 = currVertices[currVertices.length - 3];
                    let y0 = currVertices[currVertices.length - 2];
                    let x1 = 2 * event.clientX / canvas.width - 1;
                    let y1 = 2 * (canvas.height - event.clientY) / canvas.height - 1;

                    currVertices.push(
                        x0, y1, 0.0,
                        x1, y1, 0.0,
                        x1, y0, 0.0
                    );

                } else {
                    currVertices.push(2 * event.clientX / canvas.width - 1, 2 * (canvas.height - event.clientY) / canvas.height - 1, 0.0);
                }

                listObj.push(new Obj(jenis, jumlahSisi, currVertices, currColor));

                // fungsi ada di common.js
                render(gl, listObj);

                currVertices = []
                cntMouseClicked = 0;
            }
            else {
                cntMouseClicked += 1;
                currVertices.push(2 * event.clientX / canvas.width - 1, 2 * (canvas.height - event.clientY) / canvas.height - 1, 0.0);
            }
        }
    });
}

