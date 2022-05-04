import os

from celery import Celery

celery_app = Celery("worker")
celery_app.conf.broker_url = os.environ.get(
    "CELERY_BROKER_URL", "redis://localhost:6379"
)
celery_app.conf.result_backend = os.environ.get(
    "CELERY_RESULT_BACKEND", "redis://localhost:6379"
)
celery_app.conf.task_track_started = True


celery_app.conf.task_routes = {"app.tasks.*": "main-queue"}
