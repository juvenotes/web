#!/bin/bash

# Ensure script stops if any command fails
set -e

# Configure npm to use TipTap Pro registry with authentication
echo "@tiptap:registry=https://registry.tiptap.dev" > .npmrc
echo "//registry.tiptap.dev/:_authToken=${TIPTAP_PRO_TOKEN}" >> .npmrc

echo "TipTap Pro authentication setup completed."
