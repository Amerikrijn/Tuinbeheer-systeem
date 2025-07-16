#!/bin/bash

# ===================================================================
# SUPABASE CLI INSTALLATION SCRIPT
# ===================================================================
# This script installs the Supabase CLI using the official method
# ===================================================================

echo "🔧 Installing Supabase CLI..."

# Check if we're on Linux
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📦 Installing for Linux..."
    
    # Download and install Supabase CLI
    curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o supabase.tar.gz
    
    # Extract the binary
    tar -xzf supabase.tar.gz
    
    # Move to a directory in PATH
    if [ -f "./supabase" ]; then
        sudo mv supabase /usr/local/bin/
        echo "✅ Supabase CLI installed successfully!"
    else
        echo "❌ Failed to extract Supabase CLI"
        exit 1
    fi
    
    # Clean up
    rm supabase.tar.gz
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 Installing for macOS..."
    
    # For macOS, use Homebrew if available
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
        echo "✅ Supabase CLI installed via Homebrew!"
    else
        echo "❌ Homebrew not found. Please install Homebrew first: https://brew.sh"
        exit 1
    fi
    
else
    echo "❌ Unsupported operating system: $OSTYPE"
    echo "Please install manually: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Verify installation
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI is now available!"
    supabase --version
else
    echo "❌ Installation failed. Please install manually: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo ""
echo "🎉 Supabase CLI installation completed!"
echo "You can now run: ./run-all-scripts.sh"