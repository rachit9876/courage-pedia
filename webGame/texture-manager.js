// Texture manager for optimizing texture loading and usage
class TextureManager {
    constructor() {
        this.textures = new Map();
        this.textureLoader = new THREE.TextureLoader();
        this.maxAnisotropy = 1; // Default low anisotropy for performance
    }
    
    // Set renderer to get max anisotropy
    setRenderer(renderer) {
        if (renderer && renderer.capabilities) {
            this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        }
    }
    
    // Load texture with optimization options
    loadTexture(path, options = {}) {
        // Return cached texture if available
        if (this.textures.has(path)) {
            return this.textures.get(path);
        }
        
        // Default options
        const defaultOptions = {
            anisotropy: 1, // Low anisotropy by default
            minFilter: THREE.LinearMipMapLinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            generateMipmaps: true
        };
        
        // Merge options
        const finalOptions = { ...defaultOptions, ...options };
        
        // Load texture
        const texture = this.textureLoader.load(path);
        
        // Apply options
        texture.anisotropy = finalOptions.anisotropy;
        texture.minFilter = finalOptions.minFilter;
        texture.magFilter = finalOptions.magFilter;
        texture.wrapS = finalOptions.wrapS;
        texture.wrapT = finalOptions.wrapT;
        texture.generateMipmaps = finalOptions.generateMipmaps;
        
        // Cache texture
        this.textures.set(path, texture);
        
        return texture;
    }
    
    // Get optimized texture based on distance from camera
    getOptimizedTexture(path, distance) {
        // Determine appropriate anisotropy based on distance
        let anisotropy = 1;
        
        if (distance < 10) {
            anisotropy = Math.min(4, this.maxAnisotropy);
        } else if (distance < 30) {
            anisotropy = Math.min(2, this.maxAnisotropy);
        } else {
            anisotropy = 1;
        }
        
        // Determine if mipmaps should be generated
        const generateMipmaps = distance < 50;
        
        // Load texture with optimized settings
        return this.loadTexture(path, {
            anisotropy,
            generateMipmaps,
            minFilter: generateMipmaps ? THREE.LinearMipMapLinearFilter : THREE.LinearFilter
        });
    }
    
    // Dispose all textures
    dispose() {
        this.textures.forEach(texture => {
            texture.dispose();
        });
        this.textures.clear();
    }
}

// Export for use in game.js
window.TextureManager = TextureManager;