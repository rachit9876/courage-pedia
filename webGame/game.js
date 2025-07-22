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
const speed = 3.0; // Reduced movement speed for flying
let horizon; // Horizon plane for fake horizon effect
let isNightMode = true; // Default to night mode
let timeMode = 'night'; // 'morning', 'night', 'auto'
let dayNightCycle = {
    isAuto: false,
    startTime: 0,
    cycleDuration: 120000, // 2 minutes in milliseconds
    currentTime: 0
};
let ambientLight, sunLight, fillLight; // Store lights for day/night toggle

// Weather system variables
let weatherSystem = {
    type: 'none',
    particles: null,
    particleCount: 0,
    enabled: false
};
let rainGeometry, snowGeometry, weatherMaterial;
let weatherParticles = null;
let houseMesh = null; // Reference to Object_40 (house mesh)
let raycaster = new THREE.Raycaster(); // For collision detection

// Loading system variables
let loadingProgress = 0;
let totalAssets = 1; // We have 1 main asset (new.glb)
let loadedAssets = 0;

// Loading management functions
function updateLoadingProgress(progress) {
    loadingProgress = progress;
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    
    if (loadingBar) {
        loadingBar.style.width = progress + '%';
    }
    
    if (loadingText) {
        if (progress < 100) {
            loadingText.textContent = `Loading... ${Math.round(progress)}%`;
        } else {
            loadingText.textContent = 'Ready to play!';
        }
    }
    
    // Enable play button when fully loaded
    const playButton = document.getElementById('play-button');
    if (playButton && progress >= 100) {
        playButton.disabled = false;
        playButton.textContent = 'PLAY';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('loading-screen-hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

function initializeGame() {
    // This function will be called when play button is clicked
    const playButton = document.getElementById('play-button');
    if (playButton) {
        playButton.addEventListener('click', () => {
            hideLoadingScreen();
            // Enable pointer lock controls after loading screen is hidden
            setTimeout(() => {
                setupControls();
                animate();
            }, 500);
        });
    }
}

// Resolution settings
let currentResolution = 'medium'; // Default resolution
const resolutionScales = {
    high: 1.0,
    medium: 0.75,
    low: 0.5
};
const resolutionSettings = {
    high: {
        scale: 1.0,
        shadowMapSize: 1024,
        shadowEnabled: true,
        antialias: true,
        maxLights: 3,
        fogDensity: 0.09,
        drawDistance: 50
    },
    medium: {
        scale: 0.75,
        shadowMapSize: 512,
        shadowEnabled: true,
        antialias: false,
        maxLights: 3,
        fogDensity: 0.09,
        drawDistance: 50
    },
    low: {
        scale: 0.5,
        shadowMapSize: 256,
        shadowEnabled: false,
        antialias: false,
        maxLights: 3,
        fogDensity: 0.09,
        drawDistance: 50
    }
};

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
    
    // Set sky color based on night mode
    updateSceneForNightMode();
    
    
    // Create fake horizon effect
    createHorizon();
    
    // Initialize managers
    lodManager = new LODManager(scene);
    textureManager = new TextureManager();
    objectPool = new ObjectPool();
    
    // Create camera with optimized settings based on resolution
    const settings = resolutionSettings[currentResolution];
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, settings.drawDistance);
    camera.position.set(9, 1, 9); // Default spawn position
    
    // Set camera for LOD manager
    lodManager.setCamera(camera);
    
    // Create renderer with optimized settings based on resolution
    renderer = new THREE.WebGLRenderer({ 
        antialias: settings.antialias,
        powerPreference: 'high-performance',
        precision: 'mediump' // Use medium precision for better performance
    });
    
    // Apply resolution scale
    const scale = settings.scale;
    renderer.setSize(window.innerWidth * scale, window.innerHeight * scale, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    // Set pixel ratio based on resolution
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * scale, 2));
    
    // Configure shadows based on resolution settings
    renderer.shadowMap.enabled = settings.shadowEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better performance shadow map
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Set renderer for texture manager
    textureManager.setRenderer(renderer);
    
    // Add lighting based on night mode
    ambientLight = new THREE.AmbientLight(0xFFFFFF, isNightMode ? 0.2 : 0.6);
    scene.add(ambientLight);
    
    // Main light from the sky (optimized shadow settings based on resolution)
    sunLight = new THREE.DirectionalLight(
        isNightMode ? 0xC0C0FF : 0xFFFFCC, // Moonlight or sunlight color
        isNightMode ? 0.1 : 1.0 // Lower intensity at night
    );
    sunLight.position.set(10, 20, 10); // Coming from above at an angle
    sunLight.castShadow = settings.shadowEnabled;
    sunLight.shadow.camera.far = settings.drawDistance / 2;
    sunLight.shadow.mapSize.width = settings.shadowMapSize;
    sunLight.shadow.mapSize.height = settings.shadowMapSize;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);
    
    // Secondary fill light for softer shadows
    fillLight = new THREE.DirectionalLight(
        0xFFFFFF, 
        isNightMode ? 0.1 : 0.4 // Lower intensity at night
    );
    fillLight.position.set(-10, 8, -10); // Coming from opposite side
    fillLight.castShadow = false;
    scene.add(fillLight);
    
    // Setup event listeners
    document.addEventListener('timeModeChange', handleTimeModeChange);
    document.addEventListener('resolutionChange', handleResolutionChange);
    document.addEventListener('resetPosition', handleResetPosition);
    document.addEventListener('weatherChange', handleWeatherChange);
    
    // Load the house model with optimizations
    const loader = new THREE.GLTFLoader();
    
    // Set up Draco decoder for compressed models
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
    
    // Debug loading process
    console.log('Starting to load model: new.glb');
    
    loader.load(
        'new.glb', 
        // onLoad callback
        (gltf) => {
            console.log('Model loaded successfully, processing scene...');
            console.log('Scene contains:', gltf.scene.children.length, 'top-level objects');
            
            // Update loading progress to 100%
            updateLoadingProgress(100);
            
            // Log all mesh names to debug
            const meshNames = [];
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    meshNames.push(child.name);
                }
            });
            console.log('Found meshes:', meshNames.join(', '));
            const house = gltf.scene;
            
            // Find and store reference to house mesh (Object_40 or similar)
            gltf.scene.traverse((child) => {
                if (child.isMesh && (
                    child.name === 'Object_40' || 
                    child.name.includes('Object_40') ||
                    child.name.toLowerCase().includes('house') ||
                    child.name.includes('mesh_0') || // Common house mesh name
                    child.name.includes('Mesh_0')
                )) {
                    houseMesh = child;
                    // Ensure bounding box is computed for collision detection
                    if (child.geometry && !child.geometry.boundingBox) {
                        child.geometry.computeBoundingBox();
                    }
                    console.log('Found potential house mesh:', child.name, 'Bounding box:', child.geometry.boundingBox);
                }
            });
        house.traverse((child) => {
            if (child.isMesh) {
                // Log mesh details for debugging
                console.log('Processing mesh:', child.name, 'visible:', child.visible);
                
                // Ensure mesh is visible
                child.visible = true;
                
                // Special handling for mesh_7
                if (child.name === 'mesh_7' || child.name.includes('mesh_7')) {
                    console.log('Found mesh_7, ensuring it is properly configured');
                    child.visible = true;
                    child.renderOrder = 1; // Render this mesh first
                }
                
                // Hide Object_13 completely (check multiple variations)
                if (child.name === 'Object_13' || 
                    child.name.includes('Object_13') || 
                    child.name === 'Object13' || 
                    child.name.includes('Object13') ||
                    child.name.toLowerCase().includes('object_13') ||
                    child.name.toLowerCase().includes('object13')) {
                    console.log('Found Object_13 (or variant), hiding it:', child.name);
                    child.visible = false;
                    child.castShadow = false;
                    child.receiveShadow = false;
                    // Also try to remove it from rendering entirely
                    child.frustumCulled = true;
                    child.renderOrder = -1;
                    // Don't apply default optimization to hidden objects
                    return;
                }
                
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
                
                // Enable frustum culling but disable for mesh_7 to ensure it's always rendered
                if (child.name === 'mesh_7' || child.name.includes('mesh_7')) {
                    child.frustumCulled = false;
                    child.userData.cullable = false;
                } else {
                    child.frustumCulled = true;
                    child.userData.cullable = true;
                }
                
                // Log loaded objects
                console.log('Loaded object:', child.name, 'visible:', child.visible);
            }
        });
        scene.add(house);
        
        // Final pass to ensure Object_13 is completely hidden
        console.log('=== Final pass to hide Object_13 ===');
        scene.traverse((child) => {
            if (child.isMesh) {
                // Log all mesh names for debugging
                console.log('Mesh found:', child.name, 'visible:', child.visible);
                
                // Double-check for Object_13 variations
                if (child.name === 'Object_13' || 
                    child.name.includes('Object_13') || 
                    child.name === 'Object13' || 
                    child.name.includes('Object13') ||
                    child.name.toLowerCase().includes('object_13') ||
                    child.name.toLowerCase().includes('object13')) {
                    
                    console.log('HIDING Object_13 variant:', child.name);
                    child.visible = false;
                    child.castShadow = false;
                    child.receiveShadow = false;
                    child.frustumCulled = true;
                    child.renderOrder = -1;
                    
                    // Try to completely remove from scene
                    if (child.parent) {
                        console.log('Removing Object_13 from parent');
                        child.parent.remove(child);
                    }
                }
            }
        });
        console.log('=== End final pass ===');
        
        // Add interior lights after house is loaded
        addInteriorLights();
    }, 
    // onProgress callback
    (progress) => {
        if (progress.lengthComputable) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            updateLoadingProgress(percentComplete);
            console.log('Loading progress:', Math.round(percentComplete) + '%');
        } else {
            // If we can't compute progress, simulate it
            const simulatedProgress = Math.min(loadingProgress + 10, 90);
            updateLoadingProgress(simulatedProgress);
        }
    },
    // onError callback
    (error) => {
        console.error('An error occurred loading the model:', error);
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = 'Error loading model. Please refresh and try again.';
        }
    });
    
    // Function to add interior lights
    function addInteriorLights() {
        // Add fewer, optimized point lights inside the house
        // Intensity will be adjusted based on night mode
        const lightIntensity = isNightMode ? 1.0 : 0.5;
        
        // Adjust number of lights based on resolution setting
        const maxLights = resolutionSettings[currentResolution].maxLights;
        
        // Define all possible lights
        const allLights = [
            { position: [0, 2, 0], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [5, 2, 0], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [-5, 2, 0], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [0, 2, 5], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [0, 2, -5], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [3, 2, 3], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [-3, 2, -3], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [3, 2, -3], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [-3, 2, 3], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 },
            { position: [0, 4, 0], color: 0xFFFFC0, intensity: lightIntensity, distance: 15 }
        ];
        
        // Use only the number of lights allowed by the current resolution setting
        const interiorLights = allLights.slice(0, maxLights);
        
        interiorLights.forEach(light => {
            const pointLight = new THREE.PointLight(light.color, light.intensity, light.distance);
            pointLight.position.set(...light.position);
            pointLight.castShadow = false; // Disable shadows on point lights
            scene.add(pointLight);
        });
    }
    
    // Initialize loading system (don't start controls and animation yet)
    initializeGame();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start loading progress simulation for scripts
    updateLoadingProgress(10);
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
    
    // Apply resolution scale on resize
    const scale = resolutionSettings[currentResolution].scale;
    renderer.setSize(window.innerWidth * scale, window.innerHeight * scale, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
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
    
    // Update auto day/night cycle
    if (dayNightCycle.isAuto) {
        updateDayNightCycle(time);
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
        // Special handling for mesh_7 - always keep it visible
        if (object.name === 'mesh_7' || object.name.includes('mesh_7')) {
            object.visible = true;
            return;
        }
        
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
    
    // Update weather system
    updateWeatherSystem(delta);
    
    // Update horizon position to follow player
    updateHorizon();
    
    renderer.render(scene, camera);
}

// Function to update scene based on night mode
function updateSceneForNightMode() {
    if (isNightMode) {
        // Night mode settings
        scene.background = new THREE.Color(0x0A1020); // Dark blue night sky
        scene.fog = new THREE.FogExp2(0x0A1020, resolutionSettings[currentResolution].fogDensity * 1.5); // Darker fog
    } else {
        // Day mode settings
        scene.background = new THREE.Color(0x87CEEB); // Light blue sky
        scene.fog = new THREE.FogExp2(0xCCDDFF, resolutionSettings[currentResolution].fogDensity); // Lighter fog
    }
}

// Create fake horizon effect - replaced with bg.png
function createHorizon() {
    // Horizon functionality removed as we're using bg.png as background
    horizon = null; // Set to null since we're not using it anymore
}

// Weather Effects System
function createWeatherSystem(type) {
    // Remove existing weather system if any
    if (weatherParticles) {
        scene.remove(weatherParticles);
        if (rainGeometry) rainGeometry.dispose();
        if (snowGeometry) snowGeometry.dispose();
        if (weatherMaterial) weatherMaterial.dispose();
        weatherParticles = null;
    }
    
    if (type === 'none') {
        weatherSystem.enabled = false;
        return;
    }
    
    weatherSystem.type = type;
    weatherSystem.enabled = true;
    
    if (type === 'rain') {
        createRainEffect();
    } else if (type === 'snow') {
        createSnowEffect();
    } else if (type === 'fog') {
        createHeavyFogEffect();
    }
}

function createRainEffect() {
    const particleCount = 800;
    rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        // Random position in a large area around the player
        positions[i] = (Math.random() - 0.5) * 100; // x
        positions[i + 1] = Math.random() * 50 + 20; // y (above ground)
        positions[i + 2] = (Math.random() - 0.5) * 100; // z
        
        // Rain falls downward with slight randomness
        velocities[i] = (Math.random() - 0.5) * 0.5; // x velocity
        velocities[i + 1] = -10 - Math.random() * 5; // y velocity (falling)
        velocities[i + 2] = (Math.random() - 0.5) * 0.5; // z velocity
    }
    
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    weatherMaterial = new THREE.PointsMaterial({
        color: 0x77aaff,
        size: 0.1,
        transparent: true,
        opacity: 0.7
    });
    
    weatherParticles = new THREE.Points(rainGeometry, weatherMaterial);
    scene.add(weatherParticles);
    weatherSystem.particleCount = particleCount;
}

