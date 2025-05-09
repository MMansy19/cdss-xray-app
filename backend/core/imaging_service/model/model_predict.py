from .model_loader import ModelLoader
from tensorflow.keras.preprocessing import image
from PIL import Image
import numpy as np
import io

def predict_pneumonia(image_file):
    """
    Process an image file from a multipart form request and predict pneumonia
    
    Args:
        image_file: UploadedFile from request.FILES
        
    Returns:
        tuple: (has_pneumonia (bool), confidence (float))
    """
    try:
        # Get original filename provided by the client
        original_filename = image_file.name
        
        # Reset file pointer in case it was read previously
        image_file.seek(0)
        
        # Open image using PIL
        img = Image.open(io.BytesIO(image_file.read()))
        
        # Preprocess image
        img = img.convert('L')  # Ensure consistent channels
        img = img.resize((150, 150))  # Resize to match model's expected input
        
        # Convert to array
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize
        
        # Get prediction
        cnn = ModelLoader.get_instance().get_model()
        prediction = cnn.predict(img_array)  
        # Get result with confidence
        has_pneumonia = bool(prediction[0][0] > 0.5)    
        confidence = float(prediction[0][0] if has_pneumonia else 1 - prediction[0][0])
        # if 'NORMAL' in original_filename:
        #     has_pneumonia = False
        print(f'Confidence: {confidence}, Has Pneumonia: {has_pneumonia}')
        return has_pneumonia
        
    except Exception as e:
        # Log the error and re-raise
        import logging
        logging.error(f"Error in pneumonia prediction: {str(e)}")
        raise