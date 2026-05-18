from flask import Blueprint, jsonify
from db import Session
from analytics import get_quality_flags, get_quality_score

quality_bp = Blueprint("quality", __name__)


@quality_bp.get("/api/quality/flags")
def quality_flags():
    session = Session()
    try:
        return jsonify(get_quality_flags(session))
    except Exception:
        return jsonify({"error": "failed to fetch quality flags"}), 500
    finally:
        session.close()


@quality_bp.get("/api/quality/score")
def quality_score():
    session = Session()
    try:
        return jsonify(get_quality_score(session))
    except Exception:
        return jsonify({"error": "failed to fetch quality score"}), 500
    finally:
        session.close()
