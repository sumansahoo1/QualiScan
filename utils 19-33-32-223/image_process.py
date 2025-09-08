import cv2
import numpy as np

def preprocess_image(img_path):
    # Read the image
    img = cv2.imread(img_path)
    
    # Normalize brightness and contrast using histogram equalization
    img_yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    img_yuv[:,:,0] = cv2.equalizeHist(img_yuv[:,:,0])
    img_normalized = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2BGR)
    
    # Apply bilateral filtering to reduce noise but preserve edges
    img_filtered = cv2.bilateralFilter(img_normalized, 9, 75, 75)
    
    # Segmentation using GrabCut
    mask = np.zeros(img.shape[:2], np.uint8)
    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)
    rect = (50, 50, img.shape[1]-50, img.shape[0]-50)  # Rectangle for the object
    cv2.grabCut(img_filtered, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)
    mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
    img_segmented = img_filtered * mask2[:, :, np.newaxis]
    
    return img_segmented


# Example usage
img_filtered = preprocess_image('dataset/object_1/image.png')
cv2.imwrite('preprocessed_image.jpg', img_filtered)
