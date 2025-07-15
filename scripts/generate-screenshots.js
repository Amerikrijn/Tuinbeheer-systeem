#!/usr/bin/env node

/**
 * Generate placeholder screenshots for documentation
 * 
 * This script creates placeholder images that can be replaced with actual screenshots
 * 
 * Usage: node scripts/generate-screenshots.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');
const PLACEHOLDER_COLOR = '#f3f4f6';
const TEXT_COLOR = '#374151';
const BORDER_COLOR = '#d1d5db';

// Screenshot definitions
const screenshots = [
  {
    name: 'dashboard-overview.png',
    width: 1200,
    height: 800,
    title: 'Dashboard Overview',
    description: 'Main dashboard with garden summary, recent activity, and quick actions'
  },
  {
    name: 'dashboard-main.png',
    width: 1200,
    height: 800,
    title: 'Dashboard Main View',
    description: 'Complete dashboard layout with navigation and content areas'
  },
  {
    name: 'garden-overview.png',
    width: 1200,
    height: 800,
    title: 'Garden Overview',
    description: 'Garden list and management interface'
  },
  {
    name: 'garden-creation.png',
    width: 800,
    height: 600,
    title: 'Garden Creation Form',
    description: 'New garden creation form with all configuration options'
  },
  {
    name: 'garden-edit.png',
    width: 800,
    height: 600,
    title: 'Garden Edit Interface',
    description: 'Edit garden properties and settings'
  },
  {
    name: 'plant-bed-creation.png',
    width: 900,
    height: 700,
    title: 'Plant Bed Creation',
    description: 'Create new plant bed with dimensions and properties'
  },
  {
    name: 'plant-bed-list.png',
    width: 1200,
    height: 800,
    title: 'Plant Bed List',
    description: 'Overview of all plant beds with status and actions'
  },
  {
    name: 'plant-bed-detail.png',
    width: 1000,
    height: 800,
    title: 'Plant Bed Detail View',
    description: 'Detailed view of a single plant bed with plants and analytics'
  },
  {
    name: 'visual-designer.png',
    width: 1400,
    height: 900,
    title: 'Visual Garden Designer',
    description: 'Canvas-based garden layout designer with drag-and-drop functionality'
  },
  {
    name: 'visual-designer-interface.png',
    width: 1400,
    height: 900,
    title: 'Visual Designer Interface',
    description: 'Complete interface with toolbar, canvas, and property panels'
  },
  {
    name: 'moving-plant-beds.png',
    width: 1200,
    height: 800,
    title: 'Moving Plant Beds',
    description: 'Drag and drop plant beds in the visual designer'
  },
  {
    name: 'resizing-plant-beds.png',
    width: 1200,
    height: 800,
    title: 'Resizing Plant Beds',
    description: 'Resize plant beds with handles and precision controls'
  },
  {
    name: 'adding-plant-beds.png',
    width: 1200,
    height: 800,
    title: 'Adding Plant Beds',
    description: 'Add new plant beds to the garden layout'
  },
  {
    name: 'plant-management.png',
    width: 1000,
    height: 800,
    title: 'Plant Management',
    description: 'Plant list and management interface'
  },
  {
    name: 'adding-plants.png',
    width: 800,
    height: 600,
    title: 'Adding Plants',
    description: 'Add new plants to plant beds with detailed information'
  },
  {
    name: 'plant-search.png',
    width: 900,
    height: 700,
    title: 'Plant Search',
    description: 'Search and filter plants from the Dutch plant database'
  },
  {
    name: 'plant-status.png',
    width: 800,
    height: 600,
    title: 'Plant Status Updates',
    description: 'Update plant status and growth measurements'
  },
  {
    name: 'plant-photos.png',
    width: 1000,
    height: 700,
    title: 'Plant Photo Management',
    description: 'Upload and manage plant photos with organization features'
  },
  {
    name: 'mobile-interface.png',
    width: 375,
    height: 812,
    title: 'Mobile Interface',
    description: 'Mobile-responsive interface for on-site garden management'
  }
];

// Create placeholder SVG
function createPlaceholderSVG(screenshot) {
  const svg = `
<svg width="${screenshot.width}" height="${screenshot.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100%" height="100%" fill="${PLACEHOLDER_COLOR}" stroke="${BORDER_COLOR}" stroke-width="2"/>
  
  <!-- Mock UI Elements -->
  <rect x="20" y="20" width="200" height="40" fill="${BORDER_COLOR}" rx="4"/>
  <rect x="240" y="20" width="120" height="40" fill="${BORDER_COLOR}" rx="4"/>
  <rect x="${screenshot.width - 140}" y="20" width="120" height="40" fill="${BORDER_COLOR}" rx="4"/>
  
  <!-- Mock Content Area -->
  <rect x="20" y="80" width="${screenshot.width - 40}" height="${screenshot.height - 160}" fill="white" stroke="${BORDER_COLOR}" stroke-width="1" rx="8"/>
  
  <!-- Mock Cards/Elements -->
  <rect x="40" y="100" width="200" height="120" fill="${PLACEHOLDER_COLOR}" stroke="${BORDER_COLOR}" stroke-width="1" rx="4"/>
  <rect x="260" y="100" width="200" height="120" fill="${PLACEHOLDER_COLOR}" stroke="${BORDER_COLOR}" stroke-width="1" rx="4"/>
  <rect x="480" y="100" width="200" height="120" fill="${PLACEHOLDER_COLOR}" stroke="${BORDER_COLOR}" stroke-width="1" rx="4"/>
  
  <!-- Central Image Icon -->
  <circle cx="${screenshot.width / 2}" cy="${screenshot.height / 2}" r="40" fill="${BORDER_COLOR}"/>
  <text x="${screenshot.width / 2}" y="${screenshot.height / 2 - 30}" text-anchor="middle" fill="${TEXT_COLOR}" font-family="Arial, sans-serif" font-size="32">📸</text>
  
  <!-- Title -->
  <text x="${screenshot.width / 2}" y="${screenshot.height / 2 + 10}" text-anchor="middle" fill="${TEXT_COLOR}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
    ${screenshot.title}
  </text>
  
  <!-- Description -->
  <text x="${screenshot.width / 2}" y="${screenshot.height / 2 + 35}" text-anchor="middle" fill="${TEXT_COLOR}" font-family="Arial, sans-serif" font-size="14">
    ${screenshot.description}
  </text>
  
  <!-- Placeholder Label -->
  <text x="${screenshot.width / 2}" y="${screenshot.height - 30}" text-anchor="middle" fill="${BORDER_COLOR}" font-family="Arial, sans-serif" font-size="12">
    Placeholder - Replace with actual screenshot
  </text>
  
  <!-- Dimensions -->
  <text x="20" y="${screenshot.height - 10}" fill="${BORDER_COLOR}" font-family="Arial, sans-serif" font-size="10">
    ${screenshot.width}x${screenshot.height}
  </text>
</svg>`;
  
  return svg;
}

// Main function
function generateScreenshots() {
  console.log('🖼️  Generating placeholder screenshots...\n');
  
  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log('📁 Created screenshots directory');
  }
  
  // Generate placeholder images
  screenshots.forEach(screenshot => {
    const svg = createPlaceholderSVG(screenshot);
    const filePath = path.join(SCREENSHOTS_DIR, screenshot.name);
    
    // Save as SVG (can be converted to PNG later)
    fs.writeFileSync(filePath.replace('.png', '.svg'), svg);
    console.log(`✅ Generated: ${screenshot.name.replace('.png', '.svg')}`);
  });
  
  // Create README for screenshots
  const readmeContent = `# 📸 Screenshots

This directory contains screenshots for the documentation.

## 📋 Screenshot List

${screenshots.map(screenshot => `### ${screenshot.title}
- **File**: \`${screenshot.name}\`
- **Dimensions**: ${screenshot.width}x${screenshot.height}
- **Description**: ${screenshot.description}
- **Status**: ${fs.existsSync(path.join(SCREENSHOTS_DIR, screenshot.name)) ? '✅ Available' : '🔄 Placeholder'}

![${screenshot.title}](${screenshot.name})
`).join('\n')}

## 🔄 Replacing Placeholders

To replace placeholder screenshots with actual ones:

1. **Take Screenshot**: Use your preferred screenshot tool
2. **Optimize Image**: Compress for web use (recommend <500KB)
3. **Replace File**: Save with the exact filename listed above
4. **Verify**: Check that the image displays correctly in documentation

## 📏 Recommended Specifications

- **Format**: PNG or WebP
- **Quality**: High (80-90% compression)
- **Size**: Keep under 500KB for web performance
- **Dimensions**: Use the specified dimensions for consistency

## 🛠️ Tools for Screenshots

### Browser Screenshots
- **Full Page**: Use browser extensions like "GoFullPage"
- **Responsive**: Use browser dev tools for mobile screenshots
- **Clean**: Hide personal information and use clean test data

### Screen Recording
- **macOS**: Screenshot tool (Cmd+Shift+5)
- **Windows**: Snipping Tool or Windows+Shift+S
- **Linux**: GNOME Screenshot or Spectacle

### Image Editing
- **Optimization**: Use tools like TinyPNG or ImageOptim
- **Annotations**: Add arrows, highlights, or callouts as needed
- **Consistency**: Maintain consistent styling across screenshots

## 🎯 Screenshot Guidelines

1. **Clean Data**: Use meaningful, professional sample data
2. **Consistent UI**: Ensure UI is in the same state across screenshots
3. **Highlight Features**: Focus on the specific feature being documented
4. **Mobile Screenshots**: Use actual mobile devices when possible
5. **Update Regularly**: Keep screenshots current with UI changes

---

*Generated by: scripts/generate-screenshots.js*
*Last updated: ${new Date().toISOString()}*`;

  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'README.md'), readmeContent);
  console.log('✅ Generated: README.md');
  
  console.log('\n🎉 Screenshot generation complete!');
  console.log(`📁 Location: ${SCREENSHOTS_DIR}`);
  console.log(`📊 Generated: ${screenshots.length} placeholder screenshots`);
  console.log('\n📝 Next steps:');
  console.log('1. Replace SVG placeholders with actual PNG screenshots');
  console.log('2. Follow the guidelines in docs/screenshots/README.md');
  console.log('3. Optimize images for web performance');
  console.log('4. Update documentation if needed');
}

// Run the script
if (require.main === module) {
  generateScreenshots();
}

module.exports = { generateScreenshots, screenshots };