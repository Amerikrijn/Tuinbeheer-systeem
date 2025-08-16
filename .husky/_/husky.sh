#!/usr/bin/env sh
# husky shell helper
if [ "${HUSKY_SKIP_INIT:-}" = "1" ]; then
  exit 0
fi

# load nvm or other shell environments if available
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
fi
