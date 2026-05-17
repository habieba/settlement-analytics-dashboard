import os
from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")])

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../data/settlement.db")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

from models import Base
Base.metadata.create_all(engine)

if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_ENV") == "development")
