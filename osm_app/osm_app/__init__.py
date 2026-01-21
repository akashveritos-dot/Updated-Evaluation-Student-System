import pymysql
import os
import sys
import subprocess
import threading
import time
from pathlib import Path

pymysql.install_as_MySQLdb()

# Auto-start AI Auditing Service
def start_ai_service():
    """Start AI Auditing Service in background"""
    if os.environ.get('AUTO_START_AI_SERVICE', 'True').lower() == 'false':
        return
    
    try:
        project_dir = Path(__file__).parent.parent
        ai_service_path = project_dir / "ai_auditing_service.py"
        
        if not ai_service_path.exists():
            return
        
        def run_ai_service():
            try:
                process = subprocess.Popen(
                    [sys.executable, str(ai_service_path)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=str(project_dir)
                )
                
                # Wait a bit and check if service started successfully
                time.sleep(3)
                if process.poll() is None:
                    print("🤖 AI Auditing Service started automatically")
                else:
                    print("⚠️ AI Auditing Service failed to start")
                    
            except Exception as e:
                print(f"❌ Failed to start AI Service: {e}")
        
        # Start in background thread
        thread = threading.Thread(target=run_ai_service, daemon=True)
        thread.start()
        
    except Exception as e:
        print(f"❌ AI Service auto-start failed: {e}")

# Start the service when Django initializes
start_ai_service()