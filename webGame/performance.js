// Performance monitoring utilities
class PerformanceMonitor {
    constructor() {
        this.stats = {
            fps: 0,
            drawCalls: 0,
            triangles: 0,
            textures: 0,
            geometries: 0
        };
        
        this.fpsArray = [];
        this.fpsArraySize = 60; // Store last 60 frames for averaging
        
        // Create performance display element
        this.createStatsDisplay();
    }
    
    createStatsDisplay() {
        // Advanced stats display is already in the HTML
    }
    
    update(renderer) {
        // Get renderer info
        const info = renderer.info;
        
        // Update stats
        this.stats.drawCalls = info.render.calls;
        this.stats.triangles = info.render.triangles;
        this.stats.textures = info.memory.textures;
        this.stats.geometries = info.memory.geometries;
        
        // Update FPS display
        document.getElementById('fps').textContent = 
            `FPS: ${this.stats.fps} | Draw calls: ${this.stats.drawCalls} | Triangles: ${this.stats.triangles}`;
    }
    
    updateFPS(fps) {
        // Add current FPS to array
        this.fpsArray.push(fps);
        
        // Keep array at fixed size
        if (this.fpsArray.length > this.fpsArraySize) {
            this.fpsArray.shift();
        }
        
        // Calculate average FPS
        const sum = this.fpsArray.reduce((a, b) => a + b, 0);
        this.stats.fps = Math.round(sum / this.fpsArray.length);
    }
}

// Export for use in game.js
window.PerformanceMonitor = PerformanceMonitor;