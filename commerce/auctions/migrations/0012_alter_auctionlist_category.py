# Generated by Django 4.1.7 on 2023-04-14 00:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0011_alter_auctionlist_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='auctionlist',
            name='category',
            field=models.CharField(blank=True, max_length=64),
        ),
    ]
