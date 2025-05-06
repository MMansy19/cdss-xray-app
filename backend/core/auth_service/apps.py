# auth_service/apps.py
from django.apps import AppConfig

class AuthServiceConfig(AppConfig):
    name = 'auth_service'
    label = 'auth_service'  # Unique label for SOA