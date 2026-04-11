import numpy as np
import cv2
import json
from app import process_image_pipeline

# Create a test dummy image (640x480) with some basic shapes
img = np.zeros((480, 640, 3), dtype=np.uint8)
cv2.rectangle(img, (100, 100), (400, 400), (255, 255, 255), -1)

print("Running image CV pipeline...")
try:
    result = process_image_pipeline(img)
    print("SUCCESS! Pipeline returned:")
    print(json.dumps(result, indent=2))
except Exception as e:
    import traceback
    traceback.print_exc()