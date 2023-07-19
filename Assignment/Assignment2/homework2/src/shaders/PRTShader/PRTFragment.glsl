#ifdef GL_ES
    precision mediump float;
#endif

varying vec3 vPrecomputeCol;
varying vec2 vNormal;

vec3 gammaCorrect(vec3 col)
{
    return vec3(pow(col[0], 1.0/2.2), pow(col[1], 1.0/2.2), pow(col[2], 1.0/2.2));
}

void main(void)
{
    //vec3 kd = texture2D(uSampler, vTextureCoord).rgb;
    //vec3 kd = vec3(1.0, 1.0, 1.0);
    
    gl_FragColor = vec4(gammaCorrect(vPrecomputeCol), 1.0);
}