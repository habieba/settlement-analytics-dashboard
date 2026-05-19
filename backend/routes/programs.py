from flask import Blueprint, jsonify
from db import Session
from analytics import get_intake_trends, get_program_completion

programs_bp = Blueprint("programs", __name__)


@programs_bp.get("/api/programs/trends")
def intake_trends():
    session = Session()
    try:
        return jsonify(get_intake_trends(session))
    except Exception:
        return jsonify({"error": "failed to fetch intake trends"}), 500
    finally:
        session.close()


@programs_bp.get("/api/programs/completion")
def program_completion():
    session = Session()
    try:
        return jsonify(get_program_completion(session))
    except Exception:
        return jsonify({"error": "failed to fetch program completion"}), 500
    finally:
        session.close()
