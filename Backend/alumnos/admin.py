from django.contrib import admin
from .models import (
    Alumno, CV, TipoHabilidad, Habilidad, CVHabilidad,
    Informe, InformeFortalezas, InformeHabilidades, InformeAreasMejora,
    PreguntaEntrevista, Entrevista, RespuestaEntrevista, HistorialEntrevista
)

admin.site.register(Alumno)
admin.site.register(CV)
admin.site.register(TipoHabilidad)
admin.site.register(Habilidad)
admin.site.register(CVHabilidad)
admin.site.register(Informe)
admin.site.register(InformeFortalezas)
admin.site.register(InformeHabilidades)
admin.site.register(InformeAreasMejora)
admin.site.register(PreguntaEntrevista)
admin.site.register(Entrevista)
admin.site.register(RespuestaEntrevista)
admin.site.register(HistorialEntrevista)
