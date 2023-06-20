const LightCubeVertexShader = `
attribute vec3 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;


void main(void) {

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);

}
`;

const LightCubeFragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float uLigIntensity;
uniform vec3 uLightColor;

void main(void) {
    
  //gl_FragColor = vec4(1,1,1, 1.0);
  gl_FragColor = vec4(uLightColor, 1.0);
}
`;
const VertexShader = `
attribute vec3 aVertexPosition;
attribute vec3 aNormalPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec2 vTextureCoord;

void main(void) {

  vFragPos = aVertexPosition;
  vNormal = aNormalPosition;

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);

  vTextureCoord = aTextureCoord;

}
`;

const FragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform int uTextureSample;
uniform vec3 uKd;
uniform sampler2D uSampler;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;

varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec2 vTextureCoord;

void main(void) {
  
  if (uTextureSample == 1) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  } else {
    gl_FragColor = vec4(uKd,1);
  }

}
`;

const PhongVertexShader = `
attribute vec3 aVertexPosition;
attribute vec3 aNormalPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec2 vTextureCoord;

void main(void) {

  vFragPos = aVertexPosition;
  vNormal = aNormalPosition;

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);

  vTextureCoord = aTextureCoord;

}
`;

const PhongFragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uSampler;
//blin
uniform vec3 uKd;
uniform vec3 uKs;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;
uniform int uTextureSample;
uniform float uLightIntensity;

varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec2 vTextureCoord;

void main(void) {
  vec3 Color;
  if (uTextureSample == 1) {
    Color = pow(texture2D(uSampler, vTextureCoord).rgb, vec3(2.2));
  } else {
    Color = uKd;
  }

  vec3 ambient = 0.05 * Color;
    vec3 obj2light = uLightPos - vFragPos;
    vec3 lightVec = normalize(obj2light);
    float dist = length(obj2light);
    float dist2 = dist * dist;
    float light_atten_coff = uLightIntensity / dist;

  vec3 diffuse = Color * light_atten_coff * max(dot(lightVec, vNormal),0.0);

    vec3 viewVec = normalize(uCameraPos - vFragPos);
    vec3 halfVec = normalize(viewVec + lightVec);
    vec3 spec = uKd * pow(max(dot(halfVec, vNormal),0.0), 35.0) * light_atten_coff;

    gl_FragColor = vec4(pow(ambient+diffuse+spec,vec3(1.0/2.2)), 1.0);

}
`;