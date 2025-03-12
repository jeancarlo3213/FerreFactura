from rest_framework import serializers
from .models import Usuario, Producto, Factura, FacturaDetalle, PrecioEspecial, Descuento


# 🔹 Serializer de Usuario
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
    
    def validate_usuario(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre de usuario no puede estar vacío.")
        return value


# 🔹 Serializer de Producto
class ProductoSerializer(serializers.ModelSerializer):
    precio = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)

    class Meta:
        model = Producto
        fields = '__all__'

    def validate_precio_quintal(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("El precio por quintal debe ser mayor a 0.")
        return value

    def validate_precio_unidad(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("El precio por unidad debe ser mayor a 0.")
        return value

    def validate_unidades_por_quintal(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Las unidades por quintal deben ser mayor a 0.")
        return value


# 🔹 Serializer de Factura
class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = '__all__'
    
    def validate_descuento_total(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("El descuento total no puede ser negativo.")
        return value


# 🔹 Serializer de Precio Especial
class PrecioEspecialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrecioEspecial
        fields = '__all__'
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio especial debe ser mayor a 0.")
        return value


# 🔹 Serializer de FacturaDetalle
class FacturaDetalleSerializer(serializers.ModelSerializer):
    # Información extra del producto
    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    precio_quintal = serializers.DecimalField(source="producto.precio_quintal", max_digits=10, decimal_places=2, read_only=True)
    precio_unidad = serializers.DecimalField(source="producto.precio_unidad", max_digits=10, decimal_places=2, read_only=True)
    unidades_por_quintal = serializers.IntegerField(source="producto.unidades_por_quintal", read_only=True)
    categoria = serializers.CharField(source="producto.categoria", read_only=True)

    class Meta:
        model = FacturaDetalle
        fields = [
            "id",
            "cantidad",
            "precio_unitario",
            "tipo_venta",
            "factura",
            "producto",
            "producto_nombre",
            "precio_quintal",
            "precio_unidad",
            "unidades_por_quintal",
            "categoria",
        ]


# 🔹 Serializer de Factura con detalles anidados
class FacturaConDetallesSerializer(serializers.ModelSerializer):
    detalles = FacturaDetalleSerializer(many=True, read_only=True, source='facturadetalle_set')

    class Meta:
        model = Factura
        fields = [
            'id', 
            'fecha_creacion', 
            'usuario', 
            'nombre_cliente',
            'fecha_entrega', 
            'costo_envio', 
            'descuento_total',
            'detalles'
        ]


# 🔹 Serializer de Descuento
class DescuentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Descuento
        fields = '__all__'
    
    def validate_cantidad(self, value):
        if value < 0:
            raise serializers.ValidationError("El descuento no puede ser negativo.")
        return value
