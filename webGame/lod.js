// Level of Detail (LOD) manager for optimizing 3D models
class LODManager {
    constructor(scene) {
        this.scene = scene;
        this.camera = null;
        this.lodObjects = [];
        this.distanceThresholds = [10, 25, 50, 100];
    }
    
    setCamera(camera) {
        this.camera = camera;
    }
    
    // Add an object with LOD levels
    addObject(object, lodLevels) {
        if (!lodLevels || lodLevels.length === 0) return;
        
        this.lodObjects.push({
            object: object,
            levels: lodLevels,
            currentLevel: 0
        });
    }
    
    // Update LOD based on camera distance
    update() {
        if (!this.camera) return;
        
        const cameraPosition = this.camera.position;
        
        this.lodObjects.forEach(lodObject => {
            const objectPosition = lodObject.object.position;
            const distance = cameraPosition.distanceTo(objectPosition);
            
            // Determine appropriate LOD level based on distance
            let newLevel = 0;
            for (let i = 0; i < this.distanceThresholds.length; i++) {
                if (distance > this.distanceThresholds[i]) {
                    newLevel = i + 1;
                }
            }
            
            // If LOD level changed, update the object
            if (newLevel !== lodObject.currentLevel && newLevel < lodObject.levels.length) {
                this.updateObjectLOD(lodObject, newLevel);
            }
        });
    }
    
    // Update object to use new LOD level
    updateObjectLOD(lodObject, newLevel) {
        const oldLevel = lodObject.currentLevel;
        
        // Skip if same level or invalid level
        if (oldLevel === newLevel || newLevel >= lodObject.levels.length) return;
        
        // Update the object's geometry to the new LOD level
        const newGeometry = lodObject.levels[newLevel];
        if (newGeometry && lodObject.object.geometry) {
            // Store position and rotation
            const position = lodObject.object.position.clone();
            const rotation = lodObject.object.rotation.clone();
            const scale = lodObject.object.scale.clone();
            
            // Update geometry
            lodObject.object.geometry.dispose();
            lodObject.object.geometry = newGeometry;
            
            // Restore position and rotation
            lodObject.object.position.copy(position);
            lodObject.object.rotation.copy(rotation);
            lodObject.object.scale.copy(scale);
            
            // Update current level
            lodObject.currentLevel = newLevel;
        }
    }
}

// Export for use in game.js
window.LODManager = LODManager;