from waitress import serve
from BE.wsgi import application 

serve(application, listen='localhost:8080')