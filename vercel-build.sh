#!/bin/bash

# Set environment variables to disable checks
export NEXT_DISABLE_ESLINT=true
export NEXT_DISABLE_TYPECHECK=true

# Run the custom build script
node build.js
