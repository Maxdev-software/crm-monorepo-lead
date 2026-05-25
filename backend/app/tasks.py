import logging
import time
from celery import Celery
from app.config import settings

logger = logging.getLogger(__name__)

celery_app = Celery(
    "crm",
    broker=settings.RABBITMQ_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
)


@celery_app.task(
    name="crm.send_email_notification",
    bind=True,
    max_retries=3,
    default_retry_delay=10,
)
def send_email_notification(self, lead_id: int, email: str, name: str):
    """Simulate sending a welcome email to a new lead."""
    try:
        logger.info("[TASK] Sending email to %s (lead #%d) …", email, lead_id)
        time.sleep(2)  # simulate SMTP latency
        logger.info(
            "[TASK] ✅ Email sent to %s — Subject: Welcome, %s!", email, name
        )
        return {"status": "sent", "lead_id": lead_id, "email": email}
    except Exception as exc:
        logger.error("[TASK] ❌ Failed: %s", exc)
        raise self.retry(exc=exc)