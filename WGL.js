function ShowError(errtxt)
{
    const errbox = document.getElementById("errbox");
    const errtxtel = document.createElement("p");
    errtxtel.innerText = errtxt;
    errbox.appendChild(errtxtel);
    console.log(errtxt);
}
//ShowError("This is a test error");

function GLmain()
{
/**@type {HTMLCanvasElement | null}*/

    const canvas = document.getElementById("glcanvas");
    if(!canvas)
    {
        ShowError("Could not find glcanvas. Might have yet be initialized, or typos present");
        return;
    }
    const gl = canvas.getContext("webgl2");
    if(!gl)
    {
        ShowError("WGL context not found, browser might not support WGL2");
        return;
    }

    const vertsource = `#version 300 es
    precision mediump float;

    vec2 poss[3] = vec2[]
    (
        vec2(-1.0, -1.0),
        vec2( 3.0, -1.0),
        vec2(-1.0,  3.0)
    );

    out vec2 uv;
    
    void main()
    {
        gl_Position = vec4(poss[gl_VertexID], 0.0, 1.0);
        uv = poss[gl_VertexID];
    }`;

    const fragsource = `#version 300 es
    precision mediump float;

    uniform float test;
    
    out vec4 fragcol;

    in vec2 uv;

    void main()
    {
        fragcol = vec4(uv, (1.0 - cos(test)) / 2.0, 1.0);
    }`;

    const vertshad = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertshad, vertsource);
    gl.compileShader(vertshad);
    if(!gl.getShaderParameter(vertshad, gl.COMPILE_STATUS))
    {
        const compileerror = gl.getShaderInfoLog(vertshad);
        ShowError(`Failed to compile vertex shader: \n${compileerror}`);
        return;
    }

    const fragshad = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragshad, fragsource);
    gl.compileShader(fragshad);
    if(!gl.getShaderParameter(fragshad, gl.COMPILE_STATUS))
    {
        const compileerror = gl.getShaderInfoLog(fragshad);
        ShowError(`Failed to compile vertex shader: \n${compileerror}`);
        return;
    }

    const glprogram = gl.createProgram();
    gl.attachShader(glprogram, vertshad);
    gl.attachShader(glprogram, fragshad);
    gl.linkProgram(glprogram);
    if(!gl.getProgramParameter(glprogram, gl.LINK_STATUS))
    {
        const linkerror = gl.getShaderInfoLog(glprogram);
        ShowError(`Failed to link program: \n${linkerror}`);
        return;
    }

    var test = 0;
    const glupdate = function(dt)
    {
        test += dt;
        var loc = gl.getUniformLocation(glprogram, "test");
        gl.uniform1f(loc, test);
    }

    var lasttime = performance.now();
    const frame = function()
    {
        var thistime = performance.now();
        var dt = (thistime - lasttime) / 1000;
        lasttime = thistime;
        // output merger
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // rasterizer
        gl.viewport(0, 0, canvas.width, canvas.height);

        // set GPU program
        gl.useProgram(glprogram);

        // Input assembler
        // N/A

        //draw call
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        glupdate(dt);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
GLmain();