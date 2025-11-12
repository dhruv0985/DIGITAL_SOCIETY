# Quick Start Guide - Interactive Map Version

## 🚀 How to View the Website

### Option 1: Direct Opening (Simplest)
1. Navigate to: `C:\Users\Asus\rajasthan-digital-artifact`
2. Double-click on `index.html`
3. The interactive map will open in your browser!

### Option 2: Using a Local Server (Recommended)
```powershell
cd C:\Users\Asus\rajasthan-digital-artifact
python -m http.server 8000
```
Then open: `http://localhost:8000`

## 🎮 How to Use the Interactive Map

### Basic Navigation
1. **Click on Markers** - Click any pulsing circle on the map to explore that location
2. **View Content** - A panel slides in from the right with detailed information
3. **Close Panel** - Click the X button or press ESC key
4. **Hover Effects** - Move your mouse over markers to see animations

### Interactive Features
- **Animated Markers** - Pulsing circles show baoli locations
- **Water Waves** - Animated water effects on markers
- **Particle Background** - Dynamic particle system
- **Animated Drawing** - Baoli illustration in bottom right corner
- **Floating Icons** - Decorative animated elements

## 🎨 What's New in This Version

### Interactive Map Interface
- **No Scrolling Required** - Everything is accessible via the map
- **Click to Explore** - Each location reveals detailed content
- **Visual Storytelling** - Animated markers and effects
- **Engaging Design** - Modern, creative interface

### Visual Effects
- ✨ Particle system in background
- 🌊 Water wave animations
- 💫 Pulsing location markers
- 🎨 Animated SVG drawings
- 🔄 Smooth transitions
- 💡 Glow effects on hover

### Content Features
- Rich content panels
- Image integration (with fallbacks)
- Statistics display
- Feature cards
- Responsive design

## 🗺️ Map Locations

The map includes 5 baoli locations:
1. **Jaipur** - Ranisar Baoli
2. **Jodhpur** - Toorji Ka Jhalra
3. **Udaipur** - Raniji Ki Baori
4. **Pushkar** - Panna Meena Ka Kund
5. **Jaisalmer** - Bada Bagh Baoli

## 🎯 Customization Tips

### Adding Your Own Images
Replace image URLs in the `locationData` JSON (in `index.html`):
```javascript
"image": "your-image-url-here"
```

### Changing Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #d4a574;
    --secondary-color: #8b6f47;
    --water-color: #4a90e2;
}
```

### Adding New Locations
1. Add marker in SVG map
2. Add location data in JSON
3. Position marker using coordinates

## 💡 Tips for Best Experience

1. **Use Chrome or Firefox** for best performance
2. **Enable JavaScript** (required for interactivity)
3. **Full Screen** - View in full screen for best experience
4. **Explore All Locations** - Click each marker to see different content
5. **Watch Animations** - Observe the particle effects and animations

## 🐛 Troubleshooting

### Map Not Showing?
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser

### Images Not Loading?
- Images will automatically fall back to SVG placeholders
- Check your internet connection
- Replace with local image paths

### Animations Not Working?
- Ensure CSS and JS files are loaded
- Check browser compatibility
- Try refreshing the page

## 🎓 Project Concept

**Topic:** Baolis (Stepwells) of Rajasthan

**Focus:** Interactive map exploring everyday significance of stepwells beyond tourism

**Key Features:**
- Map-based navigation
- Animated illustrations
- Particle effects
- Interactive content panels
- Cultural insights

## 📱 Mobile Experience

The website is fully responsive:
- Touch-friendly markers
- Swipe to close panels
- Optimized for small screens
- All features work on mobile

## 🎨 Next Steps

1. **Add Your Research** - Update content with your findings
2. **Add Real Images** - Replace placeholders with photos
3. **Customize Styling** - Adjust colors and fonts
4. **Add More Locations** - Expand the map with more baolis
5. **Test Thoroughly** - Try on different devices

## 🚀 Performance Tips

- Particle system is optimized for performance
- Images load lazily
- Animations use CSS transforms (GPU accelerated)
- Efficient event handling

## 📞 Support

For issues or questions:
1. Check the main README.md
2. Review browser console for errors
3. Ensure all files are in the same folder
4. Try opening in a different browser

---

**Enjoy exploring Rajasthan's hidden baolis!** 🏛️💧✨