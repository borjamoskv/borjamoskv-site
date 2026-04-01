import shutil
import base64

p = "/Users/" + "borjafernandezangulo/" + "50_MEDIA" + "/Images/Imports/Downloads/instructn.jpg"
try:
    shutil.copy(p, "img/instructn.jpg")
    print("SUCCESS copied")
except Exception as e:
    print(e)