function createSnowEffect() {
    const particleCount = 500;
    snowGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 80; // x
        positions[i + 1] = Math.random() * 50 + 15; // y
        positions[i + 2] = (Math.random() - 0.5) * 80; // z
        
        // Snow falls slower and more randomly
        velocities[i] = (Math.random() - 0.5) * 1; // x velocity
        velocities[i + 1] = -1 - Math.random() * 2; // y velocity (slow falling)
        velocities[i + 2] = (Math.random() - 0.5) * 1; // z velocity
    }
    
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    snowGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    weatherMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.8
    });
    
    weatherParticles = new THREE.Points(snowGeometry, weatherMaterial);
    scene.add(weatherParticles);
    weatherSystem.particleCount = particleCount;
}

function createHeavyFogEffect() {
    // Heavy fog increases the existing fog density significantly
    if (scene.fog) {
        const baseDensity = resolutionSettings[currentResolution].fogDensity;
        const fogMultiplier = isNightMode ? 4.0 : 3.0; // Even denser fog
        scene.fog.density = baseDensity * fogMultiplier;
        
        // Change fog color to be more dramatic
        if (isNightMode) {
            scene.fog.color.set(0x050510); // Very dark fog
        } else {
            scene.fog.color.set(0x999999); // Gray fog
        }
    }
    weatherSystem.enabled = true;
}

