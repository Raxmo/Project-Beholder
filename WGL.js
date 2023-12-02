function ShowError(errtxt)
{
    const errbox = document.getElementById("errbox");
    const errtxtel = document.createElement("p");
    errtxtel.innerText = errtxt;
    errbox.appendChild(errtxtel);
    console.log(errtxt);
}
//ShowError("This is a test error");



async function GLmain()
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

    const vertsource = await fetch('main.vert')
    .then(response => response.text());

    const fragsource = await fetch('main.frag')
    .then(response => response.text());

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
            y: 0,
            mag: function()
            {
                return Math.sqrt(this.x ** 2 + this.y ** 2);
            }
        },
        acc:
        {
            x: 0,
            y: 0,
            mag: function()
            {
                return Math.sqrt(this.x ** 2 + this.y ** 2);
            }
            ,normize: function()
            {
                this.x /= this.mag();
                this.y /= this.mag();
            }
        },
        dir:
        {
            x: 0,
            y: 1,
            mag: function()
            {
                return Math.sqrt(this.x ** 2 + this.y ** 2);
            },
            norm: function()
            {
                this.x /= this.mag();
                this.y /= this.mag();
                return this;
            }
        }
    }

    var cam =
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

        f: 2.5,
        z: 2.5,
        r: 1.5,

        acc: function()
        {
            k1 = this.z / (Math.PI * this.f);
            k2 = 1 / ((2 * Math.PI * this.f) ** 2);
            k3 = (this.r * this.z) / (2 * Math.PI * this.f);

            let out = 
            {
                x:(player.pos.x + k3 * player.vel.x - this.pos.x - k1 * this.vel.x) / k2,
                y:(player.pos.y + k3 * player.vel.y - this.pos.y - k1 * this.vel.y) / k2,
                
            };
            return out;
        }
    }

    /**
     * y`` = (x + k3 x` - y - k1 y``) / k2
     * 
     * k1 = z / (pi f)
     * k2 = 1 / ((2pi f) ^ 2)
     * k3 = (rz) / (2pi f)
     */

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

    var speed = 10.0;
    var damp = 5;

    const update = function(dt)
    {
        player.acc.x = 0;
        player.acc.y = 0;



        player.acc.x += inputs.right ? 1 : 0.0;
        player.acc.x -= inputs.left  ? 1 : 0.0;
        player.acc.y += inputs.up    ? 1 : 0.0;
        player.acc.y -= inputs.down  ? 1 : 0.0;
        if(player.acc.mag() > 0) player.acc.normize();
        player.acc.x *= speed;
        player.acc.y *= speed;

        player.acc.x -= player.vel.x * damp;
        player.acc.y -= player.vel.y * damp;

        player.vel.x += player.acc.x * dt / 2;
        player.vel.y += player.acc.y * dt / 2;

        player.pos.x += player.vel.x * dt;
        player.pos.y += player.vel.y * dt;

        player.acc.x -= player.vel.x * damp;
        player.acc.y -= player.vel.y * damp;

        player.vel.x += player.acc.x * dt / 2;
        player.vel.y += player.acc.y * dt / 2;

        
        
        cam.vel.x += dt * cam.acc().x / 2;
        cam.vel.y += dt * cam.acc().y / 2;

        cam.pos.x += dt * cam.vel.x;
        cam.pos.y += dt * cam.vel.y;

        cam.vel.x += dt * cam.acc().x / 2;
        cam.vel.y += dt * cam.acc().y / 2;
    }

    const glupdate = function(dt)
    {
        update(dt);

        var loc = gl.getUniformLocation(glprogram, "campos");
        gl.uniform2f(loc, cam.pos.x, cam.pos.y);

        loc  = gl.getUniformLocation(glprogram, "aspect");
        gl.uniform1f(loc, (canvas.height / canvas.width));

        loc = gl.getUniformLocation(glprogram, "playerpos");
        gl.uniform2f(loc, player.pos.x, player.pos.y);
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