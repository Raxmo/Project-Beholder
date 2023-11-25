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

    uniform vec2 campos;
    uniform float aspect;

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
        uv = (poss[gl_VertexID] + campos) * 8.0;
        uv.y = uv.y * aspect;
    }`;

    const fragsource = `#version 300 es
    precision mediump float;

    out vec4 fragcol;

    in vec2 uv;

    void main()
    {
        fragcol = vec4(fract(floor(uv) / 16.0), 0.0, 1.0);
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

    var campos = 
    {
        x: 0,
        y: 0
    }

    var camvel = 
    {
        x: 0,
        y: 0
    }

    var inputs = 
    {
        up:    false,
        down:  false,
        left:  false,
        right: false
    }

    var player = 
    {
        pos:
        {
            x: 0,
            y: 0
        },
        vel:
        {
            x: 0,
            y: 0
        },
        acc:
        {
            x: 0,
            y: 0
        },
        dir:
        {
            x: 0,
            y: 1
        }
    }

    document.addEventListener("keydown", (event) => 
    {
        switch(event.code)
        {
            case "KeyA":
                inputs.left  = true;
                break;
            case "KeyD":
                inputs.right = true;
                break;
            case "KeyW":
                inputs.up    = true;
                break;
            case "KeyS":
                inputs.down  = true;
                break;
            default:
                break;
        }
    });
    document.addEventListener("keyup", (event) => 
    {
        switch(event.code)
        {
            case "KeyA":
                inputs.left  = false;
                break;
            case "KeyD":
                inputs.right = false;
                break;
            case "KeyW":
                inputs.up    = false;
                break;
            case "KeyS":
                inputs.down  = false;
                break;
            default:
                break;
        }
    });

    var speed = 0.250;

    const update = function(dt)
    {
        player.vel.x = 0;
        player.vel.y = 0;

        player.vel.x += inputs.right ? speed : 0.0;
        player.vel.x -= inputs.left  ? speed : 0.0;
        player.vel.y += inputs.up    ? speed : 0.0;
        player.vel.y -= inputs.down  ? speed : 0.0;

        player.pos.x += player.vel.x * dt;
        player.pos.y += player.vel.y * dt;

        campos.x = player.pos.x;
        campos.y = player.pos.y;
    }

    const glupdate = function(dt)
    {
        update(dt);

        var loc = gl.getUniformLocation(glprogram, "campos");
        gl.uniform2f(loc, campos.x, campos.y);

        loc  = gl.getUniformLocation(glprogram, "aspect");
        gl.uniform1f(loc, (canvas.height / canvas.width));
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