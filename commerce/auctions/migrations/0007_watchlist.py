# Generated by Django 4.1.7 on 2023-04-11 08:52

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0006_alter_comments_commenter'),
    ]

    operations = [
        migrations.CreateModel(
            name='watchList',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user', to=settings.AUTH_USER_MODEL)),
                ('watchList', models.ManyToManyField(to='auctions.auctionlist')),
            ],
        ),
    ]
