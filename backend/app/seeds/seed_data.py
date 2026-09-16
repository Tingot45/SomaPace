"""Seed the database with Kenyan CBC subjects, an admin user, and sample data.

Usage:
    python -m app.seeds.seed_data
"""
from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from app.auth import hash_password
from app.config import settings
from app.database import async_session_factory, init_db
from app.models import (
    Difficulty,
    Flashcard,
    Lesson,
    LessonStatus,
    Material,
    MaterialStatus,
    PracticeQuestion,
    QuestionType,
    Quiz,
    QuizStatus,
    Subject,
    Topic,
    User,
    UserRole,
)

CBC_SUBJECTS = [
    ("Mathematics", "mathematics"),
    ("English", "english"),
    ("Kiswahili", "kiswahili"),
    ("Integrated Science", "integrated-science"),
    ("Social Studies", "social-studies"),
    ("Creative Arts and Sports", "creative-arts-sports"),
    ("Physical Education", "physical-education"),
    ("Pre-Technical Studies", "pre-technical-studies"),
    ("Home Science", "home-science"),
    ("Religious Education", "religious-education"),
    ("Agriculture and Nutrition", "agriculture-nutrition"),
    ("Life Skills Education", "life-skills-education"),
    ("Computer Studies", "computer-studies"),
    ("Performing Arts", "performing-arts"),
    ("Visual Arts", "visual-arts"),
    ("French", "french"),
    ("German", "german"),
    ("Mandarin", "mandarin"),
    ("Kenya Sign Language", "kenya-sign-language"),
    ("Indigenous Languages", "indigenous-languages"),
    ("Digital Literacy", "digital-literacy"),
    ("Hygiene and Nutrition", "hygiene-nutrition"),
    ("Environmental Activities", "environmental-activities"),
    ("Movement and Creative Activities", "movement-creative-activities"),
]

ADMIN_PHONE = "+254700000000"
ADMIN_PASSWORD = "admin123"


