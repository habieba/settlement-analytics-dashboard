from sqlalchemy import Column, Integer, Text, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    country_of_origin = Column(Text, nullable=False)
    intake_date = Column(Date, nullable=False)
    program_type = Column(Text, nullable=False)
    status = Column(Text, nullable=False)
    completion_date = Column(Date, nullable=True)
    case_worker = Column(Text, nullable=True)
    language_spoken = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Client id={self.id} name={self.name!r} status={self.status!r}>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "country_of_origin": self.country_of_origin,
            "intake_date": self.intake_date.isoformat() if self.intake_date else None,
            "program_type": self.program_type,
            "status": self.status,
            "completion_date": self.completion_date.isoformat() if self.completion_date else None,
            "case_worker": self.case_worker,
            "language_spoken": self.language_spoken,
            "notes": self.notes,
        }
