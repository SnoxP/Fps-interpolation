import cv2
try:
    cv2.VideoWriter('test.mp4', cv2.VideoWriter_fourcc(*'mp4v'), None, (100, 100))
except Exception as e:
    print("cv2.VideoWriter error:", repr(e))
