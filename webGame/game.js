// Game variables
let scene, camera, renderer;
let controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();
const speed = 5.0; // Increased movement speed for flying
let horizon; // Horizon plane for fake horizon effect
let isDayMode = true; // Default to day mode
let ambientLight, sunLight, fillLight; // Store lights for day/night toggle

// Object_9 boundary limits - adjusted to allow more movement in x-z plane
const object9Bounds = {
    minX: -15, // Minimum X coordinate (expanded)
    maxX: 15,  // Maximum X coordinate (expanded)
    minY: -5,  // Minimum Y coordinate (floor) - lowered to see ground below 0
    maxY: 10,  // Maximum Y coordinate (ceiling)
    minZ: -15, // Minimum Z coordinate (expanded)
    maxZ: 15   // Maximum Z coordinate (expanded)
};
// Performance optimization variables
let frustum = new THREE.Frustum();
let cameraViewProjectionMatrix = new THREE.Matrix4();
let clock = new THREE.Clock();
let frameLimit = 60; // Target FPS
let frameTime = 1000/frameLimit;
let delta = 0;
let lodManager;
let textureManager;
let objectPool;

// Stats variables
let frameCount = 0;
let lastFpsUpdate = 0;
let currentFps = 0;
let performanceMonitor;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Set sky color for daytime
    scene.background = new THREE.Color(0x87CEEB); // Light blue sky color
    
    scene.fog = new THREE.FogExp2(0xCCDDFF, 0.02); // Lighter fog for daytime
    
    // Create fake horizon effect
    createHorizon();
    
    // Initialize managers
    lodManager = new LODManager(scene);
    textureManager = new TextureManager();
    objectPool = new ObjectPool();
    
    // Create camera with optimized settings
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100); // Reduced far plane
    camera.position.set(-6, 1, 8); // Default spawn position
    
    // Set camera for LOD manager
    lodManager.setCamera(camera);
    
    // Create renderer with optimized settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: false, // Disable antialiasing for performance
        powerPreference: 'high-performance',
        precision: 'mediump' // Use medium precision for better performance
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better performance shadow map
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Set renderer for texture manager
    textureManager.setRenderer(renderer);
    
    // Add lighting (optimized for daytime)
    ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6); // Brighter ambient light for daytime
    scene.add(ambientLight);
    
    // Main sunlight from the sky (optimized shadow settings)
    sunLight = new THREE.DirectionalLight(0xFFFFCC, 1.0); // Bright sunlight
    sunLight.position.set(10, 20, 10); // Coming from above at an angle
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.mapSize.width = 512;
    sunLight.shadow.mapSize.height = 512;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);
    
    // Secondary fill light for softer shadows
    fillLight = new THREE.DirectionalLight(0xFFFFFF, 0.4); // White fill light
    fillLight.position.set(-10, 8, -10); // Coming from opposite side
    fillLight.castShadow = false;
    scene.add(fillLight);
    
    // Setup day/night toggle listener
    document.addEventListener('dayNightToggle', handleDayNightToggle);
    
    // Load the house model with optimizations
    const loader = new THREE.GLTFLoader();
    loader.load('new.glb', (gltf) => {
        const house = gltf.scene;
        house.traverse((child) => {
            if (child.isMesh) {
                // Optimize meshes
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Optimize geometry
                if (child.geometry) {
                    child.geometry.computeBoundingSphere();
                    child.geometry.computeBoundingBox();
                    
                    // Optimize materials and textures
                    if (child.material) {
                        // Handle material arrays
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => optimizeMaterial(mat));
                        } else {
                            optimizeMaterial(child.material);
                        }
                    }
                }
                
                // Function to optimize materials
                function optimizeMaterial(material) {
                    // Optimize textures
                    if (material.map) {
                        material.map.anisotropy = 1; // Lower anisotropy
                        material.map.minFilter = THREE.LinearFilter;
                        material.map.magFilter = THREE.LinearFilter;
                        material.map.needsUpdate = true;
                    }
                    
                    // Disable unnecessary material features
                    material.fog = true;
                    material.flatShading = true; // Use flat shading for better performance
                    material.needsUpdate = true;
                }
                
                // Enable frustum culling
                child.frustumCulled = true;
                child.userData.cullable = true;
                
                // Reduce console logging
                if (child.name && child.name.length > 0) {
                    console.log('Loaded object:', child.name);
                }
            }
        });
        scene.add(house);
        
        // Add interior lights after house is loaded
        addInteriorLights();
    }, undefined, (error) => {
        console.error('An error occurred loading the model:', error);
    });
    
    // Function to add interior lights
    function addInteriorLights() {
        // Add fewer, optimized point lights inside the house
        // Intensity will be adjusted based on day/night mode
        const lightIntensity = isDayMode ? 0.5 : 1.0;
        
        const interiorLights = [
            { position: [0, 2, 0], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [5, 2, 0], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [-5, 2, 0], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 }
        ];
        
        interiorLights.forEach(light => {
            const pointLight = new THREE.PointLight(light.color, light.intensity, light.distance);
            pointLight.position.set(...light.position);
            pointLight.castShadow = false; // Disable shadows on point lights
            scene.add(pointLight);
        });
    }
    
    // Setup controls
    setupControls();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation loop
    animate();
}

