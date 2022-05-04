from celery.bin.control import inspect
from celery.result import AsyncResult
from fastapi import APIRouter, Depends
from fastapi_key_auth import AuthorizerDependency

from app.core.celery_app import celery_app

data_import_router = r = APIRouter(prefix="/dataimport")
authorizer = AuthorizerDependency(key_pattern="IMPORT_API_KEY_")


@r.get("",
       dependencies=[
           Depends(authorizer),
       ],)
async def get_tasks():

    # Inspect all nodes.

    i: inspect = celery_app.control.inspect()

    # Show the items that have an ETA or are scheduled for later processing
    return i.registered(), i.active_queues()


@r.post(
    "/wacensus",
    status_code=201,
    dependencies=[
        Depends(authorizer),
    ],
)
async def import_wacensus_data():
    task = celery_app.send_task("app.tasks.import_wacensus_data")
    return {"task_id": task.id}


@r.get("/{task_id}",
       dependencies=[
           Depends(authorizer),
       ],
       )
def get_status(task_id):
    task_result = AsyncResult(task_id)
    result = {
        "task_id": task_id,
        "task_status": task_result.status,
        "task_result": task_result.result,
    }
    return result
