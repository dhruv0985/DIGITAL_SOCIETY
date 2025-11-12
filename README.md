# Traditional Crafts of Rajasthan: Artisan Stories

An interactive, map-based digital artifact exploring the traditional crafts and artisans of Rajasthan. This creative website features animated illustrations, particle effects, and an engaging map interface that tells the story of how these crafts continue to shape local culture and provide livelihoods for communities across the state.

## 🎨 Project Overview

While Rajasthan is a major tourist destination, many aspects of local culture, practices, and everyday life remain underrepresented. This project focuses on **traditional crafts and artisans** - the skilled craftspeople who create everything from pottery to textiles, preserving techniques passed down through generations.

### Key Features

- **🗺️ Interactive Map Navigation** - Click on 18 craft locations across Rajasthan
- **✨ Animated SVG Drawings** - Beautiful animated illustrations of crafts
- **🌟 Particle Effects** - Dynamic particle system in the background
- **💫 Smooth Animations** - Fluid transitions without marker movement
- **📱 Responsive Design** - Works beautifully on all devices
- **🖼️ Image Integration** - Real images with elegant fallback placeholders
- **🎯 Stable Markers** - Markers stay in place (no unwanted movement)
- **📊 Dynamic Content Panels** - Slide-in panels with rich content

## 🚀 Technology Stack

- **HTML5** - Semantic structure with SVG illustrations
- **CSS3** - Advanced animations and effects
- **JavaScript (ES6+)** - Interactive features and particle system
- **No Dependencies** - Pure vanilla JS for fast loading

## 📦 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - works directly from file system!

### Installation

1. Navigate to the project folder:
   ```bash
   cd C:\Users\Asus\rajasthan-digital-artifact
   ```

2. Open `index.html` in your web browser
   - Simply double-click the file, or
   - Right-click → Open with → Your browser

3. (Optional) For development with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```
   Then navigate to `http://localhost:8000`

## 🎮 How to Use

1. **Explore the Map** - Click on any location marker (pulsing circles) on the map
2. **View Details** - A panel slides in from the right with information about that craft
3. **Interact** - Hover over markers to see animations and effects
4. **Close Panel** - Click the X button or press ESC to close the content panel
5. **Enjoy Animations** - Watch the animated craft illustration in the bottom right corner

## 📁 Project Structure

```
rajasthan-digital-artifact/
├── index.html          # Main HTML with SVG map and structure
├── styles.css          # All styling, animations, and effects
├── script.js           # Interactive functionality and particle system
├── README.md           # Project documentation
└── QUICKSTART.md       # Quick start guide
```

## 🎨 Craft Locations (18 Locations)

### Textiles & Fabrics
1. **Bagru** - Block Printing
2. **Sanganer** - Block Printing
3. **Sikar** - Bandhani (Tie-Dye)
4. **Barmer** - Embroidery

### Pottery & Clay
5. **Jaipur** - Blue Pottery
6. **Molela** - Terracotta

### Leather & Accessories
7. **Jodhpur** - Leather Work
8. **Bikaner** - Camel Leather

### Painting & Art
9. **Kishangarh** - Miniature Painting
10. **Nathdwara** - Pichwai Paintings
11. **Shahpura** - Phad Paintings

### Metal & Stone
12. **Alwar** - Metal Work
13. **Makrana** - Marble Work
14. **Jaisalmer** - Stone Carving
15. **Dungarpur** - Stone Carving

### Wood & Other Crafts
16. **Shekhawati** - Wood Carving
17. **Udaipur** - Puppet Making
18. **Pushkar** - Silver Jewelry

## 🎯 Customization

### Changing Locations
Edit the `locationData` JSON in `index.html`:
```json
{
    "location-name": {
        "title": "Location Title",
        "craft": "Craft Type",
        "image": "image-url",
        "content": "HTML content",
        "stats": {"key": "value"}
    }
}
```

### Adding New Markers
1. Add a new `<g class="craft-marker">` in the SVG
2. Set `data-location` attribute
3. Position using coordinates in the SVG
4. Add corresponding data in `locationData` JSON

### Styling
- Colors: Edit CSS variables in `:root` in `styles.css`
- Fonts: Change Google Fonts import in `index.html`
- Animations: Modify keyframe animations in `styles.css`
- Particles: Adjust particle count in `script.js`

### Adding Images
Replace image URLs in `locationData` with your own images. The system automatically falls back to SVG placeholders if images fail to load.

## 🌟 Key Improvements

### Fixed Marker Movement
- Markers now stay in place when clicked
- Only visual effects (glow, color) change
- No unwanted shifting or scaling
- Smooth, stable interactions

### More Locations
- Expanded from 5 to 18 locations
- Covers diverse crafts across Rajasthan
- More comprehensive content
- Better representation of state's crafts

### Better Theme
- Traditional crafts are more accessible
- More content potential
- Underrepresented aspect of culture
- Everyday practices and livelihoods

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🎓 Why Traditional Crafts?

Traditional crafts in Rajasthan are:
- **Underrepresented** - Tourists see products but not the craft process
- **Everyday Life** - Crafts are part of daily life for artisans
- **Cultural Heritage** - Techniques passed down through generations
- **Livelihoods** - Many families depend on these crafts
- **Stories** - Each craft has unique stories and traditions

## 🚀 Future Enhancements

- [ ] Add audio narrations from artisans
- [ ] Implement 360-degree virtual tours of workshops
- [ ] Add more interactive elements
- [ ] Create downloadable resources
- [ ] Add multilingual support
- [ ] Include links to support artisans
- [ ] Add search functionality
- [ ] Implement filters for craft types
- [ ] Add timeline view
- [ ] Create comparison mode

## 📝 Notes

- Replace placeholder content with your research findings
- Add actual photographs from craft workshops
- Include interviews with artisans
- Customize colors and styling to match your theme
- Test on multiple devices and browsers
- Consider adding video content of crafts being made

## 🏆 Credits

This project is created as a digital artifact for exploring underrepresented aspects of Rajasthan's culture and practices, specifically focusing on traditional crafts and the artisans who create them.

## 📄 License

This project is created for educational purposes.

---

**Enjoy exploring the traditional crafts of Rajasthan!** 🎨✨🏺