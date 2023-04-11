# Generated by Django 4.1.7 on 2023-04-08 15:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0005_alter_comments_auctionlist'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comments',
            name='commenter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commenter', to=settings.AUTH_USER_MODEL),
        ),
    ]