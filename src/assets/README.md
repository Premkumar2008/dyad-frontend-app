# Assets Folder

This folder contains all static assets used throughout the application.

## Folder Structure

```
├── public/              # Static assets served directly (Vite)
│   ├── videos/         # Video files for direct serving
│   ├── images/         # Static images for direct serving
│   └── icons/          # Icon files for direct serving
└── src/
    └── assets/         # Assets imported via modules
        ├── images/     # Images imported in components
        ├── videos/     # Videos imported in components
        ├── icons/      # Icons imported in components
        └── README.md   # This documentation file
```

## Usage Guidelines

### Public Folder (Recommended for Videos/Large Assets)
- Place videos and large images in `public/videos/` and `public/images/`
- These are served directly from the root URL
- Use absolute paths: `/videos/filename.mp4`

### Src Assets (For Component Imports)
- Use `src/assets/` for assets imported as modules
- Good for images used in components with bundling optimization

## Import Examples

### Public Assets (Recommended for videos)
```tsx
// In JSX - use absolute path from public folder
<video>
  <source src="/videos/dyad-bannervideo.mp4" type="video/mp4" />
</video>

<img src="/images/hero-banner.jpg" alt="Hero" />
```

### Imported Assets (For component images)
```tsx
// Import at top of component
import heroImage from '../assets/images/healthcare-professional.jpg';
import ChevronIcon from '../assets/icons/chevron-right.svg';

// Use in JSX
<img src={heroImage} alt="Healthcare Professional" />
```

## File Naming Conventions

- Use kebab-case for all filenames
- Be descriptive but concise
- Include dimensions or purpose if helpful
  - `dyad-bannervideo.mp4`
  - `hero-banner-1920x1080.jpg`
  - `logo-horizontal.svg`
  - `icon-check-circle.svg`

## Optimization Tips

1. **Videos**: Store in `public/videos/` for direct serving
2. **Images**: Use `public/images/` for large images, `src/assets/images/` for component-specific ones
3. **Icons**: Use SVG format for scalability
4. **Formats**: Choose modern formats (WebP for images, WebM for videos) when possible

## Current Assets

### Public Videos
- `dyad-bannervideo.mp4` - Main banner video

### Src Assets
- Healthcare professional images for hero sections
- Background images for various sections
- Logo and branding assets
- Navigation and UI icons
