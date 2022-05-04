from app.core.celery_app import celery_app
from app.dataimport.wacensus import import_data


@celery_app.task(acks_late=True)
def import_wacensus_data() -> str:
    import_data()
    return f"Import completed"
