#!/usr/bin/env python3
import os
import socket
import subprocess
import sys
import time
import webbrowser
import shutil
from pathlib import Path

SERVER_PORT = 8000
ROOT_DIR = Path(__file__).resolve().parent
CLIENT_DIR = ROOT_DIR / "client"
SERVER_DIR = ROOT_DIR / "server"

def check_requirements():
    """Check if required commands are available"""
    requirements_met = True
    
    # Check if npm is available
    if not shutil.which("npm"):
        print("❌ npm not found. Please install Node.js and npm.")
        requirements_met = False
    
    # Check if uvicorn is available
    if not shutil.which("uvicorn"):
        print("❌ uvicorn not found. Please install it with: pip install uvicorn")
        requirements_met = False
    
    # Check if client and server directories exist
    if not CLIENT_DIR.exists():
        print(f"❌ Client directory not found at {CLIENT_DIR}")
        requirements_met = False
    
    if not SERVER_DIR.exists():
        print(f"❌ Server directory not found at {SERVER_DIR}")
        requirements_met = False
    
    return requirements_met

def is_port_in_use(port):
    """Check if port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting server...")
    os.chdir(SERVER_DIR)
    
    try:
        # Start server as a subprocess
        server_process = subprocess.Popen(
            ["uvicorn", "main:app", "--reload"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        # Wait for server to start
        for i in range(10):  # Try 10 times
            if is_port_in_use(SERVER_PORT):
                print(f"✅ Server running on http://localhost:{SERVER_PORT}")
                break
            print(f"⏳ Waiting for server to start ({i+1}/10)...")
            time.sleep(1)
        
        os.chdir(ROOT_DIR)
        return server_process
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        os.chdir(ROOT_DIR)
        sys.exit(1)

def start_client():
    """Build and watch the client"""
    print("🔨 Building and watching client...")
    os.chdir(CLIENT_DIR)
    
    try:
        # Start npm watch as a subprocess
        client_process = subprocess.Popen(
            ["npm", "run", "watch"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        print("✅ Client build started")
        os.chdir(ROOT_DIR)
        return client_process
    except Exception as e:
        print(f"❌ Error starting client build: {e}")
        os.chdir(ROOT_DIR)
        sys.exit(1)

def main():
    print("📧 Starting Email Summarizer...")
    
    # Check if requirements are met
    if not check_requirements():
        print("\n❌ Please install the missing requirements and try again.")
        sys.exit(1)
    
    processes = []
    
    # Start server if not running
    if not is_port_in_use(SERVER_PORT):
        server_process = start_server()
        processes.append(server_process)
    else:
        print(f"ℹ️ Server already running on port {SERVER_PORT}")
    
    # Start client
    client_process = start_client()
    processes.append(client_process)
    
    # Open Chrome extension page for convenience
    try:
        print("🌐 Opening Chrome extensions page...")
        webbrowser.open('chrome://extensions/')
    except:
        print("ℹ️ Please open Chrome and go to chrome://extensions/ to load the extension")
    
    print("\n⚠️ Press Ctrl+C to stop all processes\n")
    
    try:
        # Print output from processes
        while True:
            for process in processes:
                if process.poll() is not None:
                    print(f"❌ A process has terminated unexpectedly")
                    break
                
                output = process.stdout.readline()
                if output:
                    print(output.strip())
            
            # Check if any process has terminated
            if any(process.poll() is not None for process in processes):
                break
                
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n⏹️ Stopping all processes...")
    finally:
        # Terminate all processes
        for process in processes:
            if process.poll() is None:  # If process is still running
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        
        print("✅ All processes stopped. Goodbye!")
    
if __name__ == "__main__":
    main() 