function updateWeatherSystem(deltaTime) {
    if (!weatherSystem.enabled || !weatherParticles) return;
    
    if (weatherSystem.type === 'rain' || weatherSystem.type === 'snow') {
        const positions = weatherParticles.geometry.attributes.position.array;
        const velocities = weatherParticles.geometry.attributes.velocity.array;
        
        for (let i = 0; i < weatherSystem.particleCount * 3; i += 3) {
            // Update positions based on velocities
            positions[i] += velocities[i] * deltaTime;
            positions[i + 1] += velocities[i + 1] * deltaTime;
            positions[i + 2] += velocities[i + 2] * deltaTime;
            
            // Check collision with house mesh
            let shouldRespawn = false;
            
            if (houseMesh) {
                // Create a point for the particle position
                const particlePosition = new THREE.Vector3(
                    positions[i],
                    positions[i + 1],
                    positions[i + 2]
                );
                
                // Check if particle is inside house bounding box (simple collision)
                const houseBoundingBox = houseMesh.geometry.boundingBox;
                if (houseBoundingBox) {
                    // Transform bounding box to world coordinates
                    const worldBoundingBox = houseBoundingBox.clone();
                    worldBoundingBox.applyMatrix4(houseMesh.matrixWorld);
                    
                    // Check if particle is inside the house bounding box
                    if (worldBoundingBox.containsPoint(particlePosition)) {
                        shouldRespawn = true;
                        console.log('Particle collided with house and will be respawned');
                    }
                }
            }
            
            // Reset particles that fall below ground, go too far, or hit the house
            if (shouldRespawn ||
                positions[i + 1] < -5 || 
                Math.abs(positions[i] - camera.position.x) > 50 || 
                Math.abs(positions[i + 2] - camera.position.z) > 50) {
                
                // Respawn particle above player, but outside house area
                let newX, newZ;
                let attempts = 0;
                const maxAttempts = 10;
                
                do {
                    newX = camera.position.x + (Math.random() - 0.5) * 50;
                    newZ = camera.position.z + (Math.random() - 0.5) * 50;
                    attempts++;
                } while (houseMesh && isPositionInsideHouse(newX, newZ) && attempts < maxAttempts);
                
                positions[i] = newX;
                positions[i + 1] = camera.position.y + 25 + Math.random() * 25;
                positions[i + 2] = newZ;
            }
        }
        
        weatherParticles.geometry.attributes.position.needsUpdate = true;
    }
}

