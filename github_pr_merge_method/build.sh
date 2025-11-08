#!/bin/bash
# Build script for GitHub PR Merge Method extension
# Creates separate packages for Chrome Web Store and Firefox Add-ons

set -e

VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
EXTENSION_NAME="github-pr-merge-method"
BUILD_DIR="build"
DIST_DIR="dist"

echo "Building ${EXTENSION_NAME} v${VERSION}..."

# Clean previous builds
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# Files to include in both builds
FILES=(
  "background.js"
  "constants.js"
  "content_utils.js"
  "content.js"
  "debug.js"
  "popup.css"
  "popup.html"
  "popup.js"
  "rules_utils.js"
  "storage.js"
  "templates.js"
  "icons"
)

echo ""
echo "=== Building Chrome version ==="

# Create Chrome build directory
CHROME_BUILD="$BUILD_DIR/chrome"
mkdir -p "$CHROME_BUILD"

# Copy files for Chrome
for file in "${FILES[@]}"; do
  if [ -d "$file" ]; then
    cp -r "$file" "$CHROME_BUILD/"
  else
    cp "$file" "$CHROME_BUILD/"
  fi
done

# Copy Chrome manifest
cp manifest.json "$CHROME_BUILD/"

# Create Chrome zip
CHROME_ZIP="$DIST_DIR/${EXTENSION_NAME}-v${VERSION}-chrome.zip"
cd "$CHROME_BUILD"
zip -r "../../$CHROME_ZIP" . -x "*.DS_Store"
cd ../..

echo "✓ Chrome package created: $CHROME_ZIP"

echo ""
echo "=== Building Firefox version ==="

# Create Firefox build directory
FIREFOX_BUILD="$BUILD_DIR/firefox"
mkdir -p "$FIREFOX_BUILD"

# Copy files for Firefox
for file in "${FILES[@]}"; do
  if [ -d "$file" ]; then
    cp -r "$file" "$FIREFOX_BUILD/"
  else
    cp "$file" "$FIREFOX_BUILD/"
  fi
done

# Copy Firefox manifest
cp manifest.firefox.json "$FIREFOX_BUILD/manifest.json"

# Create Firefox zip
FIREFOX_ZIP="$DIST_DIR/${EXTENSION_NAME}-v${VERSION}-firefox.zip"
cd "$FIREFOX_BUILD"
zip -r "../../$FIREFOX_ZIP" . -x "*.DS_Store"
cd ../..

echo "✓ Firefox package created: $FIREFOX_ZIP"

echo ""
echo "=== Build Summary ==="
echo "Version: $VERSION"
echo "Chrome:  $CHROME_ZIP ($(du -h "$CHROME_ZIP" | cut -f1))"
echo "Firefox: $FIREFOX_ZIP ($(du -h "$FIREFOX_ZIP" | cut -f1))"
echo ""
echo "✓ Build complete!"

