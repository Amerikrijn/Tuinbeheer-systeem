#!/usr/bin/env node

/**
 * Script to automatically add missing test IDs to UI components
 * This helps fix failing tests that are looking for data-testid attributes
 */

const fs = require('fs');
const path = require('path');

// Components that need test IDs added
const componentsToFix = [
  {
    file: 'components/ui/toast.tsx',
    testIds: {
      'Toast': 'toast-root',
      'ToastTitle': 'toast-title',
      'ToastDescription': 'toast-description',
      'ToastAction': 'toast-action',
      'ToastClose': 'toast-close'
    }
  },
  {
    file: 'components/ui/tooltip.tsx',
    testIds: {
      'TooltipProvider': 'tooltip-provider',
      'Tooltip': 'tooltip-root',
      'TooltipTrigger': 'tooltip-trigger',
      'TooltipContent': 'tooltip-content'
    }
  },
  {
    file: 'components/ui/alert-dialog.tsx',
    testIds: {
      'AlertDialog': 'alert-dialog-root',
      'AlertDialogTrigger': 'alert-dialog-trigger',
      'AlertDialogContent': 'alert-dialog-content',
      'AlertDialogHeader': 'alert-dialog-header',
      'AlertDialogFooter': 'alert-dialog-footer',
      'AlertDialogTitle': 'alert-dialog-title',
      'AlertDialogDescription': 'alert-dialog-description',
      'AlertDialogAction': 'alert-dialog-action',
      'AlertDialogCancel': 'alert-dialog-cancel'
    }
  },
  {
    file: 'components/ui/dropdown-menu.tsx',
    testIds: {
      'DropdownMenu': 'dropdown-menu-root',
      'DropdownMenuTrigger': 'dropdown-menu-trigger',
      'DropdownMenuContent': 'dropdown-menu-content',
      'DropdownMenuItem': 'dropdown-menu-item',
      'DropdownMenuLabel': 'dropdown-menu-label',
      'DropdownMenuSeparator': 'dropdown-menu-separator'
    }
  }
];

function addTestIdsToComponent(filePath, testIds) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  Object.entries(testIds).forEach(([componentName, testId]) => {
    // Look for component definitions
    const patterns = [
      // ForwardRef pattern
      new RegExp(`(const\\s+${componentName}\\s*=\\s*React\\.forwardRef<[^>]*>\\s*\\(\\s*[^)]*\\s*,\\s*ref\\s*\\)\\s*=>\\s*\\()`, 'g'),
      // Function component pattern
      new RegExp(`(const\\s+${componentName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\()`, 'g'),
      // Arrow function pattern
      new RegExp(`(const\\s+${componentName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\()`, 'g')
    ];

    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        // Add data-testid attribute
        const replacement = `$1data-testid="${testId}" `;
        content = content.replace(pattern, replacement);
        modified = true;
        console.log(`✅ Added test ID "${testId}" to ${componentName}`);
      }
    });
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📝 Updated: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for: ${filePath}`);
  }
}

function main() {
  console.log('🔧 Fixing missing test IDs in UI components...\n');

  componentsToFix.forEach(({ file, testIds }) => {
    const filePath = path.join(process.cwd(), file);
    console.log(`Processing: ${file}`);
    addTestIdsToComponent(filePath, testIds);
    console.log('');
  });

  console.log('✨ Test ID fixes completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run tests to verify fixes: npm run test:ci');
  console.log('2. Check if any components still need manual test ID additions');
  console.log('3. Update test files if they expect different test ID names');
}

if (require.main === module) {
  main();
}

module.exports = { addTestIdsToComponent };