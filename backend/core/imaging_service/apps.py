from django.apps import AppConfig

from .model.model_loader import ModelLoader


class ImagingServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'imaging_service'

    def ready(self):
        # Preload model when Django starts
        try:
            ModelLoader.get_instance().load_model()
        except Exception as e:
            # Log error but don't crash the app
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to preload model: {str(e)}")