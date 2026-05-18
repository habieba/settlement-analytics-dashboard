from flask import Blueprint, jsonify, request
from db import Session
from analytics import get_kpis, get_origins, get_clients

clients_bp = Blueprint("clients", __name__)

VALID_STATUSES = {"active", "completed", "withdrawn"}
VALID_PROGRAMS = {
    "Language Training", "Employment Services", "Housing Support",
    "Social Integration", "Legal & Documentation", "Mental Health Support",
}


@clients_bp.get("/api/overview/kpis")
def overview_kpis():
    session = Session()
    try:
        return jsonify(get_kpis(session))
    except Exception:
        return jsonify({"error": "failed to fetch KPIs"}), 500
    finally:
        session.close()


@clients_bp.get("/api/origins")
def origins():
    session = Session()
    try:
        return jsonify(get_origins(session))
    except Exception:
        return jsonify({"error": "failed to fetch origins"}), 500
    finally:
        session.close()


@clients_bp.get("/api/clients")
def clients():
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(100, max(1, int(request.args.get("per_page", 20))))
    except ValueError:
        return jsonify({"error": "page and per_page must be integers"}), 400

    status = request.args.get("status") or None
    if status and status not in VALID_STATUSES:
        return jsonify({"error": f"invalid status '{status}'; must be one of: {', '.join(sorted(VALID_STATUSES))}"}), 400

    program_type = request.args.get("program_type") or None
    if program_type and program_type not in VALID_PROGRAMS:
        return jsonify({"error": f"invalid program_type '{program_type}'"}), 400

    country = request.args.get("country") or None

    session = Session()
    try:
        return jsonify(get_clients(session, page, per_page, status, program_type, country))
    except Exception:
        return jsonify({"error": "failed to fetch clients"}), 500
    finally:
        session.close()
