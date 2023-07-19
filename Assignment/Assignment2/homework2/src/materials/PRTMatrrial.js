class PRTMaterial extends Material {

    constructor(vertexShader, fragmentShader) {

        super({
            // Phong
            'uPrecomputeRedLight' : { type: 'PrecomputeL', value: null},
            'uPrecomputeGreenLight' : { type: 'PrecomputeL', value: null},
            'uPrecomputeBlueLight' : { type: 'PrecomputeL', value: null},
        }, [
            'aPrecomputeLT'
        ], vertexShader, fragmentShader, null);
    }
}

async function buildPRTMaterial(vertexPath, fragmentPath) {


    let vertexShader = await getShaderString(vertexPath);
    let fragmentShader = await getShaderString(fragmentPath);

    return new PRTMaterial(vertexShader, fragmentShader);

}