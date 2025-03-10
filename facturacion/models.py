from django.db import models
from django.contrib.auth.models import User


class Token(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    user = models.ForeignKey(User, related_name='facturacion_auth_token', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'authtoken_token'
        managed = False

    def __str__(self):
        return str(self.key)


# Modelo para la tabla Usuarios
class Usuario(models.Model):
    nombre = models.CharField(max_length=255)
    usuario = models.CharField(max_length=100, unique=True)
    contraseña = models.CharField(max_length=255)
    rol = models.CharField(max_length=50, choices=[('Cajero', 'Cajero'), ('Administrador', 'Administrador')], null=True, blank=True)
    habilitado = models.BooleanField(default=True)
    objects = models.Manager()
    
    class Meta:
        db_table = 'Usuarios'
    
    def __str__(self):
        return str(self.nombre)


# Modelo para la tabla Productos
class Producto(models.Model):
    nombre = models.CharField(max_length=255, unique=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, default=0)
    precio_quintal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    precio_unidad = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unidades_por_quintal = models.IntegerField(null=True, blank=True)
    categoria = models.CharField(max_length=100, null=True, blank=True)
    stock = models.IntegerField(default=0, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()
    
    class Meta:
        db_table = 'Productos'

    def __str__(self):
        return str(self.nombre)


# Modelo para la tabla Facturas
class Factura(models.Model):
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    nombre_cliente = models.CharField(max_length=255, null=True, blank=True)
    fecha_entrega = models.DateField(null=True, blank=True)
    costo_envio = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    descuento_total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    objects = models.Manager()
    
    class Meta:
        db_table = 'Facturas'

    def __str__(self):
        return f'Factura {self.pk} - {str(self.nombre_cliente)}'


# Modelo para la tabla Facturas_Detalle con tipo de venta
class FacturaDetalle(models.Model):
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    # 🔹 Nuevo campo: Tipo de venta (Unidad o Quintal)
    tipo_venta = models.CharField(
        max_length=20,
        choices=[('Unidad', 'Unidad'), ('Quintal', 'Quintal')],
        default='Unidad'
    )

    objects = models.Manager()

    class Meta:
        db_table = 'Facturas_Detalle'
    
    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def __str__(self):
        return f'{self.producto} - {self.cantidad} {self.tipo_venta}'


# Modelo para la tabla Precios_Especiales
class PrecioEspecial(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    tipo_cliente = models.CharField(max_length=50)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    objects = models.Manager()

    class Meta:
        db_table = 'Precios_Especiales'

    def __str__(self):
        return f'Precio especial para {self.tipo_cliente} - {str(self.producto)}'


# Modelo para la tabla Descuentos
class Descuento(models.Model):
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE)
    tipo = models.CharField(
        max_length=50, 
        choices=[('Total', 'Total'), ('Por unidad', 'Por unidad')], 
        null=True, blank=True
    )
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, null=True, blank=True)
    objects = models.Manager()

    class Meta:
        db_table = 'Descuentos'

    def __str__(self):
        return f'Descuento {self.tipo} - {self.cantidad}'
