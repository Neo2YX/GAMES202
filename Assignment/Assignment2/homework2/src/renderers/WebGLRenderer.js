class WebGLRenderer {
    meshes = [];
    shadowMeshes = [];
    lights = [];

    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;
    }

    addLight(light) {
        this.lights.push({
            entity: light,
            meshRender: new MeshRender(this.gl, light.mesh, light.mat)
        });
    }
    addMeshRender(mesh) { this.meshes.push(mesh); }
    addShadowMeshRender(mesh) { this.shadowMeshes.push(mesh); }

    render() {
        const gl = this.gl;

        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        console.assert(this.lights.length != 0, "No light");
        console.assert(this.lights.length == 1, "Multiple lights");

        const timer = Date.now() * 0.0001;

        for (let l = 0; l < this.lights.length; l++) {
            // Draw light
            this.lights[l].meshRender.mesh.transform.translate = this.lights[l].entity.lightPos;
            this.lights[l].meshRender.draw(this.camera);

            // Shadow pass
            if (this.lights[l].entity.hasShadowMap == true) {
                for (let i = 0; i < this.shadowMeshes.length; i++) {
                    this.shadowMeshes[i].draw(this.camera);
                }
            }

            // Camera pass
            for (let i = 0; i < this.meshes.length; i++) {
                this.gl.useProgram(this.meshes[i].shader.program.glShaderProgram);
                this.gl.uniform3fv(this.meshes[i].shader.program.uniforms.uLightPos, this.lights[l].entity.lightPos);

                for (let k in this.meshes[i].material.uniforms) {

                    let cameraModelMatrix = mat4.create();
                    mat4.fromRotation(cameraModelMatrix, timer, [0, 1, 0]);

                    if (k == 'uMoveWithCamera') { // The rotation of the skybox
                        gl.uniformMatrix4fv(
                            this.meshes[i].shader.program.uniforms[k],
                            false,
                            cameraModelMatrix);
                    }

                    let redPL = mat3.create();
                    let greenPL = mat3.create();
                    let bluePL = mat3.create();
                    for(let coeff = 0; coeff < 9; ++coeff)
                    {
                        redPL[coeff] = precomputeL[guiParams.envmapId][coeff][0];
                        greenPL[coeff] = precomputeL[guiParams.envmapId][coeff][1];
                        bluePL[coeff] = precomputeL[guiParams.envmapId][coeff][2];
                    }
                    
                    
                    let precomputeL_RGBMat3 = [];
                    // for(let i = 0; i < 3; ++i)
                    // {
                    //     precomputeL_RGBMat3[i] = [];
                    //     for(let j = 0; j < 9; ++j)
                    //     {
                    //         precomputeL_RGBMat3[i][j] = precomputeL[guiParams.envmapId][j][i];
                    //     }
                    // }
                    
                    // Bonus - Fast Spherical Harmonic Rotation
                    precomputeL_RGBMat3 = getRotationPrecomputeL(precomputeL[guiParams.envmapId], cameraModelMatrix);
                  
                    
                    if(k == 'uPrecomputeRedLight')
                    {
                        gl.uniformMatrix3fv(
                            this.meshes[i].shader.program.uniforms[k],
                            false,
                            precomputeL_RGBMat3[0]
                        );
                    }
                    if(k == 'uPrecomputeGreenLight')
                    {
                        gl.uniformMatrix3fv(
                            this.meshes[i].shader.program.uniforms[k],
                            false,
                            precomputeL_RGBMat3[1]
                        );
                    }
                    if(k == 'uPrecomputeBlueLight')
                    {
                        gl.uniformMatrix3fv(
                            this.meshes[i].shader.program.uniforms[k],
                            false,
                            precomputeL_RGBMat3[2]
                        );
                    }
                }

                this.meshes[i].draw(this.camera);
            }
        }

    }
}

function getRotationPrecomputeL(precomputeL, cameraModelMatrix)
{
    //process origin data
    let precomputeL_RGBMat3 = [];
    for(let i = 0; i < 3; ++i)
    {
        precomputeL_RGBMat3[i] = [];
        for(let j = 0; j < 9; ++j)
        {
            precomputeL_RGBMat3[i][j] = precomputeL[j][i];
        }
    }

    let rotateMatrix = [];
    for(let i = 0; i < 4; ++i)
    {
        let r = [];
        for(let j = 0; j < 4; ++j)
        {
            r.push(cameraModelMatrix[4*i+j]);
        }
        rotateMatrix.push(r);
    }
    rotateMatrix = math.transpose(rotateMatrix);


    //ѡȡnormal
    let normal_1 = [[1,0,0,0], [0, 0, 1,0], [0, 1, 0,0]];
    let k = 0.70710678118;
    let normal_2 = [[1,0,0,0], [0, 0, 1,0], [k, k, 0,0], [k, 0, k,0], [0, k, k,0]];

    //l=1
    let P_1 = [];
    let P_1R = [];
    let shCoeff = [];
    for(let i=0; i < 3; ++i){
        shCoeff = SHEval(normal_1[i][0], normal_1[i][1], normal_1[i][2], 3);
        P_1.push([shCoeff[1], shCoeff[2], shCoeff[3]]);
        let rotateNormal = math.multiply(rotateMatrix, normal_1[i]);
        shCoeff = SHEval(rotateNormal[0], rotateNormal[1], rotateNormal[2], 3);
        P_1R.push([shCoeff[1], shCoeff[2], shCoeff[3]]);
    }
    P_1 = math.transpose(P_1);
    P_1R = math.transpose(P_1R);
    let RotateSH1 = math.multiply(P_1R, math.inv(P_1));
    //rotate shcoeff
    for(let i = 0; i<3; i++)
    {
        let coeff = [precomputeL_RGBMat3[i][1], precomputeL_RGBMat3[i][2], precomputeL_RGBMat3[i][3]];
        coeff = math.multiply(RotateSH1, coeff);
        precomputeL_RGBMat3[i][1] = coeff[0];
        precomputeL_RGBMat3[i][2] = coeff[1];
        precomputeL_RGBMat3[i][3] = coeff[2];
    }

    //l=2
    let P_2 = [];
    let P_2R = [];
    for(let i=0; i < 5; ++i){
        shCoeff = SHEval(normal_2[i][0], normal_2[i][1], normal_2[i][2], 3);
        P_2.push([shCoeff[4], shCoeff[5], shCoeff[6], shCoeff[7], shCoeff[8]]);
        let rotateNormal = math.multiply(rotateMatrix, normal_2[i]);
        shCoeff = SHEval(rotateNormal[0], rotateNormal[1], rotateNormal[2], 3);
        P_2R.push([shCoeff[4], shCoeff[5], shCoeff[6], shCoeff[7], shCoeff[8]]);
    }
    P_2 = math.transpose(P_2);
    P_2R = math.transpose(P_2R);
    let RotateSH2 = math.multiply(P_2R, math.inv(P_2));
    //rotate shcoeff
    for(let i = 0; i<3; i++)
    {
        let coeff = [precomputeL_RGBMat3[i][4], precomputeL_RGBMat3[i][5], precomputeL_RGBMat3[i][6], precomputeL_RGBMat3[i][7], precomputeL_RGBMat3[i][8]];
        coeff = math.multiply(RotateSH2, coeff);
        precomputeL_RGBMat3[i][4] = coeff[0];
        precomputeL_RGBMat3[i][5] = coeff[1];
        precomputeL_RGBMat3[i][6] = coeff[2];
        precomputeL_RGBMat3[i][7] = coeff[3];
        precomputeL_RGBMat3[i][8] = coeff[4];
    }

    return precomputeL_RGBMat3;

}