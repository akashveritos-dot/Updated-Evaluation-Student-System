from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.conf import settings

class Command(BaseCommand):
    help = 'Clear Django cache and refresh static files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Clear all cache including static files',
        )

    def handle(self, *args, **options):
        """Clear Django cache"""
        try:
            # Clear Django cache
            cache.clear()
            self.stdout.write(self.style.SUCCESS('✅ Django cache cleared successfully'))
            
            if options['all']:
                # Clear session data
                from django.contrib.sessions.models import Session
                Session.objects.all().delete()
                self.stdout.write(self.style.SUCCESS('✅ Session data cleared'))
                
                # Clear static files cache if using django-staticfiles
                try:
                    import shutil
                    static_root = getattr(settings, 'STATIC_ROOT', None)
                    if static_root and os.path.exists(static_root):
                        shutil.rmtree(static_root)
                        self.stdout.write(self.style.SUCCESS('✅ Static files cache cleared'))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'⚠️  Could not clear static files: {e}'))
            
            self.stdout.write(self.style.SUCCESS('🎉 Cache refresh completed!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error clearing cache: {e}'))
