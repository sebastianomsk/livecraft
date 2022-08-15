// Datos del dispositivo
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const PIXEL_BLOCK = 5;
//SEED
noise.seed(Math.random())

let scene = new THREE.Scene();
scene.background = new THREE.Color(0x00ffff);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(windowWidth, windowHeight);

// se agrega al body del html
document.body.appendChild(renderer.domElement);
let camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);

// 
// BLOCK
// 
class Block {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.display = function () {
            let blockBox = new THREE.BoxBufferGeometry(5, 5, 5); // w, h, d Pixel blocks
            let blockMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            let block = new THREE.Mesh(blockBox, materiaArray);
            // let block = new THREE.Mesh(blockBox, blockMaterial);
            scene.add(block);
            block.position.x = this.x;
            block.position.y = this.y - 10;
            block.position.z = this.z;

            let edges = new THREE.EdgesGeometry(blockBox);
            let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 /** aristas color */ }));

            scene.add(line);
            line.position.x = this.x;
            line.position.y = this.y - 10;
            line.position.z = this.z;
        };

    }
}

//
// Loader of texture
//
let loader = new THREE.TextureLoader();
let materiaArray = [
    // grassSide could be the same
    new THREE.MeshBasicMaterial({map : loader.load('./images/texture/grassSide1.png')}),
    new THREE.MeshBasicMaterial({map : loader.load('./images/texture/grassSide2.png')}),
    new THREE.MeshBasicMaterial({map : loader.load('./images/texture/grassTop.png')}),
    new THREE.MeshBasicMaterial({map : loader.load('./images/texture/grassBottom.png')}),
    new THREE.MeshBasicMaterial({map : loader.load('./images/texture/grassSide3.png')}),
    new THREE.MeshBasicMaterial({map : loader.load('./images/texture/grassSide4.png')}),
]

// 
// Renderizado del terreno, bloques
// 
// let blocks = [];
// let xoff = 0;
// let zoff = 0;
// let inc = 0.05;
// let amplitude = 100;
// for (let x = 0; x < 20; x++) {
//     xoff = 0;
//     for (let z = 0; z < 20; z++) {
//         // Masa densidad
//         let v = Math.round(noise.perlin2(xoff, zoff) * amplitude / 5) * 5;
//         // let v = Math.round(noise.perlin2(x, z) * amplitude / 5) * 5;
//         blocks.push(new Block(x * 5, v, z * 5));
//         xoff = xoff + inc;
//     }
//     zoff = zoff + inc;
// }

// 
// render chunks
// 
let chunks = [];
let xoff = 0;
let zoff = 0;
let inc = 0.05;
let amplitude = 30 + (Math.random() * 70);
let renderDistance = 3;
let chunkSize = 10;
// start in the middle of map
camera.position.x = renderDistance * chunkSize / 2 * 5;
camera.position.z = renderDistance * chunkSize / 2 * 5;
camera.position.y = 50;

for (let i = 0; i < renderDistance; i++) {
    let chunk = [];
    for (let j = 0; j < renderDistance; j++) {
        for (let x = i * chunkSize; x < (i * chunkSize) + chunkSize; x++) {
            for (let z = j * chunkSize; z < (j * chunkSize) + chunkSize; z++) {
                xoff = inc * x;
                zoff = inc * z;
                let v = Math.round(noise.perlin2(xoff, zoff) * amplitude / 5) * 5;
                chunk.push(new Block(x * 5, v, z * 5));
            }
        }
        
    }
    chunks.push(chunk);
}

for (let i = 0; i < chunks.length; i++) {
    // const block = blocks[i];
    // blocks[i].display();
    for (let j = 0; j < chunks[i].length; j++) {
        chunks[i][j].display();
    }
}

/**
 * Checking which key is pressed
 */
let keys = [];
let canJump = true;
// KEY DOWN
document.addEventListener("keydown", function(e) {
    keys.push(e.key);
    if (e.key === " " && canJump) {
        // simula la gravedad
        ySpeed = -1.3;
        canJump = false;
        console.log('Quiere saltar')
    }
});

// KEY UP
document.addEventListener("keyup", function(e) {
    let newArray = [];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key !== e.key) {
            newArray.push(key);
        }
    }
    keys = newArray;
})

/**
 * Control del espacio
 */ 
let controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener("click", function() {
    controls.lock();    
});

controls.addEventListener("lock", function() {

});
controls.addEventListener("unlock", function() {

});

/**
 * Auto Jump
 */
