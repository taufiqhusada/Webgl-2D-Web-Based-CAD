const dictColorVectors = {
    "black": [0.0, 0.0, 0.0],
    "red": [1.0, 0.0, 0.0],
    "yellow": [1.0, 1.0, 0.0],
    "green": [0.0, 1.0, 0.0],
    "blue": [0.0, 0.0, 1.0],
    "magenta": [1.0, 0.0, 1.0],
    "cyan": [0.0, 1.0, 1.0],
}

const vertCode = `attribute vec3 coordinates;
                    attribute vec3 color;
                    varying vec3 vColor;
                    void main(void) {
                        gl_Position = vec4(coordinates, 1.0);
                        vColor = color;
                }`;

const fragCode = `precision mediump float;
                    varying vec3 vColor;
                    void main(void) {
                    gl_FragColor = vec4(vColor, 1.);
                }`;

function render(gl, listObj) {
    ////////////////// append all /////////////////////
    [vertices, indices, colors] = appendAllVerticesIndicesColors(listObj);
    //console.log(vertices);
    //console.log(indices);
    //console.log(colors);

    ////////////////////// store to buffer ///////////////
    // Create an empty buffer object and store data
    var Index_Buffer = initBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)); 
    var vertex_buffer = initBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices));
    var color_buffer = initBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(colors));
    
    ////////////////////// shader //////////////////////
    var shaderProgram = initShader(gl)

    ////////////////// Associating shaders to buffer objects ////////////////////
    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Bind index buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

    // send attribute coordinate
    sendAttrToShader(shaderProgram, "coordinates", 3);

    // send attribute coolor
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    sendAttrToShader(shaderProgram, "color", 3);

    /////////////////////// draw /////////////////////////////
    drawAll(gl, listObj);
}

function appendAllVerticesIndicesColors(listObj) {
    vertices = []
    indices = []
    colors = []

    for (var i = 0; i < listObj.length; ++i) {
        vertices = vertices.concat(listObj[i].vertices);

        var currColors = []
        for (var j = 0; j < listObj[i].jumlahSisi; ++j) {
            currColors = currColors.concat(dictColorVectors[listObj[i].color]);
        }

        colors = colors.concat(currColors);

        lastIdx = indices.length;
        for (var j = 0; j < listObj[i].jumlahSisi; ++j) {
            indices.push(j + lastIdx);
        }
    }
    return [vertices, indices, colors]
}

function initBuffer(gl, type, dataToStore) {
    var buffer = gl.createBuffer();

    gl.bindBuffer(type, buffer);
    gl.bufferData(type, dataToStore, gl.STATIC_DRAW);
    gl.bindBuffer(type, null);

    return buffer;
}

function initShader(gl) {
    var vertShader = loadShader(gl, gl.VERTEX_SHADER, vertCode);
    var fragShader = loadShader(gl, gl.FRAGMENT_SHADER, fragCode);
   
    // Create a shader program object to store the combined shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    return shaderProgram;
}

function loadShader(gl, type, code) {
    shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    return shader;
}

function sendAttrToShader(shaderProgram, variableName, size){
    var attrLoc = gl.getAttribLocation(shaderProgram, variableName);
    gl.vertexAttribPointer(attrLoc, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrLoc);
}

function drawAll(gl, listObj) {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);

    console.log(listObj);
    var offset = 0;
    for (var i = 0; i < listObj.length; ++i) {
        var jumlahSisi = listObj[i].jumlahSisi;
        if (listObj[i].jenis == "polygon" || listObj[i].jenis == "square") {
            gl.drawElements(gl.TRIANGLE_FAN, jumlahSisi, gl.UNSIGNED_SHORT, 2 * offset);
        }
        else if (listObj[i].jenis == "line") {
            gl.drawElements(gl.LINES, jumlahSisi, gl.UNSIGNED_SHORT, 2 * offset);
        }
        offset += jumlahSisi;
    }
}