// Helper function to check if a position is inside the house
function isPositionInsideHouse(x, z) {
    if (!houseMesh || !houseMesh.geometry.boundingBox) return false;
    
    const houseBoundingBox = houseMesh.geometry.boundingBox.clone();
    houseBoundingBox.applyMatrix4(houseMesh.matrixWorld);
    
    // Check only X and Z coordinates (ignore Y for spawning)
    return (x >= houseBoundingBox.min.x && x <= houseBoundingBox.max.x &&
            z >= houseBoundingBox.min.z && z <= houseBoundingBox.max.z);
}

// Update horizon position to follow player - no longer needed with bg.png
function updateHorizon() {
    // Function kept for compatibility but no longer does anything
    return;
}

// Handle reset position
function handleResetPosition() {
    // Reset player position to coordinates (9, 1, 9)
    if (controls && controls.getObject()) {
        controls.getObject().position.set(9, 1, 9);
        console.log('Position reset to coordinates (9, 1, 9)');
    }
}

// Handle resolution change
function handleResolutionChange(event) {
    const newResolution = event.detail.resolution;
    
    // Skip if resolution hasn't changed
    if (newResolution === currentResolution) return;
    
    // Update current resolution
    currentResolution = newResolution;
    const settings = resolutionSettings[currentResolution];
    
    // Update camera draw distance
    camera.far = settings.drawDistance;
    camera.updateProjectionMatrix();
    
    // Update renderer resolution
    const scale = settings.scale;
    renderer.setSize(window.innerWidth * scale, window.innerHeight * scale, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * scale, 2));
    
    // Update shadow settings
    renderer.shadowMap.enabled = settings.shadowEnabled;
    if (sunLight) {
        sunLight.castShadow = settings.shadowEnabled;
        sunLight.shadow.mapSize.width = settings.shadowMapSize;
        sunLight.shadow.mapSize.height = settings.shadowMapSize;
        sunLight.shadow.camera.far = settings.drawDistance / 2;
        sunLight.shadow.needsUpdate = true;
    }
    
    // Update fog density based on night mode
    if (scene && scene.fog) {
        const fogDensity = isNightMode ? 
            settings.fogDensity * 1.5 : 
            settings.fogDensity;
        scene.fog.density = fogDensity;
    }
    
    // Update interior lights
    const maxLights = settings.maxLights;
    let lightCount = 0;
    
    scene.traverse((object) => {
        if (object.isPointLight && object !== sunLight && object !== fillLight && object !== ambientLight) {
            // Show only the allowed number of lights for this resolution
            object.visible = lightCount < maxLights;
            lightCount++;
        }
    });
    
    console.log(`Resolution changed to ${currentResolution}`);
}

