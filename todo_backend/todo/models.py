from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(default="")
    completed = models.BooleanField(default=False)
    location = models.CharField(max_length=200, default="")
    duration = models.CharField(max_length=200, default="")
    cost = models.CharField(max_length=200, default="")
    notes = models.TextField(default="")
 
    def __str__(self):
        return self.title
