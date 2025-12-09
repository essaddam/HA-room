# HA Room Card v1.46.1

## [v1.46.1] - 2024-12-07

### Added
- 🎉 Initial release of HA Room Card
- 🏠 Modern design with customizable gradients
- 🌡️ Climate sensors support (temperature, humidity)
- ⚡ Real-time power consumption monitoring
- 👥 Presence detection with animated indicators
- 🚪 Openings management (doors, windows) with alerts
- 💡 Light control with brightness adjustment
- 🔌 Plugs and appliances control with individual monitoring
- 🎵 Media support (audio/video) with album covers
- 📹 Camera support with live preview
- 📱 Responsive design for mobile and desktop
- 🎨 Interactive popups for each category
- 📊 Real-time data updates
- 🔧 TypeScript support for robustness
- 📚 Complete documentation with examples

### Features
- **Main Card**: Central dashboard with all room information
- **Lights Popup**: Individual light control with brightness sliders
- **Plugs Popup**: Power consumption monitoring per device
- **Presence Popup**: Motion/occupancy sensor status with history
- **Openings Popup**: Door/window status with visual alerts
- **Customizable**: Colors, icons, gradients, and layout options
- **Actions**: Tap, hold, and double-tap actions support
- **Navigation**: Hash-based navigation to different sections

### Technical
- Built with Lit Element for modern web components
- TypeScript for type safety
- Optimized build with Rollup
- ESLint configuration for code quality
- HACS ready configuration
- Semantic HTML5 structure
- CSS animations and transitions
- Mobile-first responsive design

### Configuration
- Simple YAML configuration
- Support for multiple entity types
- Customizable colors and gradients
- Flexible entity lists
- Optional features and sections
- Action handlers for interactivity


## 📦 Installation

### HACS Installation
1. Go to HACS > Integrations
2. Click the 3 dots in the top right corner
3. Select "Custom repositories"
4. Add repository: `essaddam/HA-room`
5. Category: "Dashboard"
6. Click "Add"
7. Go to HACS > Integrations > "Dashboard" and click "Explore & Download Repositories"
8. Search for "HA Room Card" and install

### Manual Installation
1. Download the latest release from the [releases page](https://github.com/essaddam/HA-room/releases)
2. Copy the files to `config/www/community/ha-room-card/`
3. Add the resource to your `configuration.yaml`:
```yaml
resources:
  - url: /local/community/ha-room-card/ha-room-card.js
    type: module
```

## 🐛 Debug Information

This version includes enhanced logging for troubleshooting:
- Console logs for card registration
- Configuration validation logs
- Entity state update logs
- Editor form generation logs

Check your browser console for detailed information if you encounter issues.

---

🤖 Auto-generated release from commit: c592dda8def415da38fcdbd980ee72ec6e2d6b20