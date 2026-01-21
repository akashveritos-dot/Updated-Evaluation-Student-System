from django.core.management.base import BaseCommand
import subprocess
import sys
import os
import signal
import time
from threading import Thread

class Command(BaseCommand):
    help = 'Start Django server'

    def add_arguments(self, parser):
        parser.add_argument(
            '--host',
            default='127.0.0.1',
            help='Django server host (default: 127.0.0.1)',
        )
        parser.add_argument(
            '--port',
            type=int,
            default=8000,
            help='Django server port (default: 8000)',
        )

    def handle(self, *args, **options):
        host = options['host']
        port = options['port']
        
        self.stdout.write(self.style.SUCCESS('🚀 Starting Evaluation System...'))
        self.stdout.write(f'   Django Server: http://{host}:{port}')
        self.stdout.write('')
        
        # Get paths
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Start Django Server
        self.stdout.write(self.style.SUCCESS('🌐 Starting Django Server...'))
        django_process = subprocess.Popen(
            [sys.executable, 'manage.py', 'runserver', f'{host}:{port}'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            cwd=project_dir
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Django Server started successfully'))
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎉 System is Running!'))
        self.stdout.write(f'   📱 Main Application: http://{host}:{port}')
        self.stdout.write('')
        self.stdout.write(self.style.INFO('Press Ctrl+C to stop the server'))
        
        # Monitor Django service
        def monitor_service():
            while True:
                time.sleep(2)
                
                # Check Django service
                if django_process.poll() is not None:
                    self.stdout.write(
                        self.style.ERROR('❌ Django Server has stopped!')
                    )
                    break
        
        monitor_thread = Thread(target=monitor_service, daemon=True)
        monitor_thread.start()
        
        # Handle graceful shutdown
        def signal_handler(sig, frame):
            self.stdout.write(self.style.WARNING('\n⚠️  Shutting down server...'))
            
            if django_process.poll() is None:
                django_process.terminate()
                try:
                    django_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    django_process.kill()
            
            self.stdout.write(self.style.SUCCESS('✅ Server stopped'))
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        
        try:
            # Wait for process to finish
            while django_process.poll() is None:
                time.sleep(1)
        except KeyboardInterrupt:
            signal_handler(None, None)
