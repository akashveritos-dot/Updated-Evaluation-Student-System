#!/usr/bin/env python3
"""
Complete System Startup Script
Starts Django server
"""

import subprocess
import sys
import os
import time
import signal
import threading
from pathlib import Path

class SystemManager:
    def __init__(self):
        self.processes = []
        self.project_dir = Path(__file__).parent
        self.running = True
        
    
    
    def start_django_server(self):
        """Start the Django development server"""
        print("🌐 Starting Django Server...")
        
        try:
            process = subprocess.Popen(
                [sys.executable, "manage.py", "runserver", "127.0.0.1:8000"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                cwd=str(self.project_dir)
            )
            
            self.processes.append(("Django Server", process))
            print("✅ Django Server started successfully")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Django Server: {e}")
            return False
    
    def monitor_services(self):
        """Monitor all running services"""
        while self.running:
            time.sleep(2)
            
            for name, process in self.processes:
                if process.poll() is not None:
                    print(f"⚠️  {name} has stopped!")
                    self.running = False
                    break
    
    def stop_all_services(self):
        """Stop all running services gracefully"""
        print("\n⚠️  Stopping all services...")
        
        for name, process in self.processes:
            if process.poll() is None:
                try:
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                        print(f"✅ {name} stopped gracefully")
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait()
                        print(f"⚠️  {name} force killed")
                except Exception as e:
                    print(f"❌ Error stopping {name}: {e}")
    
    def run(self):
        """Main execution method"""
        print("=" * 50)
        print("   Perfect Student Evaluation System")
        print("   System Startup")
        print("=" * 50)
        print()
        
        # Start Django Server
        if not self.start_django_server():
            print("❌ Failed to start Django Server. Exiting...")
            return
        
        print()
        print("🎉 System is Running!")
        print("📱 Main Application: http://127.0.0.1:8000")
        print()
        print("💡 Press Ctrl+C to stop the server")
        print()
        
        # Start monitoring in background thread
        monitor_thread = threading.Thread(target=self.monitor_services, daemon=True)
        monitor_thread.start()
        
        # Setup signal handler for graceful shutdown
        def signal_handler(sig, frame):
            print("\n🛑 Shutdown signal received")
            self.running = False
            self.stop_all_services()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        
        try:
            # Keep main thread alive
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            signal_handler(None, None)

def main():
    """Main entry point"""
    manager = SystemManager()
    manager.run()

if __name__ == "__main__":
    main()
