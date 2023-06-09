# Generated by Django 4.1.7 on 2023-03-28 05:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='auction_list',
            old_name='name',
            new_name='title',
        ),
        migrations.AddField(
            model_name='auction_list',
            name='catagory',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name='auction_list',
            name='description',
            field=models.CharField(default='', max_length=256),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='auction_list',
            name='image',
            field=models.URLField(blank=True),
        ),
        migrations.AlterField(
            model_name='auction_list',
            name='price',
            field=models.FloatField(),
        ),
    ]
