# Generated by Django 4.1.7 on 2023-04-12 15:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0008_alter_watchlist_watchlist'),
    ]

    operations = [
        migrations.AlterField(
            model_name='watchlist',
            name='watchList',
            field=models.ManyToManyField(related_name='list', to='auctions.auctionlist'),
        ),
    ]
