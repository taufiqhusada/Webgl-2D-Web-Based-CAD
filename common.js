const dictColorVectors =  {
    "black": [0.0, 0.0, 0.0],
    "red": [1.0, 0.0, 0.0],
    "yellow": [1.0, 1.0, 0.0],
    "green": [0.0, 1.0, 0.0],
    "blue": [0.0, 0.0, 1.0],
    "magenta": [1.0, 0.0, 1.0],
    "cyan": [0.0, 1.0, 1.0],
  }

function render(gl, listObj) {
    ////////////////// append all /////////////////////
    [vertices, indices, colors] = appendAllVerticesIndicesColors(listObj);
    console.log(vertices);
    console.log(indices);
    console.log(colors);

    ////////////////////// store to buffer ///////////////
    // Create an empty buffer object and store Index data
    var Index_Buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Create an empty buffer object and store vertex data  
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Create an empty buffer object and store color data
    var color_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    ////////////////////// shader //////////////////////
    // vertex shader
    var vertCode = `attribute vec3 coordinates;
                        attribute vec3 color;
                        varying vec3 vColor;
                        void main(void) {
                            gl_Position = vec4(coordinates, 1.0);
                            vColor = color;
                    }`;

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    // fragment shader
    var fragCode = `precision mediump float;
                    varying vec3 vColor;
                    void main(void) {
                        gl_FragColor = vec4(vColor, 1.);
                    }`;
       

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    // Create a shader program object to store the combined shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    ////////////////// Associating shaders to buffer objects ////////////////////
    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Bind index buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

    // send attribute coordinate
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    // send attribute coolor
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var color = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(color);

    /////////////////////// draw /////////////////////////////
    drawAll(gl, listObj);
}

function appendAllVerticesIndicesColors(listObj) {
    vertices = []
    indices = []
    colors = []

    for (var i = 0; i<listObj.length; ++i){ 
        vertices = vertices.concat(listObj[i].vertices);

        var currColors = []
        for (var j = 0; j<listObj[i].jumlahSisi; ++j){
            currColors = currColors.concat(dictColorVectors[listObj[i].color]);
        }
    
        colors = colors.concat(currColors);

        lastIdx = indices.length;
        for (var j = 0; j<listObj[i].jumlahSisi; ++j){
            indices.push(j + lastIdx);
        }
    }
    return [vertices, indices, colors]
}

function drawAll(gl, listObj){
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);

    console.log(listObj);
    var offset = 0;
    for (var i = 0; i<listObj.length; ++i){
        var jumlahSisi = listObj[i].jumlahSisi;
        if (listObj[i].jenis=="polygon"){
            gl.drawElements(gl.TRIANGLE_FAN, jumlahSisi, gl.UNSIGNED_SHORT, 2*offset);
        }
        offset += jumlahSisi;
    }   
}
