from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete = models.CASCADE) #希望我们的表是从user表来扩充的, 当user删除的时候,删除关联的player
    photo = models.URLField(max_length=256, blank = True) #加入头像
    openid = models.CharField(default="", max_length=50, blank=True, null=True) # 一键登录的openid
    def __str__(self):
        return str(self.user)
