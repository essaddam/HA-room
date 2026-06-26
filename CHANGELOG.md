# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.48.3] - 2026-06-26

### Changed
- Visual refresh of the card: softer shadows, refined borders, glassmorphism backdrop, improved typography and button/chip styling.
- Sections (chips and buttons) can now be hidden automatically when they have no configured entities via the `hide_empty_sections` feature flag.
- Added individual `hide_*` feature flags for chips and each button (lights, plugs, covers, audio, video, cameras).
- Button grid now adapts its column count to the number of visible buttons.
- Updated card editor and JSON schema with the new feature flags.
- Bumped version to 1.47.14.

## [v1.48.3] - 2026-06-26

### Fixed
- Fixed click propagation issue where tapping internal chips/buttons also triggered the card-level action (`tap_action`) and caused unwanted navigation.

### Changed
- Introduced `card_tap_action` as the preferred configuration key for card-level tap actions. The legacy `tap_action` key is still supported for backwards compatibility but logs a deprecation warning.
- Card-level action is now handled through a background overlay so clicks on chips, buttons and other interactive children never leak to the card action.
- Updated card editor and JSON schema to expose `card_tap_action`.
- Bumped version to 1.47.13 to invalidate HACS/browser caches.

## [v1.48.3] - 2024-12-07

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

## [Unreleased]

### Planned
- [ ] More animation options
- [ ] Additional sensor types support
- [ ] Theme integration
- [ ] Multi-language support
- [ ] Advanced scheduling features
- [ ] Energy consumption history
- [ ] Voice control integration
- [ ] Scene management
- [ ] Automation triggers