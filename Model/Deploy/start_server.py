#!/usr/bin/env python3
"""
Startup script for the ML API server
"""
import os
import sys
import uvicorn

# Change to the directory containing this script
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# Add the current directory to Python path
sys.path.insert(0, script_dir)

print(f"Working directory: {os.getcwd()}")
print(f"Python path includes: {script_dir}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=True)
