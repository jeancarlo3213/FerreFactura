from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Usuario, Producto, Factura, FacturaDetalle, PrecioEspecial, Descuento
from .serializers import UsuarioSerializer, ProductoSerializer, FacturaSerializer, FacturaDetalleSerializer, PrecioEspecialSerializer, DescuentoSerializer
from .business.factura_logic import FacturaLogic

# Página de bienvenida
def api_root(request):
    return JsonResponse({"message": "Bienvenido a la API de FerreFactura"})

def home(request):
    return HttpResponse("¡Bienvenido a FerreFactura!")

# 🔹 Endpoint protegido con autenticación por token
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_endpoint(request):
    return Response({"message": "Access granted!"})

# ViewSets
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Sobrescribimos el método `create` para usar la lógica de negocio
        al momento de registrar una factura.
        """
        try:
            factura = FacturaLogic.procesar_factura(request.data)
            return Response({"message": "Factura creada con éxito!", "id": factura.id})
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

class FacturaDetalleViewSet(viewsets.ModelViewSet):
    queryset = FacturaDetalle.objects.all()
    serializer_class = FacturaDetalleSerializer
    permission_classes = [IsAuthenticated]

class PrecioEspecialViewSet(viewsets.ModelViewSet):
    queryset = PrecioEspecial.objects.all()
    serializer_class = PrecioEspecialSerializer
    permission_classes = [IsAuthenticated]

class DescuentoViewSet(viewsets.ModelViewSet):
    queryset = Descuento.objects.all()
    serializer_class = DescuentoSerializer
    permission_classes = [IsAuthenticated]