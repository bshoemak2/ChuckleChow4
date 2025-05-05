#!/bin/bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node dependencies and build frontend
cd rg_new_app
npm install
npm run build
cd ..