#version 300 es
precision mediump float;

uniform vec2 playerpos;

out vec4 fragcol;

in vec2 uv;

float noise(in vec2 xy, in float seed)
{
    return fract(tan(distance(xy * (1.0 + sqrt(5.0)) / 2.0, xy + vec2(0.0213)) * seed) * xy.x);
}

vec3 player()
{
    float p = length(uv - playerpos) < 1.0 / 16.0 ? 0.0 : 1.0; 

    return vec3(p);
}

vec3 tiles()
{
    vec3 col = vec3(0.0);
    //////////////////////////////////////////////////////
    vec2 tuv = fract(uv * 4.0); // tile's uv
    ivec2 tid = ivec2(floor(uv * 4.0));

    vec2 buv = tuv;
    buv.x /= 0.5;  // brick width
    buv.y /= 0.25; // brick height
    ivec2 bid = ivec2(floor(buv)); // brick ID
    buv.x += float(bid.y) / 2.0; // offset bricks to lay like bricks
    bid = ivec2(floor(buv)) + tid * ivec2(2, 4); // offet IDs
    buv = fract(buv); // contain uv's within bricks
    buv -= 0.5; // center uvs
    buv.y *= 0.5; // normalize uvs
    buv = abs(buv); // fix uvs to radiate
    buv.x -= 0.25; // more fixing
    buv *= 4.0; // even more fixing
    buv = (buv - 1.0) * 4.0 * sqrt(2.0) + sqrt(2.0); // build region of bricks

    float mask = step(0.5, max(buv.x, buv.y)); // create mask

    col = vec3(0.75, 0.3, 0.1); // blend colors based off of mask
    float rand1 = noise(vec2(bid), 72.36736327);
    float rand2 = noise(vec2(bid), 14.8652152698745);
    col += vec3(rand1, rand2, 0.0) * 0.15;
    col = mix(col, vec3(0.8), mask);
    //////////////////////////////////////////////////////
    //col = vec3(vec2(bid), 0.0) / 8.0;

    return col;
}

void main()
{
    vec3 col = tiles() * player();

    fragcol = vec4(col, 1.0);
}