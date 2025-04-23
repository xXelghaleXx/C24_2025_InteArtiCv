from django.db import models
from django.contrib.auth.hashers import make_password

class Alumno(models.Model):
    nombre = models.CharField(max_length=255)
    correo = models.EmailField()
    fecha_ultimo_acceso = models.DateTimeField(null=True, blank=True)
    contrasena = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        # Encriptar contraseña solo si ha cambiado
        if not self.pk or 'contrasena' in kwargs.get('update_fields', []):
            self.contrasena = make_password(self.contrasena)
        super().save(*args, **kwargs)

### MODELO CV ###
class CV(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, related_name="cvs")
    archivo = models.FileField(upload_to="cvs/")  # Se almacenará en /media/cvs/
    contenido_extraido = models.TextField(blank=True, null=True)  # Texto extraído con IA
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CV de {self.alumno.nombre}"


### MODELO TIPO HABILIDAD ###
class TipoHabilidad(models.Model):
    nombre = models.CharField(max_length=50, unique=True)  # Ej: Técnica, Blanda

    def __str__(self):
        return self.nombre


### MODELO HABILIDADES ###
class Habilidad(models.Model):
    tipo = models.ForeignKey(TipoHabilidad, on_delete=models.CASCADE, related_name="habilidades")
    habilidad = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.tipo.nombre}: {self.habilidad}"


### RELACIÓN MANY-TO-MANY ENTRE CV Y HABILIDADES ###
class CVHabilidad(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name="cv_habilidades")
    habilidad = models.ForeignKey(Habilidad, on_delete=models.CASCADE, related_name="cv_habilidades")

    class Meta:
        unique_together = ('cv', 'habilidad')

    def __str__(self):
        return f"{self.cv.alumno.nombre} - {self.habilidad.habilidad}"


### MODELO INFORME ###
class Informe(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name="informes")
    resumen = models.TextField()
    fecha_generacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Informe de {self.cv.alumno.nombre}"


### MODELO INFORME - FORTALEZAS ###
class InformeFortalezas(models.Model):
    informe = models.ForeignKey(Informe, on_delete=models.CASCADE, related_name="fortalezas")
    fortaleza = models.CharField(max_length=255)

    def __str__(self):
        return f"Fortaleza: {self.fortaleza}"


### MODELO INFORME - HABILIDADES ###
class InformeHabilidades(models.Model):
    informe = models.ForeignKey(Informe, on_delete=models.CASCADE, related_name="habilidades")
    habilidad = models.ForeignKey(Habilidad, on_delete=models.CASCADE)

    def __str__(self):
        return f"Habilidad en informe: {self.habilidad.habilidad}"


### MODELO INFORME - ÁREAS DE MEJORA ###
class InformeAreasMejora(models.Model):
    informe = models.ForeignKey(Informe, on_delete=models.CASCADE, related_name="areas_mejora")
    area_mejora = models.CharField(max_length=255)

    def __str__(self):
        return f"Área de mejora: {self.area_mejora}"


### MODELO PREGUNTAS DE ENTREVISTA ###
class PreguntaEntrevista(models.Model):
    texto = models.TextField(unique=True)

    def __str__(self):
        return self.texto[:50]  # Mostrar solo los primeros 50 caracteres


### MODELO ENTREVISTA ###
class Entrevista(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, related_name="entrevistas")
    fecha = models.DateTimeField(auto_now_add=True)
    promedio_puntuacion = models.FloatField(null=True, blank=True)  # 🔹 Guardamos el promedio
    resultado_final = models.CharField(max_length=255, null=True, blank=True)  # 🔹 Guardamos la evaluación final

    def __str__(self):
        return f"Entrevista de {self.alumno.nombre}"


### MODELO RESPUESTAS EN ENTREVISTAS ###
class RespuestaEntrevista(models.Model):
    entrevista = models.ForeignKey(Entrevista, on_delete=models.CASCADE, related_name="respuestas")
    pregunta = models.ForeignKey(PreguntaEntrevista, on_delete=models.CASCADE, related_name="respuestas")
    respuesta = models.TextField()
    retroalimentacion = models.TextField(blank=True, null=True)  # Se llenará con IA
    puntuacion = models.IntegerField(null=True, blank=True)  # 🔥 Nueva puntuación

    def __str__(self):
        return f"Respuesta a {self.pregunta.texto[:50]}"


### MODELO HISTORIAL ENTREVISTAS ###
class HistorialEntrevista(models.Model):
    entrevista = models.ForeignKey(Entrevista, on_delete=models.CASCADE, related_name="historial")
    resultado = models.CharField(max_length=255)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Historial {self.entrevista.alumno.nombre}"
