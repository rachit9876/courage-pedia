# Courage Fan Page - Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Technologies Used](#technologies-used)
4. [Setup and Installation](#setup-and-installation)
5. [Key Components](#key-components)
6. [Data Management](#data-management)
7. [Styling and UI](#styling-and-ui)
8. [JavaScript Functionality](#javascript-functionality)
9. [Progressive Web App (PWA)](#progressive-web-app-pwa)
10. [Performance Optimization](#performance-optimization)
11. [Extending the Project](#extending-the-project)
12. [Troubleshooting](#troubleshooting)

## Project Overview

This project is a comprehensive fan page dedicated to the animated series "Courage." It features multiple interactive sections including:

- Main landing page with character information
- Episode guide and details
- Recipe book based on the show
- Gallery of images
- Lost media archive
- Original soundtrack (OST) player
- Research paper section

The website is designed as a Progressive Web App (PWA) with a dark theme and pixel art aesthetic that matches the show's unique visual style.

## Project Structure

```
webpage/
├── assets/                 # Images and media files
├── cookbook/               # Recipe book section
│   ├── app.js             # Recipe book functionality
│   ├── book.html          # Recipe book HTML
│   ├── courage_cookbook.json # Recipe data
│   └── style.css          # Recipe book styles
├── CSV/                    # Data files in CSV format
│   ├── allcharacters.csv  # Character data
│   ├── CTCD_english.csv   # English text content
│   ├── CTCD_hindi.csv     # Hindi text content
│   ├── gallery.csv        # Gallery image metadata
│   ├── lost_media.csv     # Lost media information
│   └── OST.csv            # Soundtrack information
├── notifications/          # Notification scripts
│   ├── sorry.js           # Error notifications
│   └── welcome.js         # Welcome notifications
├── OST/                    # Audio files for soundtrack
├── researchPaper/          # Research documents
├── Thumbnails/             # Thumbnail images
├── .gitattributes         # Git configuration
├── .htaccess              # Server configuration
├── gallery.html           # Gallery page
├── index.html             # Main landing page
├── logo.svg               # Site logo
├── lostmedia.html         # Lost media archive page
├── manifest.json          # PWA manifest
├── ost.html               # Soundtrack player page
├── pwa-install.js         # PWA installation script
├── quiz.html              # Quiz page
├── research.html          # Research page
├── robots.txt             # Search engine directives
├── stream.html            # Video streaming page
└── sw.js                  # Service worker for PWA
```

## Technologies Used

- **HTML5**: Semantic markup for content structure
- **CSS3**: Styling with custom properties and animations
- **JavaScript**: Interactive functionality and data manipulation
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Chart.js**: Data visualization for statistics
- **Progressive Web App (PWA)**: For offline capabilities and mobile installation
- **CSV Data Storage**: For structured content management
- **JSON**: For recipe book data

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd webpage
   ```

2. **Local Development**:
   - Use a local server to properly test the site:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js with http-server
     npx http-server
     ```
   - Open your browser and navigate to `http://localhost:8000` or the port specified by your server

3. **Dependencies**:
   - The project uses CDN-hosted dependencies:
     - Tailwind CSS: `https://cdn.tailwindcss.com`
     - Chart.js: `https://cdn.jsdelivr.net/npm/chart.js`
     - Font Awesome: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css`
     - Google Fonts: 'Special Elite' font

4. **Production Deployment**:
   - Upload all files to your web hosting service
   - Ensure the server supports `.htaccess` configuration if using Apache
   - Configure proper MIME types for audio and video files

## Key Components

### Main Landing Page (index.html)

The landing page features:
- Pixel art computer terminal with typing animation
- Navigation to all sections
- Character information with modal popups
- Episode guide with search and filtering
- Villain and allies galleries
- Thematic exploration of the show

Key JavaScript functions:
- `typeText()`: Creates terminal typing effect
- `renderCharacters()`: Displays character data from CSV
- `renderEpisodes()`: Shows episode list with filtering
- `highlightText()`: Search highlighting functionality

### Recipe Book (cookbook/book.html)

An interactive cookbook featuring recipes from the show:
- Welcome page with farmhouse background
- Recipe browser with search and category filtering
- Detailed recipe view with ingredients and instructions
- Recipe scaling functionality

Key JavaScript functions:
- `showRecipeBrowser()`: Switches to recipe list view
- `showRecipeDetail()`: Displays detailed recipe information
- `applyScale()`: Adjusts recipe quantities based on servings

### Data Management

The project uses CSV files for structured data:
- `allcharacters.csv`: Contains character information
- `gallery.csv`: Image metadata for the gallery
- `lost_media.csv`: Information about lost episodes and content
- `OST.csv`: Soundtrack metadata

CSV data is loaded asynchronously using fetch:
```javascript
async function loadCharacters() {
    try {
        const response = await fetch('CSV/allcharacters.csv');
        if (!response.ok) throw new Error('Failed to load characters');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        allCharacters = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                const values = line.split(',');
                return {
                    name: values[0]?.trim() || '',
                    role: values[1]?.trim() || '',
                    appearance: values[2]?.trim() || '',
                    behavior: values[3]?.trim() || ''
                };
            });
        charactersLoaded = true;
        renderCharacters();
    } catch (error) {
        document.getElementById('charactersTableBody').innerHTML = 
            '<tr><td colspan="4" class="p-4 text-center text-red-400">Failed to load characters</td></tr>';
    }
}
```

## Styling and UI

### Theme and Color Scheme

The site uses a dark theme with pink accents to match the show's eerie atmosphere:
- Background: Black (`#000`)
- Card backgrounds: Dark gray (`#333`)
- Primary accent: Pink (`#fdc3ed`)
- Secondary text: Light gray (`#ccc`)
- Horror accent: Red/purple tones

### Responsive Design

The site is fully responsive with breakpoints for:
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

Media queries adjust font sizes, spacing, and layout:
```css
@media(max-width:768px){
    .text-3xl{font-size:1.5rem}
    .text-4xl{font-size:1.875rem}
    .text-6xl{font-size:2.5rem}
    h1{line-height:1.2}
    .container{padding-left:1rem;padding-right:1rem}
    /* Additional responsive adjustments */
}
```

### Custom UI Components

1. **Pixel Computer Interface**:
   ```css
   .pixel-computer{
       image-rendering: pixelated;
       border: 4px solid #000;
       box-shadow: inset 2px 2px 0 #fff, inset -2px -2px 0 #666, 4px 4px 0 #333, 8px 8px 0 #111;
       aspect-ratio: 3/2;
       max-width: 450px;
       width: 100%;
   }
   ```

2. **Pixel Buttons**:
   ```css
   .pixel-button{
       border: 3px solid #000;
       box-shadow: inset 2px 2px 0 #fff, inset -2px -2px 0 #888, 2px 2px 0 #333;
       font-family: 'Courier New', monospace;
       text-shadow: 1px 1px 0 #999;
   }
   ```

3. **Character Cards**:
   ```css
   .villain-card .info{
       transform: translateY(100%);
       transition: transform .3s ease-in-out
   }
   .villain-card:hover .info{
       transform: translateY(0)
   }
   ```

## JavaScript Functionality

### Event Handling

The site uses event delegation for efficient event handling:
```javascript
document.addEventListener('click', (e) => {
    if (e.target.id === 'seeMoreBtn') {
        showAllCharacters = true;
        renderCharacters();
    }
    if (e.target.id === 'seeMoreEpisodesBtn') {
        showAllEpisodes = true;
        renderEpisodes();
    }
});
```

### Dynamic Content Loading

Content is loaded dynamically to improve performance:
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id === 'characters') {
            loadCharacters();
            observer.unobserve(entry.target);
        }
    });
});
```

### Search and Filtering

Multiple search implementations for different content types:
```javascript
characterSearch.addEventListener('input', renderCharacters);
episodeSearch.addEventListener('input', renderEpisodes);
seasonFilter.addEventListener('change', renderEpisodes);
```

## Progressive Web App (PWA)

The site is configured as a PWA with:

### Manifest Configuration (manifest.json)
```json
{
  "name": "Courage Fan Page",
  "short_name": "Courage",
  "description": "Personal fan page",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "logo.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker (sw.js)

The service worker handles:
- Caching of static assets
- Offline functionality
- Background sync
- Push notifications

### Installation Script (pwa-install.js)

Handles the PWA installation process with custom UI prompts.

## Performance Optimization

### Lazy Loading

Images use the `loading="lazy"` attribute:
```html
<img src="../assets/recipeBookBg.jpg" alt="Bagge Farmhouse" class="farmhouse-image" loading="lazy">
```

### Intersection Observer

Used for lazy loading content when it enters the viewport:
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Load content
        }
    });
});
```

### Efficient DOM Updates

Batch DOM updates to minimize reflows:
```javascript
function renderCharacters() {
    // Prepare all HTML in a string
    const html = displayChars.map(char => `
        <tr class="border-b border-gray-600 hover:bg-gray-700 text-white">
            <td class="p-4 font-bold">${char.name}</td>
            <td class="p-4">${char.role}</td>
            <td class="p-4">${char.appearance}</td>
            <td class="p-4">${char.behavior}</td>
        </tr>
    `).join('');
    
    // Single DOM update
    charactersTableBody.innerHTML = html;
}
```

## Extending the Project

### Adding New Pages

1. Create a new HTML file in the root directory
2. Include the common header and footer
3. Link to the new page from the navigation menu
4. Add appropriate JavaScript functionality

### Adding New Data

1. Create or update CSV files in the CSV directory
2. Follow the existing format for consistency
3. Implement loading and rendering functions
4. Update the UI to display the new data

### Creating New Features

1. **New Interactive Elements**:
   - Add JavaScript functionality in modular functions
   - Use event delegation for performance
   - Follow existing patterns for consistency

2. **New Visual Components**:
   - Add CSS classes following the existing naming conventions
   - Ensure responsive design with media queries
   - Maintain the pixel art aesthetic where appropriate

## Troubleshooting

### Common Issues

1. **Images Not Loading**:
   - Check file paths and case sensitivity
   - Verify image formats are supported
   - Check browser console for 404 errors

2. **JavaScript Errors**:
   - Check browser console for specific error messages
   - Verify all required files are loaded in the correct order
   - Test functionality in multiple browsers

3. **CSV Data Loading Issues**:
   - Ensure CSV files are properly formatted with consistent delimiters
   - Check for special characters that might need escaping
   - Verify the fetch requests are working correctly

4. **Responsive Design Problems**:
   - Test on multiple device sizes
   - Check media query breakpoints
   - Use browser developer tools to identify specific issues

### Debugging Tips

1. Use `console.log()` to trace data flow and function execution
2. Check browser network tab to verify resource loading
3. Test in multiple browsers to identify browser-specific issues
4. Use browser developer tools to inspect DOM elements and CSS

---

## Contributing

When contributing to this project, please follow these guidelines:

1. Follow the existing code style and naming conventions
2. Test all changes thoroughly before submitting
3. Document new functions and components
4. Update this developer guide when adding significant features

---

*This developer guide was last updated on [Current Date]*