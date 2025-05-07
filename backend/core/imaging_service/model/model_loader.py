import os
import tensorflow as tf
import logging

logger = logging.getLogger(__name__)

class ModelLoader:
    _instance = None
    _model = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelLoader()
        return cls._instance
    
    def load_model(self):
        """Load the model if it's not already loaded"""
        if self._model is None:
            try:
                # Updated path to point directly to the .keras file in the same directory
                model_path = os.path.join(os.path.dirname(__file__), 'pneumonia_model.keras')
                logger.info(f"Loading model from {model_path}")
                self._model = tf.keras.models.load_model(model_path)
                logger.info("Model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading model: {str(e)}")
                raise
        return self._model
    
    def get_model(self):
        """Get the loaded model"""
        return self.load_model()