// Handle weather change
function handleWeatherChange(event) {
    const newWeatherType = event.detail.weatherType;
    console.log(`Weather changed to ${newWeatherType}`);
    
    // Reset fog to normal levels first
    if (scene.fog && weatherSystem.type === 'fog') {
        const baseDensity = resolutionSettings[currentResolution].fogDensity;
        const fogDensity = isNightMode ? baseDensity * 1.5 : baseDensity;
        scene.fog.density = fogDensity;
        
        // Reset fog color
        if (isNightMode) {
            scene.fog.color.set(0x0A1020);
        } else {
            scene.fog.color.set(0xCCDDFF);
        }
    }
    
    // Create new weather system
    createWeatherSystem(newWeatherType);
}

// Function to update scene based on night mode
function updateSceneForNightMode() {
    if (isNightMode) {
        // Night mode settings
        scene.background = new THREE.Color(0x0A1020); // Dark blue night sky
        scene.fog = new THREE.FogExp2(0x0A1020, resolutionSettings[currentResolution].fogDensity * 1.5); // Darker fog
    } else {
        // Day mode settings
        scene.background = new THREE.Color(0x87CEEB); // Light blue sky
        scene.fog = new THREE.FogExp2(0xCCDDFF, resolutionSettings[currentResolution].fogDensity); // Lighter fog
    }
}

