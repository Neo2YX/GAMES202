attribute vec3 aVertexPosition;
attribute vec3 aNormalPosition;
attribute mat3 aPrecomputeLT;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uPrecomputeRedLight;
uniform mat3 uPrecomputeGreenLight;
uniform mat3 uPrecomputeBlueLight;


varying vec3 vPrecomputeCol;
varying vec3 vNormal;

float LongVecDot(mat3 a, mat3 b)
{
    return a[0][0]*b[0][0] + a[0][1]*b[0][1] + a[0][2]*b[0][2] + a[1][0]*b[1][0] + a[1][1]*b[1][1] + a[1][2]*b[1][2] + a[2][0]*b[2][0] + a[2][1]*b[2][1] + a[2][2]*b[2][2];
}

void main(void) {

  vNormal = (uModelMatrix * vec4(aNormalPosition, 1.0)).xyz;  
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix *
                vec4(aVertexPosition, 1.0);

  float redCol = LongVecDot(uPrecomputeRedLight, aPrecomputeLT);
  float greenCol = LongVecDot(uPrecomputeGreenLight, aPrecomputeLT);
  float blueCol = LongVecDot(uPrecomputeBlueLight, aPrecomputeLT);
  vPrecomputeCol = vec3(redCol, greenCol, blueCol);

}