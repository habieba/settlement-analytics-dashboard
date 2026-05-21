from sqlalchemy import func, case
from models import Client


# ── helpers ───────────────────────────────────────────────────────────────────

def _missing_fields(client) -> list[str]:
    """Return names of quality fields missing for a single client record."""
    missing = []
    if client.status == "completed" and client.completion_date is None:
        missing.append("completion_date")
    if client.notes is None:
        missing.append("notes")
    if client.language_spoken is None:
        missing.append("language_spoken")
    if client.case_worker is None:
        missing.append("case_worker")
    return missing


# ── overview ──────────────────────────────────────────────────────────────────

def get_kpis(session) -> dict:
    total = session.query(Client).count()
    completed = session.query(Client).filter(Client.status == "completed").count()
    withdrawn = session.query(Client).filter(Client.status == "withdrawn").count()
    active = session.query(Client).filter(Client.status == "active").count()

    denominator = completed + withdrawn
    completion_rate = round(completed / denominator * 100, 1) if denominator else 0.0

    # Use the same flagged definition as /api/quality/score: missing 2+ fields
    flagged = sum(1 for c in session.query(Client).all() if len(_missing_fields(c)) >= 2)
    quality_score = round((total - flagged) / total * 100, 1) if total else 0.0

    return {
        "total_clients": total,
        "completion_rate": completion_rate,
        "active_count": active,
        "quality_score": quality_score,
    }


def get_origins(session) -> list:
    rows = (
        session.query(Client.country_of_origin, func.count().label("count"))
        .group_by(Client.country_of_origin)
        .order_by(func.count().desc())
        .all()
    )
    return [{"country": row.country_of_origin, "count": row.count} for row in rows]


# ── programs ──────────────────────────────────────────────────────────────────

def get_intake_trends(session) -> list:
    rows = (
        session.query(
            func.strftime("%Y-%m", Client.intake_date).label("month"),
            func.count(Client.id).label("count"),
        )
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [{"month": row.month, "count": row.count} for row in rows]


def get_program_completion(session) -> list:
    rows = (
        session.query(
            Client.program_type,
            func.count(Client.id).label("total"),
            func.count(case((Client.status == "completed", Client.id))).label("completed"),
            func.count(case((Client.status == "withdrawn", Client.id))).label("withdrawn"),
            func.count(case((Client.status == "active",    Client.id))).label("active"),
        )
        .group_by(Client.program_type)
        .all()
    )
    result = []
    for row in rows:
        rate = round(row.completed / row.total * 100, 1) if row.total else 0.0
        result.append({
            "program": row.program_type,
            "total": row.total,
            "completed": row.completed,
            "withdrawn": row.withdrawn,
            "active": row.active,
            "rate": rate,
        })
    return sorted(result, key=lambda x: x["rate"], reverse=True)


# ── clients ───────────────────────────────────────────────────────────────────

def get_clients(session, page: int, per_page: int,
                status: str | None, program_type: str | None,
                country: str | None) -> dict:
    query = session.query(Client)
    if status:
        query = query.filter(Client.status == status)
    if program_type:
        query = query.filter(Client.program_type == program_type)
    if country:
        query = query.filter(Client.country_of_origin == country)

    total = query.count()
    pages = max(1, -(-total // per_page))
    records = query.order_by(Client.id).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "clients": [c.to_dict() for c in records],
        "total": total,
        "page": page,
        "pages": pages,
    }


# ── quality ───────────────────────────────────────────────────────────────────

def get_quality_flags(session) -> list:
    flagged = []
    for client in session.query(Client).all():
        missing = _missing_fields(client)
        if len(missing) >= 2:
            flagged.append({
                "id": client.id,
                "name": client.name,
                "program_type": client.program_type,
                "status": client.status,
                "missing_fields": missing,
            })
    return flagged


def get_quality_score(session) -> dict:
    all_clients = session.query(Client).all()
    total = len(all_clients)

    breakdown = {
        "missing_completion_date": 0,
        "missing_notes": 0,
        "missing_language_spoken": 0,
        "missing_case_worker": 0,
    }
    flagged_count = 0

    for client in all_clients:
        missing = _missing_fields(client)
        if len(missing) >= 2:
            flagged_count += 1
        for field in missing:
            breakdown[f"missing_{field}"] += 1

    score = round((total - flagged_count) / total * 100, 1) if total else 0.0

    return {
        "score": score,
        "total_records": total,
        "flagged_records": flagged_count,
        "breakdown": breakdown,
    }
