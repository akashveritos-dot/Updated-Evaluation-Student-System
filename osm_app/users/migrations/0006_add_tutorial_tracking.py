# Generated migration for enhanced tutorial tracking
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_profile_tutorial_view_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='tutorial_skipped',
            field=models.BooleanField(default=False, help_text='Track if user explicitly skipped the tutorial'),
        ),
        migrations.AddField(
            model_name='profile',
            name='tutorial_force_restart',
            field=models.BooleanField(default=False, help_text='Flag to force tutorial restart on next login'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='tutorial_completed',
            field=models.BooleanField(default=False, help_text='Tutorial will not be shown after completion'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='tutorial_view_count',
            field=models.PositiveIntegerField(default=0, help_text='Number of times tutorial has been viewed'),
        ),
    ]