let autoJump = true;
function toggleAutoJump() {
    if (autoJump) {
        autoJump = false;
        document.getElementById('autojumpbtn').innerHTML = '<h2>AutoJump : Off</h2>'
    } else {
        autoJump = true;
        document.getElementById('autojumpbtn').innerHTML = '<h2>AutoJump : On</h2>'
    }
}

/**
 * Update function and racket code 
 */
 let movingSpeed = 0.7;
 let ySpeed = 0;
 let acc = 0.08;
 const halfPixelBlock = 2.5;

// 
// UPDATE 
//
function update() {
    if (keys.includes("w")) {
        controls.moveForward(movingSpeed);
        if (!autoJump) {
            for (let i = 0; i < chunks.length; i++) {
                for (let j = 0; j < chunks[i].length; j++) {
                    const block = chunks[i][j];
                    // Check if the player is on top of a block
                    if (wantToMove(block)) {
                        // Check if the player is on under of a block
                        if (camera.position.y == block.y - halfPixelBlock) {
                            controls.moveForward(-1 * movingSpeed);
                        }
                    }
                }
            }
        }
    }
    if (keys.includes("a")) {
        controls.moveRight(-1 * movingSpeed);
        if (!autoJump) {
            for (let i = 0; i < chunks.length; i++) {
                for (let j = 0; j < chunks[i].length; j++) {
                const block = chunks[i][j];
                // Check if the player is on top of a block
                if (wantToMove(block)) {
                    // Check if the player is on under of a block
                    if (camera.position.y == block.y - halfPixelBlock) {
                        controls.moveRight(movingSpeed);
                    }
                }
            }
            }
        }
    }
    if (keys.includes("s")) {
        controls.moveForward(-1 * movingSpeed);
        if (!autoJump) {
            for (let i = 0; i < chunks.length; i++) {
                for (let j = 0; j < chunks[i].length; j++) {
                    const block = chunks[i][j];
                    // Check if the player is on top of a block
                    if (wantToMove(block)) {
                        // Check if the player is on under of a block
                        if (camera.position.y == block.y - halfPixelBlock) {
                            controls.moveForward(movingSpeed);
                        }
                    }
                }
            }
        }
    }
    if (keys.includes("d")) {
        controls.moveRight(movingSpeed);
        if (!autoJump) {
            for (let i = 0; i < chunks.length; i++) {
                for (let j = 0; j < chunks[i].length; j++) {
                    const block = chunks[i][j];
                    // Check if the player is on top of a block
                    if (wantToMove(block)) {
                        // Check if the player is on under of a block
                        if (camera.position.y == block.y - halfPixelBlock) {
                            controls.moveRight(-1 * movingSpeed);
                        }
                    }
                }
            }
        }
    }

    camera.position.y = camera.position.y - ySpeed;
    ySpeed = ySpeed + acc;

    // Check if the camere is like collinding ok with the block
    // Check if person hit the block. Then up or down next block
    for (const blocks of chunks) {
        for (const block of blocks) {
            if (wantToMove(block)) {
                // Check if the player is on under of a block
                if (camera.position.y <= block.y + halfPixelBlock && camera.position.y >= block.y - halfPixelBlock) {
                    camera.position.y = block.y + halfPixelBlock;
                    ySpeed = 0;//Stop move
                    canJump = true;
                    break;
                }
            }
        }
    }
    // for (let i = 0; i < chunks.length; i++) {
    //     for (let j = 0; j < chunks[i].length; j++) {
    //         const block = chunks[i][j];
    //         // Check if the player is on top of a block
    //         if (wantToMove(block)) {
    //             // Check if the player is on under of a block
    //             if (camera.position.y <= block.y + halfPixelBlock && camera.position.y >= block.y - halfPixelBlock) {
    //                 camera.position.y = block.y + halfPixelBlock;
    //                 ySpeed = 0;//Stop move
    //                 canJump = true;
    //                 break;
    //             }
    //         }
    //     }
    // }
}

// player want to move himself
function wantToMove (block) {
    const isUnderX = camera.position.x <= block.x + halfPixelBlock;
    const isAboveX = camera.position.x >= block.x - halfPixelBlock;
    const isUnderZ = camera.position.z <= block.z + halfPixelBlock;
    const isAboveZ = camera.position.z >= block.z - halfPixelBlock;
    return isUnderX && isAboveX && isUnderZ && isAboveZ;
}

// Resize window
window.addEventListener("resize", function() {
    renderer.setSize(windowWidth, windowHeight);
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
});

function render() {
    renderer.render(scene, camera);
}

function GameLoop() {
    requestAnimationFrame(GameLoop);
    update();
    render();
}

GameLoop();