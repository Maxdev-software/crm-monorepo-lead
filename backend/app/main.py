import json
import logging
from datetime import datetime
from typing import Optional

import redis
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Enum, func
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.tasks import send_email_notification
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50))
    status = Column(
        Enum("new", "contacted", "qualified", "lost", name="lead_status"),
        default="new",
        nullable=False,
    )
    source = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
ANALYTICS_CACHE_KEY = "crm:analytics:dashboard"
ANALYTICS_TTL = 300  


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    status: str = "new"
    source: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    status: str
    source: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/v1/leads", response_model=LeadResponse, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)

    redis_client.delete(ANALYTICS_CACHE_KEY)
    logger.info("Analytics cache invalidated after new lead #%d", lead.id)

    send_email_notification.delay(lead.id, lead.email, lead.name)
    return lead


@app.get("/api/v1/leads")
def list_leads(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Lead)
    if status:
        q = q.filter(Lead.status == status)
    total = q.count()
    leads = q.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": [LeadResponse.model_validate(l) for l in leads]}


@app.get("/api/v1/analytics/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    cached = redis_client.get(ANALYTICS_CACHE_KEY)
    if cached:
        logger.info("Analytics served from Redis cache")
        return json.loads(cached)

    logger.info("Computing analytics from DB")

    total_leads = db.query(func.count(Lead.id)).scalar()

    status_rows = (
        db.query(Lead.status, func.count(Lead.id)).group_by(Lead.status).all()
    )
    by_status = {row[0]: row[1] for row in status_rows}

    source_rows = (
        db.query(Lead.source, func.count(Lead.id))
        .filter(Lead.source.isnot(None))
        .group_by(Lead.source)
        .all()
    )
    by_source = {row[0]: row[1] for row in source_rows}

    daily_rows = (
        db.query(
            func.date_trunc("day", Lead.created_at).label("day"),
            func.count(Lead.id).label("count"),
        )
        .group_by("day")
        .order_by("day")
        .limit(30)
        .all()
    )
    daily_trend = [
        {"date": row.day.strftime("%Y-%m-%d"), "count": row.count}
        for row in daily_rows
    ]

    result = {
        "total_leads": total_leads,
        "by_status": by_status,
        "by_source": by_source,
        "daily_trend": daily_trend,
        "cached_at": datetime.utcnow().isoformat(),
    }

    redis_client.setex(ANALYTICS_CACHE_KEY, ANALYTICS_TTL, json.dumps(result))
    return result
