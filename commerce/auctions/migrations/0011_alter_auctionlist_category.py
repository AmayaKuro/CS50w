# Generated by Django 4.1.7 on 2023-04-13 14:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0010_auto_20230413_2102'),
    ]

    operations = [
        migrations.AlterField(
            model_name='auctionlist',
            name='category',
            field=models.CharField(blank=True, default='No Category', max_length=64),
        ),
    ]