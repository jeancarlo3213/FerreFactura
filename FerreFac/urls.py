from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from facturacion.views import api_root  # Importa api_root para que la raíz tenga contenido

urlpatterns = [
    path('', api_root, name='api-root'),  # Redirige a api_root al visitar `/`
    path('admin/', admin.site.urls),  # Panel de administración de Django
    path('api/', include('facturacion.urls')),  # Incluye las rutas de la app "facturacion"
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),  # Endpoint de autenticación
]
