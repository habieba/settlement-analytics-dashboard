import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")])

from db import engine, Session
from models import Base, Client
Base.metadata.create_all(engine)

from routes.clients import clients_bp
from routes.programs import programs_bp
from routes.quality import quality_bp
app.register_blueprint(clients_bp)
app.register_blueprint(programs_bp)
app.register_blueprint(quality_bp)


@app.get("/api/health")
def health():
    session = Session()
    try:
        count = session.query(Client).count()
        return jsonify({"status": "ok", "record_count": count})
    except Exception:
        return jsonify({"status": "degraded", "record_count": None}), 500
    finally:
        session.close()


@app.errorhandler(404)
def not_found(_):
    return jsonify({"error": "endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(_):
    return jsonify({"error": "method not allowed"}), 405


@app.errorhandler(500)
def internal_error(_):
    return jsonify({"error": "internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_ENV") == "development")
