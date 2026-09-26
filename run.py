#!/usr/bin/env python3
"""
StudyVerse — Local Application Launcher
Detects runtime, installs missing dependencies when required, starts the server,
automatically opens the default web browser, and handles graceful shutdown.
"""

import os
import sys
import time
import socket
import shutil
import subprocess
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
PACKAGE_JSON = ROOT_DIR / "package.json"
NODE_MODULES = ROOT_DIR / "node_modules"
SERVER_JS = ROOT_DIR / "server.js"
PORT = int(os.environ.get("PORT", 3000))
URL = f"http://localhost:{PORT}"


def check_runtime():
    """Verify Node.js and npm are installed and available in PATH."""
    node_path = shutil.which("node")
    npm_path = shutil.which("npm")

    if not node_path:
        print("\n[ERROR] Node.js is not found in your PATH.")
        print("Please install Node.js (v18 or newer) from https://nodejs.org/ to run StudyVerse.\n")
        sys.exit(1)

    if not npm_path:
        print("\n[ERROR] npm is not found in your PATH.")
        print("Please ensure npm is installed along with Node.js.\n")
        sys.exit(1)

    try:
        node_ver = subprocess.check_output([node_path, "-v"], text=True).strip()
        print(f"✓ Detected Node.js runtime: {node_ver}")
    except Exception as e:
        print(f"[WARN] Could not check Node.js version: {e}")


def ensure_dependencies():
    """Install dependencies only if node_modules is missing or package.json is newer."""
    should_install = False

    if not NODE_MODULES.exists():
        should_install = True
        print("ℹ Dependencies not yet installed. Running 'npm install'...")
    elif PACKAGE_JSON.exists() and PACKAGE_JSON.stat().st_mtime > NODE_MODULES.stat().st_mtime:
        should_install = True
        print("ℹ package.json was modified. Updating dependencies with 'npm install'...")

    if should_install:
        npm_path = shutil.which("npm") or "npm"
        try:
            res = subprocess.run([npm_path, "install"], cwd=ROOT_DIR, check=True)
            print("✓ Dependencies installed successfully.\n")
        except subprocess.CalledProcessError as e:
            print(f"\n[ERROR] 'npm install' failed with exit code {e.returncode}.")
            sys.exit(e.returncode)


def is_port_in_use(port):
    """Check if the target port is already open."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def wait_for_server(port, timeout=15):
    """Wait until the server starts accepting TCP connections."""
    start = time.time()
    while time.time() - start < timeout:
        if is_port_in_use(port):
            return True
        time.sleep(0.2)
    return False


def main():
    print("=" * 60)
    print("  STUDYVERSE — SPACE-INSPIRED STUDENT WORKSPACE")
    print("=" * 60)

    check_runtime()
    ensure_dependencies()

    if not SERVER_JS.exists():
        print(f"\n[ERROR] server.js not found in {ROOT_DIR}\n")
        sys.exit(1)

    node_path = shutil.which("node") or "node"
    env = os.environ.copy()
    env["PORT"] = str(PORT)

    print(f"🚀 Starting StudyVerse server on {URL} ...")
    proc = subprocess.Popen([node_path, str(SERVER_JS)], cwd=ROOT_DIR, env=env)

    try:
        if wait_for_server(PORT, timeout=12):
            print(f"✓ Server is live! Opening {URL} in your default browser...")
            webbrowser.open(URL)
            print("\n------------------------------------------------------------")
            print(f"  StudyVerse is running at: {URL}")
            print("  Press Ctrl+C at any time to safely stop the server.")
            print("------------------------------------------------------------\n")
        else:
            print(f"[WARN] Server launched, but port {PORT} did not respond within timeout.")
            print(f"You can try opening {URL} manually in your browser.\n")

        # Keep parent process running until interrupted
        proc.wait()
    except KeyboardInterrupt:
        print("\n\nStopping StudyVerse server gracefully...")
    finally:
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
        print("✓ StudyVerse server stopped. Goodbye!")


if __name__ == "__main__":
    main()
