from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from .models import (
    Alumno, CV, TipoHabilidad, Habilidad, CVHabilidad,
    Informe, InformeFortalezas, InformeHabilidades, InformeAreasMejora,
    PreguntaEntrevista, Entrevista, RespuestaEntrevista, HistorialEntrevista
)


class AlumnoRegistroSerializer(serializers.ModelSerializer):
    confirmar_contrasena = serializers.CharField(write_only=True)

    class Meta:
        model = Alumno
        fields = ['nombre', 'correo', 'contrasena', 'confirmar_contrasena']
        extra_kwargs = {
            'contrasena': {'write_only': True}
        }

    def validate(self, data):
        if data['contrasena'] != data.pop('confirmar_contrasena'):
            raise serializers.ValidationError({"contrasena": "Las contraseñas no coinciden"})
        return data

class AlumnoLoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    contrasena = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            alumno = Alumno.objects.get(correo=data['correo'])
            if not check_password(data['contrasena'], alumno.contrasena):
                raise serializers.ValidationError("Credenciales inválidas")
            return {'alumno': alumno}
        except Alumno.DoesNotExist:
            raise serializers.ValidationError("Credenciales inválidas")    

### SERIALIZER PARA ALUMNO ###
class AlumnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumno
        fields = '__all__'  # Incluye todos los campos del modelo


### SERIALIZER PARA CV ###
class CVSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = '__all__'


### SERIALIZER PARA TIPO HABILIDAD ###
class TipoHabilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoHabilidad
        fields = '__all__'


### SERIALIZER PARA HABILIDAD ###
class HabilidadSerializer(serializers.ModelSerializer):
    tipo = TipoHabilidadSerializer()  # Muestra el tipo de habilidad como JSON

    class Meta:
        model = Habilidad
        fields = '__all__'


### SERIALIZER PARA RELACIÓN MANY-TO-MANY CV-HABILIDADES ###
class CVHabilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVHabilidad
        fields = '__all__'


### SERIALIZER PARA INFORME ###
class InformeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Informe
        fields = '__all__'


### SERIALIZER PARA INFORME - FORTALEZAS ###
class InformeFortalezasSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformeFortalezas
        fields = '__all__'


### SERIALIZER PARA INFORME - HABILIDADES ###
class InformeHabilidadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformeHabilidades
        fields = '__all__'


### SERIALIZER PARA INFORME - ÁREAS DE MEJORA ###
class InformeAreasMejoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformeAreasMejora
        fields = '__all__'


### SERIALIZER PARA PREGUNTAS DE ENTREVISTA ###
class PreguntaEntrevistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreguntaEntrevista
        fields = '__all__'


### SERIALIZER PARA ENTREVISTA ###
class EntrevistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrevista
        fields = '__all__'


### SERIALIZER PARA RESPUESTAS EN ENTREVISTA ###
class RespuestaEntrevistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaEntrevista
        fields = '__all__'


### SERIALIZER PARA HISTORIAL DE ENTREVISTAS ###
class HistorialEntrevistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialEntrevista
        fields = '__all__'
