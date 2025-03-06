from rest_framework import serializers
from .models import Usuario, Producto, Factura, FacturaDetalle, PrecioEspecial, Descuento

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
    
    def validate_usuario(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre de usuario no puede estar vacío.")
        return value

class ProductoSerializer(serializers.ModelSerializer):
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

class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = '__all__'
    
    def validate_descuento_total(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("El descuento total no puede ser negativo.")
        return value

class FacturaDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacturaDetalle
        fields = '__all__'
    
    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        return value

class PrecioEspecialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrecioEspecial
        fields = '__all__'
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio especial debe ser mayor a 0.")
        return value

class DescuentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Descuento
        fields = '__all__'
    
    def validate_cantidad(self, value):
        if value < 0:
            raise serializers.ValidationError("El descuento no puede ser negativo.")
        return value
