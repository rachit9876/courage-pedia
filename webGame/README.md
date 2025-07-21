# Web Game Developer Guide

This document serves as a guide for developers working on this web-based game project.

## Project Structure

- `index.html` - Main entry point for the game
- `game.js` - Core game logic and initialization
- `lod.js` - Level of Detail implementation for performance optimization

- `object-pool.js` - Object pooling for performance optimization
- `performance.js` - Performance monitoring and optimization utilities
- `texture-manager.js` - Handles texture loading and management
- `style.css` - Game styling
- `bg.png` - Background image asset
- `houseMap.glb`, `new.glb` - 3D model assets

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. For development, use a local server (e.g., Live Server extension in VS Code)

## Development Guidelines

### Adding New Features

1. Create or modify the relevant JavaScript files
2. Update the main `game.js` file if necessary
3. Test thoroughly on desktop browsers

### Performance Considerations

- Use the object pooling system in `object-pool.js` for frequently created/destroyed objects
- Implement LOD (Level of Detail) for complex 3D models using `lod.js`
- Use the texture manager for efficient texture handling
- Monitor performance using utilities in `performance.js`



## Asset Guidelines

- 3D models should be optimized and in GLB format
- Textures should be power-of-two sized for optimal performance
- Consider compression for large texture files

## Testing

- Test on multiple browsers (Chrome, Firefox, Safari)
- Monitor performance metrics during testing

## Version Control

- Follow conventional commit message format
- Create feature branches for new development
- Submit pull requests for code review before merging to main branch

## Deployment

1. Ensure all assets are properly optimized
2. Test the final build on target platforms
3. Deploy to web server or hosting platform of choice