// shaders/waveVertex.glsl
uniform float time;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(pos.x * 10.0 + time) * 0.2;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
