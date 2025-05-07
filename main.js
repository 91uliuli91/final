import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const pantallaInicio = document.getElementById('pantallaInicio');
const botonIniciar = document.getElementById('botonIniciar');

const botonPantallaCompleta = document.getElementById('botonPantallaCompleta');

function togglePantallaCompleta() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error al intentar modo pantalla completa: ${err.message}`);
        });
        botonPantallaCompleta.textContent = '⊠';
    } else {
        document.exitFullscreen();
        botonPantallaCompleta.textContent = '🔲';
    }
}

botonPantallaCompleta.addEventListener('click', togglePantallaCompleta);

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        botonPantallaCompleta.textContent = '🔲';
    } else {
        botonPantallaCompleta.textContent = '⊠';
    }
});

let gameStarted = false;

let controlsBlocked = false;
let cloudGroups = [];
let lastCollisionTime = 0;
const collisionCooldown = 5000;

let vidas = 3;
const corazones = document.querySelectorAll('.corazon');

const contadorInmunidad = document.getElementById('contadorInmunidad');
let contadorInterval;

botonIniciar.addEventListener('click', (event) => {
    event.stopPropagation();
    pantallaInicio.classList.add('oculto');
    gameStarted = true;
});

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 20);
camera.lookAt(0, 0, 0);
camera.fov = 50;
camera.updateProjectionMatrix();
camera.rotation.x = -0.2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const floorGeometry = new THREE.BoxGeometry(20, 0.1, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.receiveShadow = true;
scene.add(floorMesh);

floorMesh.receiveShadow = true;

const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('./assets/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);

const grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
floorMesh.material = grassMaterial;

const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0x800080 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(0, 15, -40);
scene.add(sunMesh);

const sunLight = new THREE.PointLight(0x800080, 2, 100);
sunLight.position.set(0, 15, -30);
scene.add(sunLight);

sunLight.castShadow = true;

sunLight.intensity = 70000;

sunLight.distance = 70000;

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

directionalLight.color.set(0x800080);

directionalLight.castShadow = true;

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

ambientLight.color.set(0x800080);

function createPineTree(positionX, positionZ) {
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.position.set(positionX, 0.5, positionZ);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    scene.add(trunkMesh);

    const foliageGeometry1 = new THREE.ConeGeometry(0.5, 1, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const foliageMesh1 = new THREE.Mesh(foliageGeometry1, foliageMaterial);
    foliageMesh1.position.set(positionX, 1.5, positionZ);
    foliageMesh1.castShadow = true;
    foliageMesh1.receiveShadow = true;
    scene.add(foliageMesh1);

    const foliageGeometry2 = new THREE.ConeGeometry(0.4, 0.8, 16);
    const foliageMesh2 = new THREE.Mesh(foliageGeometry2, foliageMaterial);
    foliageMesh2.position.set(positionX, 2.3, positionZ);
    foliageMesh2.castShadow = true;
    foliageMesh2.receiveShadow = true;
    scene.add(foliageMesh2);

    const foliageGeometry3 = new THREE.ConeGeometry(0.3, 0.6, 16);
    const foliageMesh3 = new THREE.Mesh(foliageGeometry3, foliageMaterial);
    foliageMesh3.position.set(positionX, 2.9, positionZ);
    foliageMesh3.castShadow = true;
    foliageMesh3.receiveShadow = true;
    scene.add(foliageMesh3);
}

function createRandomPineTrees(count) {
    for (let i = 0; i < count; i++) {
        const positionX = (Math.random() - 0.5) * 18;
        const positionZ = (Math.random() - 0.5) * 18;
        createPineTree(positionX, positionZ);
    }
}

createRandomPineTrees(10);

function createStackedCylinderTree(positionX, positionZ) {
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.position.set(positionX, 0.5, positionZ);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    scene.add(trunkMesh);

    const foliageGeometry1 = new THREE.CylinderGeometry(0.6, 0.8, 1, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const foliageMesh1 = new THREE.Mesh(foliageGeometry1, foliageMaterial);
    foliageMesh1.position.set(positionX, 1.5, positionZ);
    foliageMesh1.castShadow = true;
    foliageMesh1.receiveShadow = true;
    scene.add(foliageMesh1);

    const foliageGeometry2 = new THREE.CylinderGeometry(0.4, 0.6, 0.8, 16);
    const foliageMesh2 = new THREE.Mesh(foliageGeometry2, foliageMaterial);
    foliageMesh2.position.set(positionX, 2.2, positionZ);
    foliageMesh2.castShadow = true;
    foliageMesh2.receiveShadow = true;
    scene.add(foliageMesh2);

    const foliageGeometry3 = new THREE.CylinderGeometry(0.2, 0.4, 0.6, 16);
    const foliageMesh3 = new THREE.Mesh(foliageGeometry3, foliageMaterial);
    foliageMesh3.position.set(positionX, 2.7, positionZ);
    foliageMesh3.castShadow = true;
    foliageMesh3.receiveShadow = true;
    scene.add(foliageMesh3);
}

createStackedCylinderTree(-6, -6);
createStackedCylinderTree(6, 6);

createStackedCylinderTree(-8, -8);
createStackedCylinderTree(8, 8);
createStackedCylinderTree(-4, 6);
createStackedCylinderTree(6, -4);

function createRock(positionX, positionZ) {
    const rockGeometry = new THREE.DodecahedronGeometry(0.2, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);
    rockMesh.position.set(positionX, 0.1, positionZ);
    rockMesh.castShadow = true;
    rockMesh.receiveShadow = true;
    scene.add(rockMesh);
}

function createRocksUnderTrees(treePositions) {
    treePositions.forEach((position, index) => {
        if (Math.random() > 0.5) {
            createRock(position.x + (Math.random() - 0.5), position.z + (Math.random() - 0.5));
        }
    });
}

const treePositions = [
    { x: -6, z: -6 },
    { x: 6, z: 6 },
    { x: -8, z: -8 },
    { x: 8, z: 8 },
    { x: -4, z: 6 },
    { x: 6, z: -4 }
];

createRocksUnderTrees(treePositions);

function createRandomRocks(count) {
    for (let i = 0; i < count; i++) {
        const size = Math.random() * 0.4 + 0.1;
        const rockGeometry = new THREE.DodecahedronGeometry(size, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);
        const positionX = (Math.random() - 0.5) * 18;
        const positionZ = (Math.random() - 0.5) * 18;
        rockMesh.position.set(positionX, size / 2, positionZ);
        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;
        scene.add(rockMesh);
    }
}

createRandomRocks(20);

function createCampfire(positionX, positionZ) {
    const logGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const logMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    for (let i = 0; i < 5; i++) {
        const logMesh = new THREE.Mesh(logGeometry, logMaterial);
        logMesh.position.set(positionX, 0.1, positionZ);
        logMesh.rotation.set(Math.random() * Math.PI, 0, Math.random() * Math.PI / 4);
        logMesh.castShadow = true;
        logMesh.receiveShadow = true;
        scene.add(logMesh);
    }

    const flameGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
    const flameMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff4500 });
    const flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);
    flameMesh.position.set(positionX, 0.5, positionZ);
    flameMesh.castShadow = true;
    scene.add(flameMesh);

    const fireLight = new THREE.PointLight(0xffa500, 1, 5);
    fireLight.position.set(positionX, 0.5, positionZ);
    scene.add(fireLight);

    fireLight.intensity = 100.5;
}

createCampfire(2, 2);

function createMultipleClouds(count) {
    for (let i = 0; i < count; i++) {
        const cloudGroup = new THREE.Group();

        const parts = Math.floor(Math.random() * 5) + 3;
        for (let j = 0; j < parts; j++) {
            const cloudPartGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.3 + 0.2, 0);
            const cloudPartMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const cloudPartMesh = new THREE.Mesh(cloudPartGeometry, cloudPartMaterial);
            cloudPartMesh.position.set(
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 1.5
            );
            cloudPartMesh.castShadow = true;
            cloudGroup.add(cloudPartMesh);
        }

        cloudGroup.position.set(
            (Math.random() - 0.5) * 20,
            Math.random() * 5 + 5,
            (Math.random() - 0.5) * 20
        );

        cloudGroup.cloudBounds = {
            radius: 1.0
        };

        cloudGroups.push(cloudGroup);
        scene.add(cloudGroup);

        let cloudDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();

        function animateCloud() {
            requestAnimationFrame(animateCloud);

            cloudGroup.position.add(cloudDirection.clone().multiplyScalar(0.02));

            if (Math.random() < 0.01) {
                cloudDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            }

            if (cloudGroup.position.x > 10 || cloudGroup.position.x < -10) {
                cloudDirection.x *= -1;
            }
            if (cloudGroup.position.z > 10 || cloudGroup.position.z < -10) {
                cloudDirection.z *= -1;
            }
        }

        animateCloud();
    }
}

createMultipleClouds(5);

function actualizarContadorInmunidad() {
    const tiempoActual = Date.now();
    const tiempoRestante = Math.ceil((lastCollisionTime + collisionCooldown - tiempoActual) / 1000);

    if (tiempoRestante <= 0) {
        contadorInmunidad.classList.remove('visible');
        clearInterval(contadorInterval);
        return;
    }

    contadorInmunidad.textContent = tiempoRestante;
}

function checkCloudCollisions() {
    if (!ufo) return;

    const currentTime = Date.now();
    const isImmune = currentTime - lastCollisionTime < collisionCooldown;

    const ufoPosition = new THREE.Vector3();
    ufo.getWorldPosition(ufoPosition);

    for (const cloudGroup of cloudGroups) {
        const cloudPosition = new THREE.Vector3();
        cloudGroup.getWorldPosition(cloudPosition);

        const distance = ufoPosition.distanceTo(cloudPosition);

        if (distance < cloudGroup.cloudBounds.radius + 1.5) {
            if (isImmune) {
                gsap.to(ufo.rotation, {
                    x: Math.random() * 0.2 - 0.1,
                    z: Math.random() * 0.2 - 0.1,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut",
                    onComplete: () => {
                        gsap.to(ufo.rotation, {
                            x: 0,
                            z: 0,
                            duration: 0.3
                        });
                    }
                });
                return;
            }

            console.log('¡Colisión con nube!');
            lastCollisionTime = currentTime;

            contadorInmunidad.classList.add('visible');
            contadorInmunidad.textContent = '5';

            if (contadorInterval) {
                clearInterval(contadorInterval);
            }

            contadorInterval = setInterval(actualizarContadorInmunidad, 100);

            if (vidas > 0) {
                vidas--;
                corazones[vidas].classList.add('perdido');

                gsap.to(ufo.rotation, {
                    x: Math.random() * 0.5 - 0.25,
                    z: Math.random() * 0.5 - 0.25,
                    duration: 0.5,
                    yoyo: true,
                    repeat: 3,
                    ease: "power1.inOut",
                    onComplete: () => {
                        gsap.to(ufo.rotation, {
                            x: 0,
                            z: 0,
                            duration: 0.5
                        });
                    }
                });

                if (vidas === 0) {
                    setTimeout(() => {
                        contadorInmunidad.classList.remove('visible');
                        clearInterval(contadorInterval);

                        vidas = 3;
                        puntos = 0;
                        puntosElement.textContent = 'Puntos: 0';
                        corazones.forEach(corazon => corazon.classList.remove('perdido'));

                        pantallaInicio.classList.remove('oculto');
                        gameStarted = false;

                        if (ufo) {
                            ufo.position.set(0, 6, 0);
                            ufo.rotation.set(0, 0, 0);
                        }
                        levitatingSphere.position.set(0, 0.2, 0);
                    }, 2000);
                }
            }
            break;
        }
    }
}

function createMovingCow() {
    const bodyGeometry = new THREE.DodecahedronGeometry(0.5, 0);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;

    bodyMesh.position.y += 1;

    bodyMesh.position.y -= 0.1;

    const headGeometry = new THREE.DodecahedronGeometry(0.3, 0);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.position.set(0, 0.5, 0.4);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    bodyMesh.add(headMesh);

    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    for (let i = 0; i < 4; i++) {
        const legMesh = new THREE.Mesh(legGeometry, legMaterial);
        const xOffset = i < 2 ? -0.2 : 0.2;
        const zOffset = i % 2 === 0 ? -0.2 : 0.2;
        legMesh.position.set(xOffset, -0.5, zOffset);
        legMesh.castShadow = true;
        legMesh.receiveShadow = true;
        bodyMesh.add(legMesh);
    }

    const cowTexture = textureLoader.load('./assets/skin.jpg');
    bodyMesh.material.map = cowTexture;

    let direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();

    const movementSpeed = 0.1;
    const animationDuration = 0.3;

    function animateCow() {
        requestAnimationFrame(animateCow);

        const newPosition = bodyMesh.position.clone().add(direction.clone().multiplyScalar(movementSpeed));

        gsap.to(bodyMesh.position, {
            x: newPosition.x,
            y: newPosition.y,
            z: newPosition.z,
            duration: animationDuration,
            ease: 'power1.out',
        });

        const angle = Math.atan2(direction.z, direction.x);
        gsap.to(bodyMesh.rotation, {
            y: -angle,
            duration: animationDuration,
            ease: 'power1.out',
        });

        if (Math.random() < 0.01) {
            direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        }

        if (bodyMesh.position.x > 9.5 || bodyMesh.position.x < -9.5) {
            direction.x *= -1;
        }
        if (bodyMesh.position.z > 9.5 || bodyMesh.position.z < -9.5) {
            direction.z *= -1;
        }
    }

    animateCow();
    scene.add(bodyMesh);
}

createMovingCow();

const abductionConeGeometry = new THREE.ConeGeometry(2, 7, 32);
const abductionConeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.5,
});
const abductionCone = new THREE.Mesh(abductionConeGeometry, abductionConeMaterial);
abductionCone.rotation.x = 0;
abductionCone.position.set(0, 0, 0);
scene.add(abductionCone);

const coneLightMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.5,
});
abductionCone.material = coneLightMaterial;

const coneLight = new THREE.PointLight(0x00ff00, 2, 15);
coneLight.position.set(0, -2.5, 0);
abductionCone.add(coneLight);

coneLight.intensity = 10;
coneLight.distance = 50;

abductionConeGeometry.parameters.height = 9;

abductionCone.position.set(0, 4, 0);

abductionCone.position.y -= 1;

abductionCone.position.set(0, 2.5, 0);

function updateAbductionCone(ufo) {
}

const gltfLoader = new GLTFLoader();
let ufo;
gltfLoader.load('./assets/ufo.glb', (gltf) => {
    ufo = gltf.scene;
    ufo.scale.set(2, 2, 2);
    ufo.position.set(0, 2.5, 0);
    ufo.position.y += 3.5;
    scene.add(ufo);

    updateAbductionCone(ufo);
}, undefined, (error) => {
    console.error('Error al cargar el modelo ufo.glb:', error);
});

function animateUFO() {
    requestAnimationFrame(animateUFO);
    if (ufo) {
        ufo.rotation.y += 0.01;
    }
}

animateUFO();

window.addEventListener('mousemove', (event) => {
    if (!gameStarted || controlsBlocked) return;

    const mouseX = (event.clientX / window.innerWidth) * 20 - 10;
    const mouseZ = 10 - (event.clientY / window.innerHeight) * 20;

    if (ufo) {
        ufo.position.x = mouseX;
        ufo.position.z = mouseZ;

        abductionCone.position.set(ufo.position.x, ufo.position.y - 2.5, ufo.position.z);
    }
});

const levitatingSphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const levitatingSphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const levitatingSphere = new THREE.Mesh(levitatingSphereGeometry, levitatingSphereMaterial);
levitatingSphere.position.set(0, 0.2, 0);
levitatingSphere.castShadow = true;
levitatingSphere.receiveShadow = true;
scene.add(levitatingSphere);

let puntos = 0;
const puntosElement = document.getElementById('puntos');

function isLevitatingSphereInCone(sphere, cone) {
    const distance = Math.sqrt(
        Math.pow(sphere.position.x - cone.position.x, 2) +
        Math.pow(sphere.position.z - cone.position.z, 2)
    );
    return distance < 2 && sphere.position.y < cone.position.y;
}

let sphereDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
const sphereSpeed = 0.02;

function animateLevitatingSphere() {
    requestAnimationFrame(animateLevitatingSphere);

    if (!gameStarted) return;

    const newPosition = levitatingSphere.position.clone().add(sphereDirection.clone().multiplyScalar(sphereSpeed));
    levitatingSphere.position.set(newPosition.x, levitatingSphere.position.y, newPosition.z);

    if (Math.random() < 0.01) {
        sphereDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    }

    if (levitatingSphere.position.x > 9.5 || levitatingSphere.position.x < -9.5) {
        sphereDirection.x *= -1;
    }
    if (levitatingSphere.position.z > 9.5 || levitatingSphere.position.z < -9.5) {
        sphereDirection.z *= -1;
    }

    if (isLevitatingSphereInCone(levitatingSphere, abductionCone)) {
        if (levitatingSphere.position.y < 3) {
            levitatingSphere.position.y += 0.01;
            console.log(`La esfera ha subido a una altura de: ${levitatingSphere.position.y} unidades`);
        } else {
            console.log('La esfera ha alcanzado la altura máxima y desaparecerá.');
            levitatingSphere.visible = false;

            puntos++;
            puntosElement.textContent = `Puntos: ${puntos}`;

            const randomX = (Math.random() - 0.5) * 18;
            const randomZ = (Math.random() - 0.5) * 18;
            levitatingSphere.position.set(randomX, 0.2, randomZ);
            levitatingSphere.visible = true;
            console.log('La esfera ha reaparecido instantáneamente en una nueva posición.');
        }
    } else {
        if (levitatingSphere.position.y > 0.2) {
            levitatingSphere.position.y -= 0.02;
        }
    }
}

animateLevitatingSphere();

let sunAngle = 0;

function animate() {
    requestAnimationFrame(animate);

    sunAngle += 0.0025;
    const radius = 20;
    sunMesh.position.x = radius * Math.cos(sunAngle);
    sunMesh.position.z = radius * Math.sin(sunAngle);
    sunLight.position.copy(sunMesh.position);

    if (gameStarted) {
        checkCloudCollisions();
    }

    renderer.render(scene, camera);
}
animate();

const audioListener = new THREE.AudioListener();
camera.add(audioListener);

const audio = new THREE.Audio(audioListener);
const audioLoader = new THREE.AudioLoader();
const mensajeMusica = document.getElementById('mensajeMusica');

audioLoader.load('./assets/bosques.mp3', (buffer) => {
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.setVolume(0.5);
});

document.addEventListener('click', (event) => {
    if (event.target.tagName.toLowerCase() === 'button') {
        return;
    }

    if (audio.context.state === 'suspended') {
        audio.context.resume().then(() => {
            audio.play();
            mensajeMusica.classList.add('oculto');
        });
    } else if (!audio.isPlaying) {
        audio.play();
        mensajeMusica.classList.add('oculto');
    }
});

window.addEventListener('load', () => {
    mensajeMusica.classList.remove('oculto');
});

if (!element.shadowRoot) {
    element.attachShadow({ mode: 'open' });
}

