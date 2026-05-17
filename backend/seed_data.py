import random
from datetime import date, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Client

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../data/settlement.db")
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

COUNTRIES = [
    "Syria", "Ukraine", "Afghanistan", "Somalia", "Ethiopia",
    "Eritrea", "Congo (DRC)", "Nigeria", "Colombia", "Venezuela",
    "Iran", "Iraq", "Myanmar", "Sudan", "Cameroon",
]

PROGRAMS = [
    "Language Training",
    "Employment Services",
    "Housing Support",
    "Social Integration",
    "Legal & Documentation",
    "Mental Health Support",
]

CASE_WORKERS = [
    "Maria Santos",
    "James Okafor",
    "Leila Ahmadi",
    "David Chen",
    "Fatima Al-Rashid",
]

# Names keyed by country — first names drawn from cultural backgrounds,
# last names likewise, mixed and matched within each pool.
NAMES_BY_COUNTRY = {
    "Syria": (
        ["Omar", "Layla", "Hassan", "Nour", "Ahmad", "Rania", "Khalid", "Sara"],
        ["Al-Hassan", "Mansour", "Ibrahim", "Khalil", "Nasser", "Yousef"],
    ),
    "Ukraine": (
        ["Olena", "Dmytro", "Natalia", "Ivan", "Yulia", "Andriy", "Oksana"],
        ["Kovalenko", "Shevchenko", "Bondarenko", "Melnyk", "Kravchenko"],
    ),
    "Afghanistan": (
        ["Farida", "Hamid", "Zarghona", "Nasir", "Mariam", "Wahid", "Parisa"],
        ["Ahmadzai", "Noorzai", "Wardak", "Safi", "Karimi", "Rahimi"],
    ),
    "Somalia": (
        ["Hodan", "Abdi", "Faadumo", "Hassan", "Ifrah", "Mahad", "Asad"],
        ["Mohamed", "Ali", "Omar", "Ahmed", "Warsame", "Hussein"],
    ),
    "Ethiopia": (
        ["Tigist", "Bekele", "Hirut", "Dawit", "Selam", "Tesfaye", "Mekdes"],
        ["Tadesse", "Girma", "Haile", "Mulugeta", "Bekele", "Abebe"],
    ),
    "Eritrea": (
        ["Meron", "Tesfom", "Liya", "Haben", "Yonas", "Saba", "Kibrom"],
        ["Tesfamariam", "Haile", "Ghebremichael", "Tecle", "Woldemariam"],
    ),
    "Congo (DRC)": (
        ["Amani", "Beni", "Zawadi", "Fidele", "Grace", "Jean-Pierre", "Solange"],
        ["Kabila", "Mwamba", "Tshisekedi", "Lumumba", "Kasongo", "Mukeba"],
    ),
    "Nigeria": (
        ["Chisom", "Emeka", "Adaeze", "Tunde", "Ngozi", "Seun", "Amara"],
        ["Okonkwo", "Adeyemi", "Nwosu", "Babatunde", "Eze", "Obi"],
    ),
    "Colombia": (
        ["Valentina", "Santiago", "Camila", "Andres", "Isabella", "Juan", "Maria"],
        ["Garcia", "Rodriguez", "Martinez", "Lopez", "Hernandez", "Gomez"],
    ),
    "Venezuela": (
        ["Alejandra", "Carlos", "Gabriela", "Luis", "Daniela", "Miguel", "Ana"],
        ["Perez", "Gonzalez", "Sanchez", "Ramirez", "Torres", "Flores"],
    ),
    "Iran": (
        ["Shirin", "Dariush", "Maryam", "Reza", "Nasrin", "Ali", "Fatemeh"],
        ["Tehrani", "Shirazi", "Mousavi", "Hosseini", "Ahmadi", "Karimi"],
    ),
    "Iraq": (
        ["Zainab", "Ahmed", "Nadia", "Mustafa", "Hana", "Samir", "Lina"],
        ["Al-Jabouri", "Al-Saadi", "Hassan", "Al-Rashid", "Karim", "Majid"],
    ),
    "Myanmar": (
        ["Aye", "Kyaw", "Mya", "Zaw", "Su", "Win", "Thida"],
        ["Aung", "Maung", "Thein", "Htun", "Kyaw", "Naing"],
    ),
    "Sudan": (
        ["Amira", "Tariq", "Hala", "Osman", "Salma", "Nabil", "Reem"],
        ["Al-Amin", "Ibrahim", "Hassan", "Hamid", "Khalil", "Osman"],
    ),
    "Cameroon": (
        ["Nadège", "Hervé", "Carine", "Blaise", "Sandrine", "Patrick", "Yvette"],
        ["Mbeki", "Tchouta", "Nkengne", "Fouda", "Bello", "Nganou"],
    ),
}

