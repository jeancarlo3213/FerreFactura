from rest_framework import serializers
from .models import Usuario, Producto, Factura, FacturaDetalle, PrecioEspecial, Descuento

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
    
    def validate_username(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre de usuario no puede estar vacío.")
        return value

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0.")
        return value

class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = '__all__'
    
    def validate_total(self, value):
        if value <= 0:
            raise serializers.ValidationError("El total de la factura debe ser mayor a 0.")
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
    
    def validate_descuento(self, value):
        if value < 0:
            raise serializers.ValidationError("El descuento no puede ser negativo.")
        return value
