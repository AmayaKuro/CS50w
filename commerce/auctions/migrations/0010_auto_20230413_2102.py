# Generated by Django 4.1.7 on 2023-04-13 14:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0009_alter_watchlist_watchlist'),
    ]

    operations = [
        migrations.RenameField('auctionList', 'catagory', 'category'),
    ]
