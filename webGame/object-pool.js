// Object pooling for reusing objects instead of creating new ones
class ObjectPool {
    constructor() {
        this.pools = {};
    }
    
    // Get an object from the pool or create a new one
    get(type, createFunc) {
        // Create pool for this type if it doesn't exist
        if (!this.pools[type]) {
            this.pools[type] = [];
        }
        
        // Get object from pool or create new one
        if (this.pools[type].length > 0) {
            return this.pools[type].pop();
        } else {
            return createFunc();
        }
    }
    
    // Return an object to the pool
    release(type, object) {
        // Create pool for this type if it doesn't exist
        if (!this.pools[type]) {
            this.pools[type] = [];
        }
        
        // Reset object if it has a reset method
        if (object.reset && typeof object.reset === 'function') {
            object.reset();
        }
        
        // Add object to pool
        this.pools[type].push(object);
    }
    
    // Clear all pools
    clear() {
        this.pools = {};
    }
}

// Export for use in game.js
window.ObjectPool = ObjectPool;