// Handle night mode toggle
function handleNightModeToggle(event) {
    isNightMode = event.detail.isNightMode;
    
    if (!isNightMode) {
        // Day mode settings
        scene.background = new THREE.Color(0x87CEEB); // Light blue sky
        scene.fog = new THREE.FogExp2(0xCCDDFF, resolutionSettings[currentResolution].fogDensity); // Fog based on resolution
        
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
        scene.fog = new THREE.FogExp2(0x0A1020, resolutionSettings[currentResolution].fogDensity * 1.5); // Darker fog based on resolution
        
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
    
    // Add event listener for reset position button
    const resetPositionButton = document.getElementById('reset-position');
    if (resetPositionButton) {
        resetPositionButton.addEventListener('click', () => {
            // Dispatch a custom event to reset position
            document.dispatchEvent(new CustomEvent('resetPosition'));
        });
    }
    
    // Add event listener for gear icon to toggle settings panel
    const gearIcon = document.getElementById('gear-icon');
    const settingsPanel = document.getElementById('settings-panel');
    if (gearIcon && settingsPanel) {
        gearIcon.addEventListener('click', () => {
            // Toggle settings panel visibility
            settingsPanel.style.display = settingsPanel.style.display === 'none' || settingsPanel.style.display === '' ? 'block' : 'none';
        });
    }
    
    // Add event listeners for other settings options
    const showFpsCheckbox = document.getElementById('show-fps');
    if (showFpsCheckbox) {
        showFpsCheckbox.addEventListener('change', () => {
            performanceMonitor.showFPS = showFpsCheckbox.checked;
            document.getElementById('fps').style.display = showFpsCheckbox.checked ? 'block' : 'none';
        });
    }
    
    const showPositionCheckbox = document.getElementById('show-position');
    if (showPositionCheckbox) {
        showPositionCheckbox.addEventListener('change', () => {
            performanceMonitor.showPosition = showPositionCheckbox.checked;
            document.getElementById('coordinates').style.display = showPositionCheckbox.checked ? 'block' : 'none';
        });
    }
    
    const resolutionSelect = document.getElementById('resolution-select');
    if (resolutionSelect) {
        resolutionSelect.addEventListener('change', () => {
            document.dispatchEvent(new CustomEvent('resolutionChange', { detail: { resolution: resolutionSelect.value } }));
        });
    }
    
    const weatherSelect = document.getElementById('weather-select');
    if (weatherSelect) {
        weatherSelect.addEventListener('change', () => {
            document.dispatchEvent(new CustomEvent('weatherChange', { detail: { weatherType: weatherSelect.value } }));
        });
    }
    
    // Start the game
    init();
});

// Handle time mode change
function handleTimeModeChange(event) {
    timeMode = event.detail.timeMode;
    
    switch (timeMode) {
        case 'morning':
            dayNightCycle.isAuto = false;
            setDayMode();
            break;
        case 'night':
            dayNightCycle.isAuto = false;
            setNightMode();
            break;
        case 'auto':
            dayNightCycle.isAuto = true;
            dayNightCycle.startTime = performance.now();
            dayNightCycle.currentTime = 0;
            break;
    }
}

