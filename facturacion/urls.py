from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    api_root, protected_endpoint,
    UsuarioViewSet, ProductoViewSet, FacturaViewSet, 
    FacturaDetalleViewSet, PrecioEspecialViewSet, DescuentoViewSet
)

# Configurar router para los ViewSets
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'facturas', FacturaViewSet)
router.register(r'facturas-detalle', FacturaDetalleViewSet)
router.register(r'precios-especiales', PrecioEspecialViewSet)
router.register(r'descuentos', DescuentoViewSet)

urlpatterns = [
    path('', api_root, name='api-root'),  # Página principal de la API
    path('', include(router.urls)),  # Incluye los endpoints de los modelos
    path('protected-endpoint/', protected_endpoint, name='protected-endpoint'),  # Endpoint protegido
]
