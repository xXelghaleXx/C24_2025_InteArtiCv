import json
import fitz  # PyMuPDF para extraer texto de PDF
import docx  # python-docx para extraer texto de Word
import openai
import os
import requests  # Para hacer peticiones HTTP a la API de Google
from django.core.files.base import ContentFile
from django.http import HttpResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from reportlab.lib.pagesizes import letter
from django.shortcuts import get_object_or_404
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit  # Para ajustar el texto automáticamente
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CV, Alumno, Informe, Entrevista, PreguntaEntrevista, RespuestaEntrevista, Habilidad, TipoHabilidad, CVHabilidad
from .serializers import CVSerializer, InformeSerializer, AlumnoRegistroSerializer, AlumnoLoginSerializer
from alumnos.models import Alumno 
from rest_framework.generics import ListAPIView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime


from django.utils import timezone


# Configuración de las credenciales de Google OAuth


class GoogleLoginView(APIView):
    """
    Vista para manejar el inicio de sesión con Google OAuth 2.0
    """
    def post(self, request):
        # Recibir datos de Google desde el frontend
        google_id = request.data.get('google_id')
        nombre = request.data.get('nombre')
        correo = request.data.get('correo')
        
        if not google_id or not nombre or not correo:
            return Response(
                {"error": "Se requieren todos los datos de Google (ID, nombre y correo)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Intentar encontrar al alumno por correo electrónico
            alumno, created = Alumno.objects.get_or_create(
                correo=correo,
                defaults={
                    'nombre': nombre,
                    # No necesitamos contraseña para autenticación con Google
                    # Podemos generar una aleatoria o dejarla vacía
                }
            )
            
            # Actualizar el nombre si es necesario
            if not created and alumno.nombre != nombre:
                alumno.nombre = nombre
                alumno.save()
            
            # Actualizar fecha de último acceso
            alumno.fecha_ultimo_acceso = timezone.now()
            alumno.save()
            
            # Generar tokens JWT para la sesión
            refresh = RefreshToken.for_user(alumno)
            
            return Response({
                'status': 'success',
                'mensaje': 'Inicio de sesión con Google exitoso',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'alumno_id': alumno.id,
                'nombre': alumno.nombre
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'error': f'Error en la autenticación con Google: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegistroView(APIView):
    def post(self, request):
        serializer = AlumnoRegistroSerializer(data=request.data)
        if serializer.is_valid():
            alumno = serializer.save()
            return Response({
                'mensaje': 'Alumno registrado exitosamente',
                'alumno_id': alumno.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = AlumnoLoginSerializer(data=request.data)
        if serializer.is_valid():
            alumno = serializer.validated_data['alumno']
            
            # Actualizar última fecha de acceso
            alumno.fecha_ultimo_acceso = timezone.now()
            alumno.save()

            # Generar tokens JWT
            refresh = RefreshToken.for_user(alumno)
            
            return Response({
                'mensaje': 'Inicio de sesión exitoso',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'alumno_id': alumno.id,
                'nombre': alumno.nombre
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class SubirCVView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def extraer_texto_cv(self, archivo):
        """
        Extrae el texto de un archivo PDF o DOCX.
        """
        contenido = ""

        if archivo.name.endswith(".pdf"):
            with fitz.open(stream=archivo.read(), filetype="pdf") as pdf:
                for pagina in pdf:
                    contenido += pagina.get_text("text") + "\n"

        elif archivo.name.endswith(".docx"):
            doc = docx.Document(archivo)
            contenido = "\n".join([p.text for p in doc.paragraphs])

        return contenido.strip()

    def validar_campos_cv(self, contenido_extraido):
        """
        Valida que el contenido del CV tenga las secciones necesarias.
        """
        campos_obligatorios = [
            "Perfil Profesional",
            "Educación Superior",
            "Experiencia Académica",
            "Experiencia Laboral",
            "Información Adicional"
        ]

        faltantes = [campo for campo in campos_obligatorios if campo.lower() not in contenido_extraido.lower()]

        if faltantes:
            return False, faltantes
        return True, []

    def extraer_habilidades_con_ia(self, contenido_extraido):
        """
        Extrae las habilidades del contenido del CV usando OpenAI.
        """
        # Configurar el prompt para OpenAI
        prompt = f"""
        Analiza el siguiente texto de un currículum y extrae una lista de habilidades técnicas y blandas.
        Devuelve la respuesta en formato JSON con las siguientes claves:
        - "habilidades_tecnicas": Lista de habilidades técnicas.
        - "habilidades_blandas": Lista de habilidades blandas.

        Texto del CV:
        {contenido_extraido}
        """

        try:
            # Llamar a la API de OpenAI
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4",  # Puedes usar "gpt-3.5-turbo" si no tienes acceso a GPT-4
                messages=[
                    {"role": "system", "content": "Eres un experto en recursos humanos y solo respondes en formato JSON válido."},
                    {"role": "user", "content": prompt}
                ]
            )

            # Obtener la respuesta y convertirla a JSON
            respuesta = response.choices[0].message.content.strip()
            habilidades = json.loads(respuesta)

            # Crear o recuperar las habilidades en la base de datos
            habilidades_encontradas = []

            # Habilidades técnicas
            tipo_tecnica, _ = TipoHabilidad.objects.get_or_create(nombre="Técnica")
            for habilidad in habilidades.get("habilidades_tecnicas", []):
                habilidad_obj, _ = Habilidad.objects.get_or_create(tipo=tipo_tecnica, habilidad=habilidad)
                habilidades_encontradas.append(habilidad_obj)

            # Habilidades blandas
            tipo_blanda, _ = TipoHabilidad.objects.get_or_create(nombre="Blanda")
            for habilidad in habilidades.get("habilidades_blandas", []):
                habilidad_obj, _ = Habilidad.objects.get_or_create(tipo=tipo_blanda, habilidad=habilidad)
                habilidades_encontradas.append(habilidad_obj)

            return habilidades_encontradas

        except Exception as e:
            print(f"Error al conectar con OpenAI: {e}")
            return []

    def post(self, request, *args, **kwargs):
        alumno_id = request.data.get("alumno_id")
        archivo = request.FILES.get("archivo")

        if not archivo:
            raise ValidationError("Debe subir un archivo")

        try:
            alumno = Alumno.objects.get(id=alumno_id)
        except Alumno.DoesNotExist:
            raise ValidationError("El alumno no existe")

        # Validar el tipo de archivo
        if not archivo.name.endswith(('.pdf', '.docx')):
            raise ValidationError("El archivo debe ser un PDF o DOCX")

        # Validar el tamaño del archivo (por ejemplo, 5MB máximo)
        if archivo.size > 5 * 1024 * 1024:
            raise ValidationError("El archivo no puede ser mayor a 5MB")

        # Extraer texto del archivo sin guardarlo en el sistema de archivos
        contenido_extraido = self.extraer_texto_cv(archivo)

        # Validar que el contenido del CV tenga las secciones necesarias
        es_valido, faltantes = self.validar_campos_cv(contenido_extraido)
        if not es_valido:
            raise ValidationError({
                "error": "El CV no contiene todas las secciones obligatorias.",
                "secciones_faltantes": faltantes
            })

        # Extraer habilidades del contenido del CV usando OpenAI
        habilidades_encontradas = self.extraer_habilidades_con_ia(contenido_extraido)

        # Guardar el archivo en el sistema de archivos solo si pasa todas las validaciones
        nombre_archivo = archivo.name
        contenido_archivo = archivo.read()

        # Crear y guardar el objeto CV
        nuevo_cv = CV(alumno=alumno)
        nuevo_cv.archivo.save(nombre_archivo, ContentFile(contenido_archivo))
        nuevo_cv.contenido_extraido = contenido_extraido
        nuevo_cv.save()

        # Asociar las habilidades encontradas al CV
        for habilidad in habilidades_encontradas:
            CVHabilidad.objects.create(cv=nuevo_cv, habilidad=habilidad)

        return Response({
            "mensaje": "CV subido y procesado correctamente",
            "cv": CVSerializer(nuevo_cv).data,
            "habilidades_encontradas": [str(h) for h in habilidades_encontradas]  # Opcional: Mostrar habilidades encontradas
        }, status=status.HTTP_201_CREATED)


class HistorialCVsView(ListAPIView):
    serializer_class = CVSerializer

    def get_queryset(self):
        alumno_id = self.kwargs.get("alumno_id")
        return CV.objects.filter(alumno__id=alumno_id).order_by("-fecha_creacion")

# Análisis de CV con IA
class AnalizarCVView(APIView):
    """
    Analiza el contenido de un CV usando OpenAI (ChatGPT).
    """

    def post(self, request, *args, **kwargs):
        cv_id = request.data.get("cv_id")

        # Validar que el CV existe
        try:
            cv = CV.objects.get(id=cv_id)
        except CV.DoesNotExist:
            return Response({"error": "El CV no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Enviar el contenido del CV a OpenAI
        prompt = f"""
        Analiza el siguiente currículum y extrae la siguiente información:
        - Habilidades técnicas y blandas
        - Experiencia laboral
        - Áreas de mejora
        - Resumen general del perfil

        CV:
        {cv.contenido_extraido}
        """

        try:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

            response = client.chat.completions.create(
                model="gpt-4",  # Usa "gpt-4" o "gpt-3.5-turbo" según disponibilidad
                messages=[{"role": "user", "content": prompt}]
            )

            # Extraer la respuesta de OpenAI
            analisis = response.choices[0].message.content

            # Guardar el informe en la base de datos
            informe = Informe.objects.create(cv=cv, resumen=analisis)

            return Response({
                "mensaje": "Análisis de CV completado",
                "informe": InformeSerializer(informe).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Error al conectar con OpenAI: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Descarga de Informes PDF
class DescargarInformePDFView(APIView):
    def get(self, request, informe_id, *args, **kwargs):
        informe = get_object_or_404(Informe, id=informe_id)

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="Informe_{informe.id}.pdf"'

        pdf = canvas.Canvas(response, pagesize=letter)
        pdf.setTitle(f"Informe {informe.id}")

        # Configuración de márgenes
        margen_izquierdo = 50
        margen_superior = 750
        ancho_maximo = 500  # Ajusta el ancho del texto para no salirse de la hoja

        # Configurar fuente
        pdf.setFont("Helvetica", 12)

        # Dividir el texto para ajustarlo al ancho del PDF
        lineas = simpleSplit(informe.resumen, "Helvetica", 12, ancho_maximo)

        # Dibujar el texto línea por línea
        y_position = margen_superior
        for linea in lineas:
            pdf.drawString(margen_izquierdo, y_position, linea)
            y_position -= 20  # Mover hacia abajo cada línea

            # Evitar que el texto salga de la hoja
            if y_position < 50:
                pdf.showPage()
                pdf.setFont("Helvetica", 12)
                y_position = margen_superior

        pdf.showPage()
        pdf.save()

        return response

# Iniciar Entrevista
class IniciarChatEntrevistaView(APIView):
    """
    Inicia una entrevista en formato chatbot, enviando la primera pregunta.
    """
    def post(self, request, *args, **kwargs):
        alumno_id = request.data.get("alumno_id")
        alumno = get_object_or_404(Alumno, id=alumno_id)

        # Crear entrevista
        entrevista = Entrevista.objects.create(alumno=alumno)

        # Seleccionar 6 preguntas aleatorias
        preguntas = list(PreguntaEntrevista.objects.order_by('?')[:6])
        primera_pregunta = preguntas.pop(0)

        # Guardar las preguntas seleccionadas en sesión o base de datos (opcional)
        request.session[f"preguntas_entrevista_{entrevista.id}"] = [p.id for p in preguntas]

        return Response({
            "mensaje": "Entrevista iniciada",
            "entrevista_id": entrevista.id,
            "pregunta_id": primera_pregunta.id,
            "pregunta_texto": primera_pregunta.texto
        }, status=status.HTTP_201_CREATED)

# Envío de respuestas y retroalimentación con la IA
class ChatEntrevistaView(APIView):
    """
    Permite responder una pregunta en el chat de la entrevista y obtener retroalimentación.
    """

    def post(self, request, *args, **kwargs):
        entrevista_id = request.data.get("entrevista_id")
        pregunta_id = request.data.get("pregunta_id")
        respuesta_texto = request.data.get("respuesta")

        entrevista = get_object_or_404(Entrevista, id=entrevista_id)
        pregunta = get_object_or_404(PreguntaEntrevista, id=pregunta_id)

        respuesta = RespuestaEntrevista.objects.create(
            entrevista=entrevista,
            pregunta=pregunta,
            respuesta=respuesta_texto
        )

        # Generar retroalimentación y puntuación con ChatGPT
        prompt = f"""
        Actúa como un entrevistador profesional. Evalúa la siguiente respuesta y genera una salida estrictamente en formato JSON con las siguientes claves:
        {{
            "retroalimentacion": "Tu retroalimentación detallada aquí",
            "puntuacion": Número del 1 al 10
        }}

        Pregunta: {pregunta.texto}
        Respuesta del candidato: {respuesta_texto}
        """

        try:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Eres un experto en entrevistas laborales y solo responderás en formato JSON válido."},
                    {"role": "user", "content": prompt}
                ]
            )

            evaluacion_texto = response.choices[0].message.content.strip()

            # Intentamos cargar el JSON
            try:
                resultado = json.loads(evaluacion_texto)
            except json.JSONDecodeError:
                return Response({"error": "La respuesta de OpenAI no está en formato JSON válido."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Guardar los datos en la BD
            respuesta.retroalimentacion = resultado.get("retroalimentacion", "No disponible")
            respuesta.puntuacion = resultado.get("puntuacion", 5)  # Por defecto 5 si no lo devuelve
            respuesta.save()

        except Exception as e:
            return Response({"error": f"Error al conectar con OpenAI: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Obtener preguntas restantes
        preguntas_restantes = request.session.get(f"preguntas_entrevista_{entrevista.id}", [])

        if preguntas_restantes:
            siguiente_pregunta_id = preguntas_restantes.pop(0)
            siguiente_pregunta = get_object_or_404(PreguntaEntrevista, id=siguiente_pregunta_id)
            request.session[f"preguntas_entrevista_{entrevista.id}"] = preguntas_restantes
        else:
            siguiente_pregunta_id = None
            siguiente_pregunta = None

        # **✅ VERIFICAMOS SI ES LA ÚLTIMA PREGUNTA**
        if not preguntas_restantes:
            respuestas = RespuestaEntrevista.objects.filter(entrevista=entrevista).values_list('puntuacion', flat=True)

            if not respuestas:
                return Response({
                    "mensaje": "Error: No se encontraron respuestas registradas."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            promedio_puntuacion = sum(respuestas) / len(respuestas)  # 🔥 Calculamos el promedio final

            if promedio_puntuacion >= 8:
                resultado_final = "¡Felicidades! Estás listo para una entrevista real."
            elif promedio_puntuacion >= 5:
                resultado_final = "Tienes un desempeño aceptable, pero hay áreas que puedes mejorar."
            else:
                resultado_final = "Debes mejorar tus respuestas antes de una entrevista laboral."

            # **🔥 GUARDAMOS LOS RESULTADOS EN LA BASE DE DATOS 🔥**
            entrevista.promedio_puntuacion = promedio_puntuacion
            entrevista.resultado_final = resultado_final
            entrevista.save()

            return Response({
                "mensaje": "Entrevista finalizada",
                "promedio_puntuacion": promedio_puntuacion,
                "resultado_final": resultado_final
            }, status=status.HTTP_200_OK)

        return Response({
            "mensaje": "Respuesta guardada y retroalimentación generada",
            "respuesta": respuesta.respuesta,
            "retroalimentacion": respuesta.retroalimentacion,
            "puntuacion": respuesta.puntuacion,
            "siguiente_pregunta_id": siguiente_pregunta.id if siguiente_pregunta else None,
            "siguiente_pregunta_texto": siguiente_pregunta.texto if siguiente_pregunta else None
        }, status=status.HTTP_201_CREATED)
