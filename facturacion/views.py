from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.db import transaction, connection
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.timezone import now  # Para obtener la fecha actual
from django.db.models import Sum ,F # Para calcular la suma de los totales


from .models import (
    Usuario, 
    Producto, 
    Factura, 
    FacturaDetalle, 
    PrecioEspecial, 
    Descuento
)
from .serializers import (
    UsuarioSerializer, 
    ProductoSerializer, 
    FacturaSerializer, 
    FacturaDetalleSerializer, 
    PrecioEspecialSerializer, 
    DescuentoSerializer,
    FacturaConDetallesSerializer  # <-- Importa tu nuevo serializer anidado
)

def api_root(request):
    return JsonResponse({"message": "Bienvenido a la API de FerreFactura"})

def home(request):
    return HttpResponse("¡Bienvenido a FerreFactura!")

# 🔹 Endpoint protegido con autenticación por token
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_endpoint(request):
    return Response({"message": "Access granted!"})

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
    serializer_class = FacturaSerializer  # Por defecto
    permission_classes = [IsAuthenticated]

    # 🔸 Sobrescribimos get_serializer_class
    # Para 'retrieve' y 'list', usar FacturaConDetallesSerializer
    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return FacturaConDetallesSerializer
        return FacturaSerializer

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                factura_data = {
                    "usuario_id": request.data["usuario_id"],
                    "nombre_cliente": request.data["nombre_cliente"],
                    "fecha_entrega": request.data["fecha_entrega"],
                    "costo_envio": request.data.get("costo_envio", 0),
                    "descuento_total": request.data.get("descuento_total", 0),
                }
                # Creamos la Factura
                factura = Factura.objects.create(**factura_data)

                # Creamos los detalles
                for detalle in request.data.get("productos", []):
                    producto = get_object_or_404(Producto, id=detalle["producto_id"])
                    FacturaDetalle.objects.create(
                        factura=factura,
                        producto=producto,
                        cantidad=detalle["cantidad"],
                        precio_unitario=detalle["precio_unitario"],
                        tipo_venta=detalle.get("tipo_venta", "Unidad")
                    )

                return Response({"message": "Factura creada con éxito!", "id": factura.id})
        except Exception as e:
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

# 🔹 Vista para obtener facturas completas (con la vista / vw_FacturasCompletas)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_facturas_completas(_request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM vw_FacturasCompletas")
        columnas = [col[0] for col in cursor.description]
        facturas = [dict(zip(columnas, row)) for row in cursor.fetchall()]

    return Response(facturas)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_estadisticas_facturas(request):
    hoy = now().date()
    mes_actual = now().month

    # Cantidad de facturas creadas hoy
    facturas_hoy = Factura.objects.filter(fecha_creacion__date=hoy).count()

    # Cantidad de facturas creadas este mes
    facturas_mes = Factura.objects.filter(fecha_creacion__month=mes_actual).count()

    # Total de ventas generadas (sumando los subtotales de FacturaDetalle)
    total_ventas = FacturaDetalle.objects.aggregate(
        total=Sum(F('cantidad') * F('precio_unitario'))
    )['total'] or 0

    # Ganancias del mes (sumando las ventas del mes actual)
    ganancias_mes = FacturaDetalle.objects.filter(
        factura__fecha_creacion__month=mes_actual
    ).aggregate(
        total=Sum(F('cantidad') * F('precio_unitario'))
    )['total'] or 0

    return Response({
        "facturas_hoy": facturas_hoy,
        "facturas_mes": facturas_mes,
        "total_ventas": round(total_ventas, 2),
        "ganancias_mes": round(ganancias_mes, 2)
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_ventas_anuales(request):
    """
    Devuelve la cantidad de ventas de cada mes del año actual.
    """
    año_actual = now().year

    ventas_mensuales = (
        FacturaDetalle.objects
        .filter(factura__fecha_creacion__year=año_actual)
        .annotate(venta_total=F('cantidad') * F('precio_unitario'))
        .values('factura__fecha_creacion__month')
        .annotate(total_ventas=Sum('venta_total'))
        .order_by('factura__fecha_creacion__month')
    )

    ventas_por_mes = {i: 0 for i in range(1, 13)}  # Inicializar todos los meses con 0 ventas

    for venta in ventas_mensuales:
        mes = venta['factura__fecha_creacion__month']
        ventas_por_mes[mes] = float(venta['total_ventas'])  # Convertir a float para evitar errores de serialización

    # ✅ Asegurar que se devuelve correctamente como una respuesta de DRF
    return Response({"ventas_por_mes": ventas_por_mes}, content_type="application/json")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_ventas_por_dia(request):
    """
    Devuelve la cantidad de ventas por día del mes actual.
    """
    hoy = now().date()
    mes_actual = hoy.month
    año_actual = hoy.year

    ventas_diarias = (
        FacturaDetalle.objects
        .filter(factura__fecha_creacion__year=año_actual, factura__fecha_creacion__month=mes_actual)
        .annotate(venta_total=F('cantidad') * F('precio_unitario'))
        .values('factura__fecha_creacion__day')
        .annotate(total_ventas=Sum('venta_total'))
        .order_by('factura__fecha_creacion__day')
    )

    ventas_por_dia = {i: 0 for i in range(1, 32)}  # Inicializar con 0 ventas para cada día del mes

    for venta in ventas_diarias:
        dia = venta['factura__fecha_creacion__day']
        ventas_por_dia[dia] = float(venta['total_ventas'])  # Convertir a float

    return Response({"ventas_por_dia": ventas_por_dia}, content_type="application/json")
