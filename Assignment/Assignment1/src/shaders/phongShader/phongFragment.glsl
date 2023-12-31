#ifdef GL_ES
precision mediump float;
#endif

// Phong related variables
uniform sampler2D uSampler;
uniform vec3 uKd;
uniform vec3 uKs;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;
uniform vec3 uLightIntensity;

varying highp vec2 vTextureCoord;
varying highp vec3 vFragPos;
varying highp vec3 vNormal;

// Shadow map related variables
#define NUM_SAMPLES 50
#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
#define PCF_NUM_SAMPLES NUM_SAMPLES
#define NUM_RINGS 10

// PCSS lightArea
#define PCSS_LIGHT_COVER 0.05   //depth map filter size = PCSS_LIGHT_COVER * shadowmap size / Z_reciver

#define EPS 1e-3
#define PI 3.141592653589793
#define PI2 6.283185307179586

uniform sampler2D uShadowMap;

varying vec4 vPositionFromLight;

highp float rand_1to1(highp float x ) { 
  // -1 -1
  return fract(sin(x)*10000.0);
}

highp float rand_2to1(vec2 uv ) { 
  // 0 - 1
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract(sin(sn) * c);
}

float unpack(vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
    float ret = dot(rgbaDepth, bitShift);
    return ret < EPS ? 1.0 : ret;
}

vec2 poissonDisk[NUM_SAMPLES];

void poissonDiskSamples( const in vec2 randomSeed ) {

  float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
  float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

  float angle = rand_2to1( randomSeed ) * PI2;
  float radius = INV_NUM_SAMPLES;
  float radiusStep = radius;

  for( int i = 0; i < NUM_SAMPLES; i ++ ) {
    poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
    radius += radiusStep;
    angle += ANGLE_STEP;
  }
}

void uniformDiskSamples( const in vec2 randomSeed ) {

  float randNum = rand_2to1(randomSeed);
  float sampleX = rand_1to1( randNum ) ;
  float sampleY = rand_1to1( sampleX ) ;

  float angle = sampleX * PI2;
  float radius = sqrt(sampleY);

  for( int i = 0; i < NUM_SAMPLES; i ++ ) {
    poissonDisk[i] = vec2( radius * cos(angle) , radius * sin(angle)  );

    sampleX = rand_1to1( sampleY ) ;
    sampleY = rand_1to1( sampleX ) ;

    angle = sampleX * PI2;
    radius = sqrt(sampleY);
  }
}


float findBlocker( sampler2D shadowMap,  vec2 uv, float zReceiver ) {
  float depth = unpack(texture2D(shadowMap, uv));
  float filterSize = PCSS_LIGHT_COVER * float(2048) * (1.0-clamp(depth/zReceiver, 0.0, 0.75));
	return filterSize / float(2048);
}

float PCF(sampler2D shadowMap, vec4 coords) {
  vec2 uv = coords.xy;
  float unocc = 0.0;
  float INV_NUM_SAMPLES = 1.0 / float(NUM_SAMPLES);
  //poissonDiskSamples(uv);
  uniformDiskSamples(uv);
  float textureSize = 2048.0;
  float filterStride = 5.0;
  float filterSize = filterStride / textureSize;
  for(int i = 0; i < NUM_SAMPLES; i++)
  {
    float depth = unpack(texture2D(shadowMap, uv+poissonDisk[i]*filterSize))+EPS;
    unocc += step(coords.z, depth)*INV_NUM_SAMPLES;
  }
  return unocc;
}

float PCSS(sampler2D shadowMap, vec4 coords){

  float INV_NUM_SAMPLES = 1.0 / float(NUM_SAMPLES);
  // STEP 1: avgblocker depth
  //float blockerFilterSize = findBlocker(shadowMap, coords.xy, coords.z);
  float blockerFilterSize = 1.0/2048.0 * 100.0;
  //poissonDiskSamples(coords.xy);
  uniformDiskSamples(coords.xy);
  float depthAVG = 0.0;
  float cnt = 0.0;
  for(int i = 0; i < NUM_SAMPLES; i++)
  {
    float shadowDepth = unpack(texture2D(shadowMap, coords.xy+poissonDisk[i]*blockerFilterSize))+EPS;
    float occ = step(shadowDepth, coords.z);
    depthAVG += shadowDepth*occ;
    cnt += occ;
  }
  if(cnt < EPS) return 1.0;
  if(cnt > float(NUM_SAMPLES)-EPS) return 0.0;
  depthAVG /= cnt;

  // STEP 2: penumbra size
  float filterSize = PCSS_LIGHT_COVER * ((coords.z - depthAVG) / depthAVG);

  // STEP 3: filtering
  float unocc = 0.0;
  for(int i=0; i< NUM_SAMPLES; ++i){
    float depth = unpack(texture2D(shadowMap, coords.xy+poissonDisk[i]*filterSize)) + EPS;
    unocc += step(coords.z, depth) * INV_NUM_SAMPLES;
  }
  
  return unocc;

}


float useShadowMap(sampler2D shadowMap, vec4 shadowCoord){
  float val = unpack(texture2D(shadowMap, vec2(shadowCoord.x,shadowCoord.y)))+EPS;
  return step(shadowCoord.z, val)*0.6+0.2;
}

vec3 blinnPhong() {
  vec3 color = texture2D(uSampler, vTextureCoord).rgb;
  color = pow(color, vec3(2.2));

  vec3 ambient = 0.05 * color;

  vec3 lightDir = normalize(uLightPos);
  vec3 normal = normalize(vNormal);
  float diff = max(dot(lightDir, normal), 0.0);
  vec3 light_atten_coff =
      uLightIntensity / pow(length(uLightPos - vFragPos), 2.0);
  vec3 diffuse = diff * light_atten_coff * color;

  vec3 viewDir = normalize(uCameraPos - vFragPos);
  vec3 halfDir = normalize((lightDir + viewDir));
  float spec = pow(max(dot(halfDir, normal), 0.0), 32.0);
  vec3 specular = uKs * light_atten_coff * spec;

  vec3 radiance = (ambient + diffuse + specular);
  vec3 phongColor = pow(radiance, vec3(1.0 / 2.2));
  return phongColor;
}

void main(void) {

  float visibility;
  vec3 shadowCoord = vPositionFromLight.xyz / vPositionFromLight.w;
  shadowCoord = (shadowCoord.xyz+1.0)/2.0;
  //����bias  ----  �̶���depth bias
  vec3 lightDir = normalize(uLightPos);
  vec3 normal = normalize(vNormal);
  float bias = max((1.0-dot(normal, lightDir))*0.01 , 0.01);
  shadowCoord.z -= bias;

  //visibility = useShadowMap(uShadowMap, vec4(shadowCoord, 1.0));
  //visibility = PCF(uShadowMap, vec4(shadowCoord, 1.0));
  visibility = PCSS(uShadowMap, vec4(shadowCoord, 1.0));

  vec3 phongColor = blinnPhong();
  gl_FragColor = vec4(phongColor * visibility, 1.0);
  //gl_FragColor = vec4(phongColor, 1.0);
}