// Function to update auto day/night cycle
function updateDayNightCycle(currentTime) {
    if (!dayNightCycle.isAuto) return;
    
    dayNightCycle.currentTime = (currentTime - dayNightCycle.startTime) % dayNightCycle.cycleDuration;
    const cycleProgress = dayNightCycle.currentTime / dayNightCycle.cycleDuration;
    
    // Smooth transition between day and night
    // 0.0 to 0.5 = day to night transition
    // 0.5 to 1.0 = night to day transition
    const nightIntensity = Math.sin(cycleProgress * Math.PI * 2) * 0.5 + 0.5;
    
    // Update sky color
    const dayColor = new THREE.Color(0x87CEEB); // Light blue
    const nightColor = new THREE.Color(0x0A1020); // Dark blue
    const skyColor = dayColor.clone().lerp(nightColor, nightIntensity);
    scene.background = skyColor;
    
    // Update fog
    const dayFogColor = new THREE.Color(0xCCDDFF);
    const nightFogColor = new THREE.Color(0x0A1020);
    const fogColor = dayFogColor.clone().lerp(nightFogColor, nightIntensity);
    
    if (weatherSystem.enabled && weatherSystem.type === 'fog') {
        const baseDensity = resolutionSettings[currentResolution].fogDensity;
        const fogDensity = baseDensity * (3.0 + nightIntensity); // Darker fog at night
        scene.fog = new THREE.FogExp2(fogColor.getHex(), fogDensity);
    } else {
        const baseDensity = resolutionSettings[currentResolution].fogDensity;
        const fogDensity = baseDensity * (1.0 + nightIntensity * 0.5);
        scene.fog = new THREE.FogExp2(fogColor.getHex(), fogDensity);
    }
    
    // Update lighting
    ambientLight.intensity = 0.6 - (nightIntensity * 0.4); // 0.6 to 0.2
    sunLight.intensity = 1.0 - (nightIntensity * 0.9); // 1.0 to 0.1
    fillLight.intensity = 0.4 - (nightIntensity * 0.3); // 0.4 to 0.1
    
    // Update light colors
    const dayLightColor = new THREE.Color(0xFFFFCC); // Warm sunlight
    const nightLightColor = new THREE.Color(0xC0C0FF); // Cool moonlight
    const lightColor = dayLightColor.clone().lerp(nightLightColor, nightIntensity);
    sunLight.color = lightColor;
    
    // Update interior lights
    scene.traverse((object) => {
        if (object.isPointLight) {
            object.intensity = 0.5 + (nightIntensity * 0.5); // 0.5 to 1.0
        }
    });
}

// Set day mode
function setDayMode() {
    isNightMode = false;
    
    // Day mode settings
    scene.background = new THREE.Color(0x87CEEB); // Light blue sky
    
    // Handle fog based on current weather
    if (weatherSystem.enabled && weatherSystem.type === 'fog') {
        scene.fog = new THREE.FogExp2(0x999999, resolutionSettings[currentResolution].fogDensity * 3.0); // Gray heavy fog
    } else {
        scene.fog = new THREE.FogExp2(0xCCDDFF, resolutionSettings[currentResolution].fogDensity); // Regular day fog
    }
    
    // Adjust lighting for day
    ambientLight.intensity = 0.6;
    sunLight.intensity = 1.0;
    sunLight.color.set(0xFFFFCC); // Bright sunlight
    fillLight.intensity = 0.4;
    
    // Update interior lights
    scene.traverse((object) => {
        if (object.isPointLight) {
            object.intensity = 0.5; // Dimmer interior lights during day
        }
    });
}

// Set night mode
function setNightMode() {
    isNightMode = true;
    
    // Night mode settings
    scene.background = new THREE.Color(0x0A1020); // Dark blue night sky
    
    // Handle fog based on current weather
    if (weatherSystem.enabled && weatherSystem.type === 'fog') {
        scene.fog = new THREE.FogExp2(0x050510, resolutionSettings[currentResolution].fogDensity * 4.0); // Very dark heavy fog
    } else {
        scene.fog = new THREE.FogExp2(0x0A1020, resolutionSettings[currentResolution].fogDensity * 1.5); // Regular night fog
    }
    
    // Adjust lighting for night
    ambientLight.intensity = 0.2;
    sunLight.intensity = 0.1;
    sunLight.color.set(0xC0C0FF); // Moonlight (blueish)
    fillLight.intensity = 0.1;
    
    // Update interior lights
    scene.traverse((object) => {
        if (object.isPointLight) {
            object.intensity = 1.0; // Brighter interior lights at night
        }
    });
}