// Setup pointer lock controls
function setupControls() {
    controls = new THREE.PointerLockControls(camera, document.body);
    
    // Add click event to lock controls
    document.getElementById('game-container').addEventListener('click', () => {
        controls.lock();
    });
    
    // Add event listeners for pointer lock changes
    controls.addEventListener('lock', () => {
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('crosshair').style.opacity = '1';
        // Keep exit message visible
        document.getElementById('exit-message').style.display = 'block';
    });
    
    controls.addEventListener('unlock', () => {
        document.getElementById('instructions').style.display = 'block';
        document.getElementById('crosshair').style.opacity = '0';
        // Keep exit message visible
        document.getElementById('exit-message').style.display = 'block';
    });
    
    scene.add(controls.getObject());
    
    // Setup keyboard controls
    const onKeyDown = (event) => {
        switch (event.code) {
            case 'KeyW':
                moveForward = true;
                break;
            case 'KeyA':
                moveLeft = true;
                break;
            case 'KeyS':
                moveBackward = true;
                break;
            case 'KeyD':
                moveRight = true;
                break;
            case 'Space':
                moveUp = true;
                break;
            case 'ShiftLeft':
                moveDown = true;
                break;
        }
    };
    
    const onKeyUp = (event) => {
        switch (event.code) {
            case 'KeyW':
                moveForward = false;
                break;
            case 'KeyA':
                moveLeft = false;
                break;
            case 'KeyS':
                moveBackward = false;
                break;
            case 'KeyD':
                moveRight = false;
                break;
            case 'Space':
                moveUp = false;
                break;
            case 'ShiftLeft':
                moveDown = false;
                break;
        }
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// No ground collision check needed for fly mode

// Update frustum for culling
function updateFrustum() {
    camera.updateMatrixWorld(); // Update camera matrices
    
    // Use object pooling for matrix operations
    const matrix = objectPool.get('matrix', () => new THREE.Matrix4());
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(matrix);
    objectPool.release('matrix', matrix);
}

// Function to check if position is within Object_9 boundaries
function isWithinObject9Bounds(position) {
    return (
        position.x >= object9Bounds.minX && position.x <= object9Bounds.maxX &&
        position.y >= object9Bounds.minY && position.y <= object9Bounds.maxY &&
        position.z >= object9Bounds.minZ && position.z <= object9Bounds.maxZ
    );
}

// Wall collision check for Object_9 boundaries

// Animation loop with frame limiting
function animate() {
    requestAnimationFrame(animate);
    
    // Frame limiting for consistent performance
    delta = clock.getDelta();
    
    const time = performance.now();
    
    // Update FPS counter once per second
    frameCount++;
    if (time > lastFpsUpdate + 1000) {
        currentFps = Math.round(frameCount * 1000 / (time - lastFpsUpdate));
        performanceMonitor.updateFPS(currentFps);
        performanceMonitor.update(renderer);
        lastFpsUpdate = time;
        frameCount = 0;
    }
    
    if (controls.isLocked) {
        const delta = (time - prevTime) / 1000;
        
        // Calculate velocity
        velocity.x = 0;
        velocity.y = 0;
        velocity.z = 0;
        
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
        
        // Add vertical movement
        if (moveUp) velocity.y += speed * delta;
        if (moveDown) velocity.y -= speed * delta;
        
        // Move using original control methods
        controls.moveRight(-velocity.x);
        controls.moveForward(-velocity.z);
        controls.getObject().position.y += velocity.y;
        
        // After movement, clamp position to boundaries
        const pos = controls.getObject().position;
        pos.x = Math.max(object9Bounds.minX, Math.min(pos.x, object9Bounds.maxX));
        pos.y = Math.max(object9Bounds.minY, Math.min(pos.y, object9Bounds.maxY));
        pos.z = Math.max(object9Bounds.minZ, Math.min(pos.z, object9Bounds.maxZ));
        
        // Update coordinates display if enabled
        if (performanceMonitor.showPosition) {
            const position = controls.getObject().position;
            document.getElementById('coordinates').textContent = 
                `Position: X: ${position.x.toFixed(2)}, Y: ${position.y.toFixed(2)}, Z: ${position.z.toFixed(2)}`;
        }
        
        prevTime = time;
    }
    
    // Apply frustum culling
    updateFrustum();
    
    // Only render visible objects with optimized culling
    scene.traverse(object => {
        if (object.userData && object.userData.cullable && object.geometry && object.geometry.boundingSphere) {
            // Use object pooling for sphere operations
            const boundingSphere = objectPool.get('sphere', () => new THREE.Sphere());
            boundingSphere.copy(object.geometry.boundingSphere);
            boundingSphere.applyMatrix4(object.matrixWorld);
            
            // Set visibility based on frustum intersection
            object.visible = frustum.intersectsSphere(boundingSphere);
            
            // Return sphere to pool
            objectPool.release('sphere', boundingSphere);
        }
    });
    
    // Update LOD levels
    lodManager.update();
    
    // Update horizon position to follow player
    updateHorizon();
    
    renderer.render(scene, camera);
}

// Create fake horizon effect - replaced with bg.png
function createHorizon() {
    // Horizon functionality removed as we're using bg.png as background
    horizon = null; // Set to null since we're not using it anymore
}

// Update horizon position to follow player - no longer needed with bg.png
function updateHorizon() {
    // Function kept for compatibility but no longer does anything
    return;
}

// Handle day/night toggle
function handleDayNightToggle(event) {
    isDayMode = event.detail.isDayMode;
    
    if (isDayMode) {
        // Day mode settings
        scene.background = new THREE.Color(0x87CEEB); // Light blue sky
        scene.fog = new THREE.FogExp2(0xCCDDFF, 0.02); // Lighter fog
        
        // Adjust lighting for day
        ambientLight.intensity = 0.6;
        sunLight.intensity = 1.0;
        sunLight.color.set(0xFFFFCC); // Bright sunlight
        fillLight.intensity = 0.4;
        
        // Update interior lights if they exist
        scene.traverse((object) => {
            if (object.isPointLight) {
                object.intensity = 0.5; // Dimmer interior lights during day
            }
        });
    } else {
        // Night mode settings
        scene.background = new THREE.Color(0x0A1020); // Dark blue night sky
        scene.fog = new THREE.FogExp2(0x0A1020, 0.03); // Darker, denser fog
        
        // Adjust lighting for night
        ambientLight.intensity = 0.2;
        sunLight.intensity = 0.1;
        sunLight.color.set(0xC0C0FF); // Moonlight (blueish)
        fillLight.intensity = 0.1;
        
        // Update interior lights if they exist
        scene.traverse((object) => {
            if (object.isPointLight) {
                object.intensity = 1.0; // Brighter interior lights at night
            }
        });
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    // Initialize performance monitor directly
    performanceMonitor = new PerformanceMonitor();
    // Start the game
    init();
});