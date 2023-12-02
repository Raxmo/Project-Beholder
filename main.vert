#version 300 es
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
    uv = poss[gl_VertexID];
    uv.y *= aspect;
    uv += campos;
}