LANGUAGE_BY_COUNTRY = {
    "Syria": "Arabic",
    "Ukraine": "Ukrainian",
    "Afghanistan": "Dari",
    "Somalia": "Somali",
    "Ethiopia": "Amharic",
    "Eritrea": "Tigrinya",
    "Congo (DRC)": "French",
    "Nigeria": "English",
    "Colombia": "Spanish",
    "Venezuela": "Spanish",
    "Iran": "Persian",
    "Iraq": "Arabic",
    "Myanmar": "Burmese",
    "Sudan": "Arabic",
    "Cameroon": "French",
}

NOTES_POOL = [
    "Client requires interpreter at all appointments.",
    "Follow-up scheduled for next quarter.",
    "Attending weekly language sessions; strong progress.",
    "Referred to external legal aid for documentation.",
    "Housing situation unstable — flagged for priority support.",
    "Successfully secured part-time employment.",
    "Mental health referral pending review.",
    "Family reunification case open with immigration office.",
    "Completed orientation module; advancing to phase 2.",
    "No-show at last two appointments; phone follow-up attempted.",
    "Client expressed interest in volunteering program.",
    "Documents submitted; awaiting government processing.",
]

INTAKE_START = date(2023, 1, 1)
INTAKE_END = date(2024, 12, 31)
INTAKE_RANGE = (INTAKE_END - INTAKE_START).days

STATUS_WEIGHTS = ["completed"] * 60 + ["active"] * 25 + ["withdrawn"] * 15


def random_name(country: str) -> str:
    first_names, last_names = NAMES_BY_COUNTRY[country]
    return f"{random.choice(first_names)} {random.choice(last_names)}"


def random_intake() -> date:
    return INTAKE_START + timedelta(days=random.randint(0, INTAKE_RANGE))


def seed(n: int = 200) -> None:
    session = Session()

    existing = session.query(Client).count()
    if existing > 0:
        print(f"Database already has {existing} records — clearing before re-seed.")
        session.query(Client).delete()
        session.commit()

    records = []
    for _ in range(n):
        country = random.choice(COUNTRIES)
        intake = random_intake()
        status = random.choice(STATUS_WEIGHTS)

        completion = None
        if status == "completed":
            completion = intake + timedelta(days=random.randint(30, 180))
            # Keep completion within dataset window
            if completion > date(2025, 6, 30):
                completion = date(2025, 6, 30)

        language = LANGUAGE_BY_COUNTRY[country]
        if random.random() < 0.10:
            language = None

        notes = random.choice(NOTES_POOL)
        if random.random() < 0.20:
            notes = None

        records.append(Client(
            name=random_name(country),
            country_of_origin=country,
            intake_date=intake,
            program_type=random.choice(PROGRAMS),
            status=status,
            completion_date=completion,
            case_worker=random.choice(CASE_WORKERS),
            language_spoken=language,
            notes=notes,
        ))

    session.add_all(records)
    session.commit()
    session.close()

    print_summary()


def print_summary() -> None:
    session = Session()
    total = session.query(Client).count()

    status_counts = {}
    for status in ["completed", "active", "withdrawn"]:
        count = session.query(Client).filter(Client.status == status).count()
        status_counts[status] = count

    program_counts = {}
    for program in PROGRAMS:
        count = session.query(Client).filter(Client.program_type == program).count()
        program_counts[program] = count

    session.close()

    print(f"\n--- Seed Summary ---")
    print(f"Total records inserted: {total}")

    print(f"\nBy status:")
    for status, count in status_counts.items():
        pct = count / total * 100
        print(f"  {status:<12} {count:>3}  ({pct:.0f}%)")

    print(f"\nBy program type:")
    for program, count in program_counts.items():
        pct = count / total * 100
        print(f"  {program:<26} {count:>3}  ({pct:.0f}%)")
    print()


if __name__ == "__main__":
    random.seed(42)
    seed(200)