async def seed() -> None:
    await init_db()
    async with async_session_factory() as db:
        # ---- Subjects ----
        existing = await db.execute(select(Subject))
        existing_slugs = {s.slug for s in existing.scalars().all()}
        subjects: list[Subject] = []
        for name, slug in CBC_SUBJECTS:
            if slug not in existing_slugs:
                subj = Subject(name=name, slug=slug, curriculum="CBC-Kenya", is_active=True)
                db.add(subj)
                subjects.append(subj)
            else:
                result = await db.execute(select(Subject).where(Subject.slug == slug))
                subjects.append(result.scalar_one())
        await db.flush()

        # ---- Admin user ----
        admin_result = await db.execute(select(User).where(User.phone_number == ADMIN_PHONE))
        if admin_result.scalar_one_or_none() is None:
            admin = User(
                phone_number=ADMIN_PHONE,
                full_name="SomaPace Admin",
                grade=10,
                role=UserRole.admin,
                password_hash=hash_password(ADMIN_PASSWORD),
                is_active=True,
            )
            db.add(admin)
            await db.flush()

        # ---- Sample student ----
        student_phone = "+254711111111"
        student_result = await db.execute(select(User).where(User.phone_number == student_phone))
        if student_result.scalar_one_or_none() is None:
            student = User(
                phone_number=student_phone,
                full_name="Wanjiku Kamau",
                grade=6,
                role=UserRole.student,
                password_hash=hash_password("student123"),
                is_active=True,
            )
            db.add(student)
            await db.flush()

        # ---- Sample material for Mathematics ----
        math_subject = None
        for s in subjects:
            if s.slug == "mathematics":
                math_subject = s
                break
        if math_subject is None:
            math_subject = subjects[0]

        admin_user = (await db.execute(select(User).where(User.phone_number == ADMIN_PHONE))).scalar_one()
        existing_mat = await db.execute(select(Material).limit(1))
        if existing_mat.scalar_one_or_none() is None:
            material = Material(
                source_filename="fractions_grade6.pdf",
                storage_path="uploads/sample_fractions.pdf",
                file_type="pdf",
                file_size_bytes=102400,
                uploaded_by=admin_user.id,
                status=MaterialStatus.processed,
                raw_text="Fractions represent parts of a whole. In Kenya, we use fractions when dividing nyama at a family gathering or when calculating change at the market. For example, if you buy 1 kg of sugar and share it equally among 3 friends, each person gets 1/3 of the sugar.",
                grade=6,
                subject_id=math_subject.id,
                checksum_sha256="a" * 64,
            )
            db.add(material)
            await db.flush()

            # ---- Sample topics ----
            topic1 = Topic(
                material_id=material.id,
                subject_id=math_subject.id,
                title="Understanding Fractions",
                subtopics=["What is a fraction?", "Numerator and denominator", "Types of fractions", "Equivalent fractions"],
                difficulty=Difficulty.beginner,
                order_index=0,
            )
            topic2 = Topic(
                material_id=material.id,
                subject_id=math_subject.id,
                title="Adding and Subtracting Fractions",
                subtopics=["Same denominator", "Different denominators", "Mixed numbers", "Real-life applications"],
                difficulty=Difficulty.intermediate,
                order_index=1,
            )
            db.add_all([topic1, topic2])
            await db.flush()

            # ---- Sample lesson ----
            lesson1 = Lesson(
                topic_id=topic1.id,
                title="Understanding Fractions",
                content_json={
                    "hook": "Did you know? When Mama Njeri buys a full chapati and divides it into 4 equal pieces for her children, each child gets 1/4 of the chapati. That's a fraction!",
                    "objectives": [
                        "Define what a fraction is",
                        "Identify the numerator and denominator",
                        "Recognize different types of fractions",
                    ],
                    "sections": [
                        {
                            "title": "What is a Fraction?",
                            "content": "A fraction is a way of representing a part of a whole. Think of a full plate of ugali. If you share it equally between 2 people, each person gets half (1/2) of the ugali. In mathematics, we write fractions as two numbers separated by a line: the top number is called the numerator and the bottom number is called the denominator. The numerator tells us how many parts we have, and the denominator tells us how many equal parts the whole is divided into.",
                        },
                        {
                            "title": "Types of Fractions",
                            "content": "There are three main types of fractions: proper fractions (where the numerator is less than the denominator, like 3/4), improper fractions (where the numerator is greater than or equal to the denominator, like 5/3), and mixed numbers (a whole number combined with a fraction, like 2 1/3). In Kenya, when you buy mitungi (scoops) of maize at the market, you might get 2 and a half scoops - that's a mixed number!",
                        },
                    ],
                    "worked_example": {
                        "title": "Sharing Mandazis",
                        "steps": [
                            "Mama Achieng has 3 mandazis to share equally among 4 children.",
                            "Each mandazi can be divided into 4 equal pieces = 12 pieces total.",
                            "Each child gets 12 ÷ 4 = 3 pieces.",
                            "Since each piece is 1/4 of a mandazi, each child gets 3/4 of a mandazi.",
                        ],
                        "answer": "Each child gets 3/4 of a mandazi.",
                    },
                    "kenyan_application": {
                        "title": "Fractions in Kenyan Daily Life",
                        "examples": [
                            "At Wakulima Market in Nairobi, a farmer sells 3/4 of his tomato harvest and keeps 1/4 for his family.",
                            "When making chai for visitors, if a recipe calls for 2 1/2 cups of milk and you only have 1 cup, you need 1/2 cup more.",
                        ],
                    },
                    "misconceptions": [
                        {"myth": "A bigger denominator means a bigger fraction.", "correction": "Actually, 1/8 is smaller than 1/4 because the pizza is cut into more pieces!"},
                        {"myth": "Improper fractions are always wrong.", "correction": "Improper fractions like 7/4 are perfectly valid and just mean more than one whole."},
                    ],
                    "summary": "Fractions are parts of a whole. The numerator is the top number (parts we have) and the denominator is the bottom number (total equal parts). We use fractions daily - from sharing food to measuring ingredients.",
                    "recap_quiz": [
                        {"question": "What is 1/2 of 8 oranges?", "options": ["2", "4", "6", "8"], "correct_index": 1, "explanation": "Half of 8 is 8 ÷ 2 = 4 oranges."},
                        {"question": "Which is a proper fraction?", "options": ["5/3", "7/7", "2/5", "9/4"], "correct_index": 2, "explanation": "A proper fraction has a numerator smaller than the denominator. 2/5 is the only one."},
                    ],
                    "further_practice": [
                        "Cut an orange into 6 equal pieces. What fraction does 2 pieces represent?",
                        "At the market, buy 1 1/2 kg of beans. Write this as an improper fraction.",
                    ],
                },
                word_count=1500,
                reading_level=5.5,
                version=1,
                status=LessonStatus.approved,
                published_at=datetime.now(timezone.utc),
            )
            db.add(lesson1)
            await db.flush()

            # ---- Sample quiz ----
            quiz1 = Quiz(
                topic_id=topic1.id,
                lesson_id=lesson1.id,
                title="Fractions Basics Quiz",
                questions_json=[
                    {
                        "question": "What is the numerator in the fraction 3/5?",
                        "options": ["3", "5", "8", "15"],
                        "correct_index": 0,
                        "explanation": "The numerator is the top number, which is 3.",
                        "difficulty": "beginner",
                    },
                    {
                        "question": "Mama Wambui has 2/3 of a cake. She gives 1/3 to her neighbour. How much cake does she have left?",
                        "options": ["1/3", "1/2", "2/3", "1/6"],
                        "correct_index": 0,
                        "explanation": "2/3 - 1/3 = 1/3. She has 1/3 of the cake left.",
                        "difficulty": "beginner",
                    },
                    {
                        "question": "Which fraction is equivalent to 1/2?",
                        "options": ["2/3", "3/6", "4/5", "1/4"],
                        "correct_index": 1,
                        "explanation": "3/6 = 1/2 because 3 divided by 6 equals 0.5.",
                        "difficulty": "intermediate",
                    },
                ],
                passing_score=70,
                version=1,
                status=QuizStatus.approved,
            )
            db.add(quiz1)

            # ---- Sample flashcards ----
            flashcards = [
                Flashcard(topic_id=topic1.id, lesson_id=lesson1.id, front="What is a fraction?", back="A fraction is a number representing a part of a whole, written as two numbers separated by a line (e.g., 3/4).", difficulty=Difficulty.beginner, tags=["definition", "basics"]),
                Flashcard(topic_id=topic1.id, lesson_id=lesson1.id, front="What is the numerator?", back="The numerator is the top number in a fraction, telling us how many parts we have.", difficulty=Difficulty.beginner, tags=["terminology"]),
                Flashcard(topic_id=topic1.id, lesson_id=lesson1.id, front="What is a proper fraction?", back="A proper fraction has a numerator smaller than the denominator (e.g., 2/5). It represents less than one whole.", difficulty=Difficulty.intermediate, tags=["types"]),
                Flashcard(topic_id=topic1.id, lesson_id=lesson1.id, front="Give a real-life example of an improper fraction from Kenya.", back="If 5 matatu seats are shared among 3 families equally, each family gets 5/3 seats worth - an improper fraction representing more than one whole.", difficulty=Difficulty.advanced, tags=["application", "kenya"]),
            ]
            db.add_all(flashcards)

            # ---- Sample practice questions ----
            practice_qs = [
                PracticeQuestion(
                    topic_id=topic1.id,
                    lesson_id=lesson1.id,
                    question_text="A farmer at Wakulima Market divides 3/4 of his mangoes equally among 4 children. What fraction does each child get?",
                    question_type=QuestionType.multiple_choice,
                    options=["3/16", "3/4", "4/3", "1/4"],
                    correct_answer="3/16",
                    explanation="3/4 ÷ 4 = 3/4 × 1/4 = 3/16 of the mangoes.",
                    difficulty=Difficulty.intermediate,
                    hints=["Think about what dividing by 4 means.", "Dividing by 4 is the same as multiplying by 1/4."],
                ),
                PracticeQuestion(
                    topic_id=topic1.id,
                    lesson_id=lesson1.id,
                    question_text="True or False: 4/4 is an improper fraction.",
                    question_type=QuestionType.true_false,
                    options=["True", "False"],
                    correct_answer="True",
                    explanation="4/4 is an improper fraction because the numerator equals the denominator. It equals 1 whole.",
                    difficulty=Difficulty.beginner,
                    hints=["An improper fraction has numerator ≥ denominator."],
                ),
            ]
            db.add_all(practice_qs)

        await db.commit()
        print("Seed completed successfully!")
        print(f"  - {len(CBC_SUBJECTS)} subjects")
        print(f"  - Admin user: {ADMIN_PHONE} / {ADMIN_PASSWORD}")
        print("  - Sample student: +254711111111 / student123")
        print("  - Sample mathematics material, topics, lesson, quiz, flashcards, practice questions")


if __name__ == "__main__":
    asyncio.run(seed())
