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
        this.showFPS = false; // Default to hiding FPS
        this.showPosition = false; // Default to hiding position
        
        // Create performance display element
        this.createStatsDisplay();
        
        // Setup settings panel functionality
        this.setupSettingsPanel();
    }
    
    createStatsDisplay() {
        // Advanced stats display is already in the HTML
    }
    
    setupSettingsPanel() {
        // Setup gear icon click handler
        const gearIcon = document.getElementById('gear-icon');
        const settingsPanel = document.getElementById('settings-panel');
        const showFpsCheckbox = document.getElementById('show-fps');
        const showPositionCheckbox = document.getElementById('show-position');
        const dayNightToggle = document.getElementById('day-night-toggle');
        const fullscreenToggle = document.getElementById('fullscreen-toggle');
        const fpsDisplay = document.getElementById('fps');
        const coordinatesDisplay = document.getElementById('coordinates');
        
        // Hide displays by default
        fpsDisplay.style.display = 'none';
        coordinatesDisplay.style.display = 'none';
        
        // Toggle settings panel visibility
        gearIcon.addEventListener('click', () => {
            if (settingsPanel.style.display === 'block') {
                settingsPanel.style.display = 'none';
            } else {
                settingsPanel.style.display = 'block';
            }
        });
        
        // Handle FPS checkbox change
        showFpsCheckbox.addEventListener('change', () => {
            this.showFPS = showFpsCheckbox.checked;
            fpsDisplay.style.display = this.showFPS ? 'block' : 'none';
        });
        
        // Handle Position checkbox change
        showPositionCheckbox.addEventListener('change', () => {
            this.showPosition = showPositionCheckbox.checked;
            coordinatesDisplay.style.display = this.showPosition ? 'block' : 'none';
        });
        
        // Handle Day/Night toggle change
        dayNightToggle.addEventListener('change', () => {
            const isDayMode = dayNightToggle.checked;
            dayNightToggle.nextElementSibling.textContent = isDayMode ? 'Day Mode' : 'Night Mode';
            
            // Dispatch custom event for game.js to handle
            const event = new CustomEvent('dayNightToggle', { detail: { isDayMode } });
            document.dispatchEvent(event);
        });
        
        // Handle Fullscreen toggle change
        fullscreenToggle.addEventListener('change', () => {
            if (fullscreenToggle.checked) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
        
        // Update fullscreen checkbox when fullscreen state changes
        document.addEventListener('fullscreenchange', () => {
            fullscreenToggle.checked = document.fullscreenElement !== null;
        });
        
        // Close panel when clicking elsewhere
        document.addEventListener('click', (event) => {
            if (!gearIcon.contains(event.target) && !settingsPanel.contains(event.target)) {
                settingsPanel.style.display = 'none';
            }
        });
    }
    
    update(renderer) {
        // Get renderer info
        const info = renderer.info;
        
        // Update stats
        this.stats.drawCalls = info.render.calls;
        this.stats.triangles = info.render.triangles;
        this.stats.textures = info.memory.textures;
        this.stats.geometries = info.memory.geometries;
        
        // Update FPS display if enabled
        if (this.showFPS) {
            document.getElementById('fps').textContent = 
                `FPS: ${this.stats.fps} | Draw calls: ${this.stats.drawCalls} | Triangles: ${this.stats.triangles}`;
        }
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