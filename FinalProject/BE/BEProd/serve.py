from waitress import serve
from BE.wsgi import application 

import logging
logger = logging.getLogger('waitress')
logger.setLevel(logging.INFO)

serve(application, listen='localhost:8080')