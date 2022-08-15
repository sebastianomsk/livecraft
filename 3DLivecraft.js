// Datos del dispositivo
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

//SEED
noise.seed(Math.random())

let scene = new THREE.Scene();
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
            let blockBox = new THREE.BoxBufferGeometry(5, 5, 5); // w, h, d
            let blockMesh = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            let block = new THREE.Mesh(blockBox, blockMesh);
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
// Renderizado del terreno, bloques
// 
let blocks = [];
let xoff = 0;
let zoff = 0;
let inc = 0.05;
let amplitude = 100;
for (let x = 0; x < 20; x++) {
    xoff = 0;
    for (let z = 0; z < 20; z++) {
        // Masa densidad
        let v = Math.round(noise.perlin2(xoff, zoff) * amplitude / 5) * 5;
        // let v = Math.round(noise.perlin2(x, z) * amplitude / 5) * 5;
        blocks.push(new Block(x * 5, v, z * 5));
        xoff = xoff + inc;
    }
    zoff = zoff + inc;
}

for (let i = 0; i < blocks.length; i++) {
    // const block = blocks[i];
    blocks[i].display();
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
 * Update function and racket code 
 */
 let movingSpeed = 0.7;
 let ySpeed = 0;
 let acc = 0.08;
// 
// UPDATE 
//
function update() {
    if (keys.includes("w")) {
        controls.moveForward(movingSpeed);
    }
    if (keys.includes("a")) {
        controls.moveRight(-1 * movingSpeed);
    }
    if (keys.includes("s")) {
        controls.moveForward(-1 * movingSpeed);
    }
    if (keys.includes("d")) {
        controls.moveRight(movingSpeed);
    }

    camera.position.y = camera.position.y - ySpeed;
    ySpeed = ySpeed + acc;

    // Check if the camere is like collinding ok with the block
    // Check if person hit the block. Then up or down next block
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        // Check if the player is on top of a block
        const isUnderX = camera.position.x <= block.x + 5;
        const isAboveX = camera.position.x >= block.x;
        const isUnderZ = camera.position.z <= block.z + 5;
        const isAboveZ = camera.position.z >= block.z;
        if (isUnderX && isAboveX && isUnderZ && isAboveZ) {
        // if (camera.position.x <= block.x + 5 && camera.position.x >= block.x && camera.position.z <= block.z + 5 && camera.position.z >= block.z) {
            // Check if the player is on under of a block
            if (camera.position.y < block.y) {
                camera.position.y = block.y;
                ySpeed = 0;//Stop move
                canJump = true;
                break;
            }
        }
    }
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