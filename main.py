# importing the module
from pytube import YouTube

def onProgressHandler(bytes, bio, bytes_remaining):
	print("bytes {}".format(bytes))
	print("bytes_remaining {}".format(bytes_remaining))

# where to save
SAVE_PATH = "./" #to_do

# link of the video to be downloaded
link="https://www.youtube.com/watch?v=POBN8140l7M"

yt = None
try:
    yt = YouTube(link)
except:
	print("Connection Error") #to handle exception


(yt.streams
.filter(progressive=True, file_extension='mp4')
.order_by('resolution')
.desc()
.first()
.on_progress(onProgressHandler)
.download(
	filename="test.mp4"
))
# mp4files = yt.filter('mp4')

# #to set the name of the file
# yt.set_filename('GeeksforGeeks Video')

# # get the video with the extension and
# # resolution passed in the get() function
# d_video = yt.get(mp4files[-1].extension,mp4files[-1].resolution)
# try:
# 	# downloading the video
# 	d_video.download(SAVE_PATH)
# except:
# 	print("Some Error!")
# print('Task Completed!')
