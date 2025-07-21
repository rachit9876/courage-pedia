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
let ambientLight, sunLight, fillLight; // Store lights for day/night toggle

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
        maxLights: 10,
        fogDensity: 0.05,
        drawDistance: 100
    },
    medium: {
        scale: 0.75,
        shadowMapSize: 512,
        shadowEnabled: true,
        antialias: false,
        maxLights: 6,
        fogDensity: 0.07,
        drawDistance: 75
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
    document.addEventListener('nightModeToggle', handleNightModeToggle);
    document.addEventListener('resolutionChange', handleResolutionChange);
    document.addEventListener('resetPosition', handleResetPosition);
    
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
    
    const nightModeToggle = document.getElementById('night-mode-toggle');
    if (nightModeToggle) {
        nightModeToggle.addEventListener('change', () => {
            document.dispatchEvent(new CustomEvent('nightModeToggle', { detail: { isNightMode: nightModeToggle.checked } }));
        });
    }
    
    const resolutionSelect = document.getElementById('resolution-select');
    if (resolutionSelect) {
        resolutionSelect.addEventListener('change', () => {
            document.dispatchEvent(new CustomEvent('resolutionChange', { detail: { resolution: resolutionSelect.value } }));
        });
    }
    
    // Start the game
    init();
});
// Handle night mode toggle
function handleNightModeToggle(event) {
    isNightMode = event.detail.isNightMode;
    
    if (isNightMode) {
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
    } else {
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
    }
}