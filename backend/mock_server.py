"""SomaPace Mock API Server — demo data for design preview, no DB/Redis needed."""

import uuid
from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="SomaPace Mock API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── helpers ────────────────────────────────────────────────────────────────
def uid(): return str(uuid.uuid4())
NOW = datetime.utcnow().isoformat() + "Z"

# ── sample data ────────────────────────────────────────────────────────────
SUBJECTS = [
    {"id": "sub-1", "name": "Mathematics", "slug": "mathematics", "icon": "📐", "color": "#2563eb"},
    {"id": "sub-2", "name": "English", "slug": "english", "icon": "📖", "color": "#16a34a"},
    {"id": "sub-3", "name": "Kiswahili", "slug": "kiswahili", "icon": "🗣️", "color": "#f59e0b"},
    {"id": "sub-4", "name": "Integrated Science", "slug": "integrated-science", "icon": "🔬", "color": "#dc2626"},
    {"id": "sub-5", "name": "Social Studies", "slug": "social-studies", "icon": "🌍", "color": "#7c3aed"},
    {"id": "sub-6", "name": "Creative Arts", "slug": "creative-arts", "icon": "🎨", "color": "#ec4899"},
    {"id": "sub-7", "name": "Physical Education", "slug": "physical-education", "icon": "🏃", "color": "#0891b2"},
]

TOPICS = [
    {"id": "tp-1", "subjectId": "sub-4", "title": "Photosynthesis", "difficulty": "beginner", "subtopics": ["Chlorophyll", "Light reaction", "Dark reaction"], "lessonCount": 1, "quizCount": 1, "flashcardCount": 20, "practiceCount": 10, "progress": 0},
    {"id": "tp-2", "subjectId": "sub-4", "title": "The Human Digestive System", "difficulty": "beginner", "subtopics": ["Mouth & Oesophagus", "Stomach", "Small intestine", "Large intestine"], "lessonCount": 1, "quizCount": 1, "flashcardCount": 15, "practiceCount": 10, "progress": 0},
    {"id": "tp-3", "subjectId": "sub-1", "title": "Fractions", "difficulty": "beginner", "subtopics": ["Proper fractions", "Improper fractions", "Mixed numbers", "Operations"], "lessonCount": 1, "quizCount": 1, "flashcardCount": 15, "practiceCount": 10, "progress": 65},
    {"id": "tp-4", "subjectId": "sub-1", "title": "Decimals", "difficulty": "intermediate", "subtopics": ["Place value", "Operations with decimals", "Converting fractions"], "lessonCount": 1, "quizCount": 1, "flashcardCount": 15, "practiceCount": 10, "progress": 30},
    {"id": "tp-5", "subjectId": "sub-2", "title": "Reading Comprehension", "difficulty": "intermediate", "subtopics": ["Main idea", "Inference", "Vocabulary in context"], "lessonCount": 1, "quizCount": 1, "flashcardCount": 12, "practiceCount": 8, "progress": 0},
    {"id": "tp-6", "subjectId": "sub-5", "title": "County Governments in Kenya", "difficulty": "beginner", "subtopics": ["Functions of counties", "County assemblies", "Revenue"], "lessonCount": 1, "quizCount": 1, "flashcardCount": 15, "practiceCount": 10, "progress": 0},
    {"id": "tp-7", "subjectId": "sub-4", "title": "States of Matter", "difficulty": "beginner", "subtopics": ["Solids", "Liquids", "Gases", "Changes of state"], "lessonCount": 1, "quizCount": 1, "flashcardCount": 12, "practiceCount": 10, "progress": 100},
    {"id": "tp-8", "subjectId": "sub-1", "title": "Algebra Basics", "difficulty": "intermediate", "subtopics": ["Variables", "Expressions", "Simple equations"], "lessonCount": 1, "quizCount": 1, "flashcardCount": 15, "practiceCount": 10, "progress": 0},
]

LESSON = {
    "id": "les-1",
    "topicId": "tp-1",
    "title": "Photosynthesis: How Plants Make Their Own Food",
    "wordCount": 1847,
    "readingLevel": 6.8,
    "estimatedMinutes": 8,
    "sections": [
        {
            "type": "hook",
            "title": "A Surprising Fact",
            "content": "Did you know that a single large tree can produce enough oxygen for two people to breathe for an entire year? Right now, in your school compound, the mango and jacaranda trees are busy making food — not for themselves, but for the air you breathe! Today, we are going to discover the amazing process plants use to turn sunlight into food. It is called **photosynthesis**, and without it, life on Earth would not exist."
        },
        {
            "type": "objectives",
            "title": "What You Will Learn",
            "items": [
                "Explain what photosynthesis is and why it matters",
                "Identify the three ingredients plants need: sunlight, water, and carbon dioxide",
                "Describe the role of chlorophyll in leaves",
                "Distinguish between the light reaction and the dark reaction",
                "Give real-life examples of photosynthesis in Kenya"
            ]
        },
        {
            "type": "explanation",
            "title": "What Is Photosynthesis?",
            "subsections": [
                {
                    "heading": "The Recipe for Plant Food",
                    "content": "Imagine you are making ugali. You need water, maize flour, and heat from the jiko. Plants make food in a very similar way! They mix **water** (absorbed through their roots), **carbon dioxide** (a gas they breathe in through tiny holes in their leaves called stomata), and **sunlight** (captured by a special green pigment). The result? **Glucose** — a type of sugar that gives the plant energy — and **oxygen**, which they release into the air. The chemical equation for this is: **6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂**. That means six molecules of carbon dioxide plus six molecules of water, powered by sunlight, produce one molecule of glucose and six molecules of oxygen!"
                },
                {
                    "heading": "Chlorophyll: The Green Kitchen Worker",
                    "content": "Inside every leaf cell, there are tiny structures called **chloroplasts**. These are like little green kitchens where photosynthesis happens. Chloroplasts contain **chlorophyll** — the green pigment that absorbs sunlight. This is why most leaves are green! Chlorophyll captures light energy mainly from the red and blue parts of the light spectrum and uses it to power the chemical reactions. Have you ever wondered why leaves change colour in cold countries? In places like the Maasai Mara during dry season, some leaves turn yellow or brown because chlorophyll breaks down, revealing other pigments hidden underneath."
                },
                {
                    "heading": "Two Stages: Light Reaction and Dark Reaction",
                    "content": "Photosynthesis does not happen in one step — it has two main stages:\n\n**1. The Light Reaction** (happens in the thylakoid membranes)\nThis stage needs sunlight directly. Water molecules are split apart using light energy, releasing oxygen gas as a by-product. The light energy is converted into chemical energy carriers called ATP and NADPH. Think of ATP as a fully charged Safaricom power bank — it stores energy the plant can use later.\n\n**2. The Dark Reaction / Calvin Cycle** (happens in the stroma)\nDespite its name, the dark reaction does not need darkness — it just does not need light directly. It uses the ATP and NADPH from the light reaction to combine carbon dioxide into glucose. This is like using the energy from your power bank to cook a meal. The Calvin Cycle takes three turns to produce one molecule of a three-carbon sugar, and after six turns, you have one molecule of glucose!"
                }
            ]
        },
        {
            "type": "worked_example",
            "title": "Worked Example: Tracing the Journey",
            "content": "Let us follow the journey of a water molecule in a maize plant in Nakuru County:\n\n1. **Absorption**: The water molecule enters through the roots of the maize plant as the farmer irrigates the field.\n2. **Transport**: It travels up through the stem (xylem vessels) like water moving through a pipe, reaching the leaves.\n3. **Arrival at the chloroplast**: The molecule reaches a chloroplast in a leaf cell.\n4. **Light reaction**: Sunlight hits the chlorophyll. The water molecule is split: 2H₂O → 4H⁺ + 4e⁻ + O₂. Our oxygen atom joins another to form O₂ and floats out through the stomata.\n5. **Dark reaction**: The energy carriers (ATP, NADPH) from the light reaction power the Calvin Cycle. Carbon dioxide from the air is fixed into glucose.\n6. **Transport of food**: The glucose travels via the phloem to other parts of the plant — to the growing maize kernels, the roots, and the new leaves.\n\nThis entire process happens every day, every hour, in millions of leaves across Kenyan farms!"
        },
        {
            "type": "kenyan_application",
            "title": "Photosynthesis in Our Daily Lives",
            "content": "Photosynthesis affects you every day! When you walk through Uhuru Park or Karura Forest, the trees are producing oxygen for you to breathe. In agriculture, Kenyan farmers in the Rift Valley know that crops need adequate sunlight to grow well. This is why spacing of crops matters — if maize plants are too crowded, their leaves block sunlight from each other, reducing photosynthesis and lowering yields.\n\nGreenhouse farming, which is popular in Naivasha for growing flowers and tomatoes, controls the amount of sunlight and CO₂ entering the structure to maximise photosynthesis. Some greenhouses even add extra CO₂ to speed up plant growth!\n\nHydroponics — growing plants without soil, using nutrient-rich water — is becoming popular in Nairobi. Even in these modern farms, photosynthesis is the engine driving plant growth."
        },
        {
            "type": "diagram",
            "title": "How Photosynthesis Works",
            "mermaid": "graph TD\n    SUN[☀️ Sunlight] --> CHL[Chloroplast in Leaf]\n    WATER[💧 Water from roots] --> CHL\n    CO2[🫧 Carbon Dioxide from air] --> CHL\n    CHL --> GLUCOSE[🍬 Glucose — plant food]\n    CHL --> OXY[💨 Oxygen released into air]\n\n    style CHL fill:#16a34a,color:#fff\n    style SUN fill:#f59e0b,color:#fff\n    style WATER fill:#2563eb,color:#fff\n    style GLUCOSE fill:#ec4899,color:#fff"
        },
        {
            "type": "misconceptions",
            "title": "Common Misconceptions",
            "items": [
                {
                    "misconception": "\"Plants only photosynthesise during the day.\"",
                    "correction": "Plants perform the light reaction only when light is available, but the dark reaction (Calvin Cycle) can continue for a short time in the dark using stored ATP. However, at night, plants actually consume oxygen through respiration — just like humans!"
                },
                {
                    "misconception": "\"Plants get their food from the soil.\"",
                    "correction": "Plants absorb water and minerals from the soil, but their actual food (glucose) is made through photosynthesis in the leaves. The soil provides raw materials, not the finished meal."
                },
                {
                    "misconception": "\"Only green plants can photosynthesise.\"",
                    "correction": "Some bacteria (like cyanobacteria in Lake Nakuru) and algae also photosynthesise. Even some protists like Euglena contain chlorophyll and can make their own food!"
                }
            ]
        },
        {
            "type": "summary",
            "title": "Let Us Recap",
            "content": "Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. It happens in chloroplasts, which contain the green pigment chlorophyll. The process has two stages: the light reaction (which needs sunlight and produces oxygen) and the dark reaction or Calvin Cycle (which uses stored energy to make glucose). Without photosynthesis, there would be no oxygen to breathe and no food chains on Earth. In Kenya, photosynthesis is at work in our forests, farms, and even greenhouses!"
        },
        {
            "type": "recap_quiz",
            "title": "Quick Recap Quiz",
            "questions": [
                {"question": "What are the three main ingredients needed for photosynthesis?", "options": ["Water, sugar, and oxygen", "Sunlight, water, and carbon dioxide", "Sunlight, soil, and oxygen", "Carbon dioxide, nitrogen, and water"], "correctIndex": 1, "explanation": "Plants need sunlight, water, and carbon dioxide to make glucose through photosynthesis."},
                {"question": "Where does photosynthesis take place inside a plant cell?", "options": ["Nucleus", "Mitochondria", "Chloroplast", "Ribosome"], "correctIndex": 2, "explanation": "Chloroplasts contain chlorophyll and are the sites where photosynthesis occurs."},
                {"question": "What gas do plants release during photosynthesis?", "options": ["Carbon dioxide", "Nitrogen", "Hydrogen", "Oxygen"], "correctIndex": 3, "explanation": "Oxygen is released as a by-product when water molecules are split during the light reaction."},
                {"question": "What is the green pigment in plants called?", "options": ["Haemoglobin", "Chlorophyll", "Carotene", "Melanin"], "correctIndex": 1, "explanation": "Chlorophyll absorbs sunlight and gives leaves their green colour."},
                {"question": "Which reaction does NOT need sunlight directly?", "options": ["Light reaction", "Calvin Cycle", "Both need sunlight", "Neither needs sunlight"], "correctIndex": 1, "explanation": "The Calvin Cycle (dark reaction) uses ATP and NADPH from the light reaction but does not directly need sunlight."}
            ]
        }
    ],
    "createdAt": NOW
}

QUIZ = {
    "id": "quiz-1",
    "topicId": "tp-1",
    "title": "Photosynthesis Assessment",
    "timeLimitSeconds": 900,
    "passingScore": 70,
    "questions": [
        {"id": "q1", "question": "What is the primary function of chlorophyll?", "options": ["Absorb water", "Absorb sunlight", "Release carbon dioxide", "Store glucose"], "correctIndex": 1, "explanation": "Chlorophyll absorbs light energy, primarily from red and blue wavelengths, to power photosynthesis."},
        {"id": "q2", "question": "In which part of the leaf does photosynthesis mainly occur?", "options": ["Epidermis", "Mesophyll", "Xylem", "Root tip"], "correctIndex": 1, "explanation": "The mesophyll cells are packed with chloroplasts and are the main site of photosynthesis."},
        {"id": "q3", "question": "What is produced during the light reaction of photosynthesis?", "options": ["Glucose only", "Oxygen and ATP", "Carbon dioxide", "Starch"], "correctIndex": 1, "explanation": "The light reaction splits water to produce oxygen, ATP, and NADPH."},
        {"id": "q4", "question": "The Calvin Cycle uses which of the following?", "options": ["Sunlight directly", "Water only", "ATP and NADPH from the light reaction", "Oxygen and glucose"], "correctIndex": 2, "explanation": "The Calvin Cycle uses ATP and NADPH to fix carbon dioxide into glucose."},
        {"id": "q5", "question": "What would happen if all plants on Earth disappeared?", "options": ["Nothing would change", "There would be more oxygen", "Oxygen levels would drop and food chains would collapse", "Carbon dioxide levels would decrease"], "correctIndex": 2, "explanation": "Plants produce oxygen and form the base of most food chains. Without them, life would be impossible."},
        {"id": "q6", "question": "Why is crop spacing important in Kenyan agriculture?", "options": ["To prevent soil erosion", "To ensure each plant gets enough sunlight for photosynthesis", "To reduce water usage", "To prevent insect attacks"], "correctIndex": 1, "explanation": "Proper spacing ensures leaves do not block each other's sunlight, maximising photosynthesis and yield."},
        {"id": "q7", "question": "Where does the Calvin Cycle take place?", "options": ["Thylakoid membrane", "Stroma of the chloroplast", "Cytoplasm", "Nucleus"], "correctIndex": 1, "explanation": "The Calvin Cycle occurs in the stroma, the fluid-filled space inside the chloroplast."},
        {"id": "q8", "question": "What is the chemical formula for glucose?", "options": ["C₆H₁₂O₆", "C₆H₁₀O₅", "CO₂", "H₂O"], "correctIndex": 0, "explanation": "Glucose has the formula C₆H₁₂O₆ — it is a six-carbon sugar."},
        {"id": "q9", "question": "At night, plants mainly:", "options": ["Continue photosynthesis", "Perform respiration, consuming oxygen", "Release carbon dioxide only", "Become dormant"], "correctIndex": 1, "explanation": "At night, plants cannot photosynthesise but continue cellular respiration, using oxygen and releasing CO₂."},
        {"id": "q10", "question": "Greenhouses in Naivasha are designed to maximise which process?", "options": ["Respiration", "Transpiration", "Photosynthesis", "Fermentation"], "correctIndex": 2, "explanation": "Greenhouses control sunlight, temperature, and CO₂ levels to maximise photosynthesis and crop growth."}
    ],
    "createdAt": NOW
}

FLASHCARDS = [
    {"id": "fc-1", "front": "What is photosynthesis?", "back": "The process by which plants convert sunlight, water, and CO₂ into glucose and oxygen.", "difficulty": "beginner", "tags": ["definition", "core-concept"]},
    {"id": "fc-2", "front": "What is chlorophyll?", "back": "A green pigment in chloroplasts that absorbs sunlight for photosynthesis.", "difficulty": "beginner", "tags": ["vocabulary"]},
    {"id": "fc-3", "front": "What are the three ingredients of photosynthesis?", "back": "Sunlight, water (H₂O), and carbon dioxide (CO₂).", "difficulty": "beginner", "tags": ["key-fact"]},
    {"id": "fc-4", "front": "What is the chemical equation for photosynthesis?", "back": "6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂", "difficulty": "intermediate", "tags": ["equation"]},
    {"id": "fc-5", "front": "Where does photosynthesis occur in a plant cell?", "back": "In the chloroplasts.", "difficulty": "beginner", "tags": ["location"]},
    {"id": "fc-6", "front": "What are stomata?", "back": "Tiny holes on the surface of leaves that allow gas exchange (CO₂ in, O₂ out).", "difficulty": "beginner", "tags": ["vocabulary"]},
    {"id": "fc-7", "front": "What is the light reaction?", "back": "The first stage of photosynthesis where sunlight splits water to produce O₂, ATP, and NADPH.", "difficulty": "intermediate", "tags": ["process"]},
    {"id": "fc-8", "front": "What is the Calvin Cycle?", "back": "The second stage of photosynthesis (dark reaction) where ATP and NADPH are used to make glucose from CO₂.", "difficulty": "intermediate", "tags": ["process"]},
    {"id": "fc-9", "front": "What is ATP?", "back": "Adenosine triphosphate — an energy carrier molecule, like a charged battery for cells.", "difficulty": "intermediate", "tags": ["vocabulary"]},
    {"id": "fc-10", "front": "Why are most leaves green?", "back": "Because they contain chlorophyll, which absorbs red and blue light but reflects green light.", "difficulty": "beginner", "tags": ["concept"]},
    {"id": "fc-11", "front": "Do plants photosynthesise at night?", "back": "No — the light reaction needs sunlight. At night, plants respire and consume oxygen instead.", "difficulty": "intermediate", "tags": ["misconception"]},
    {"id": "fc-12", "front": "What is the role of CO₂ in photosynthesis?", "back": "CO₂ provides the carbon atoms needed to build glucose during the Calvin Cycle.", "difficulty": "intermediate", "tags": ["key-fact"]},
    {"id": "fc-13", "front": "Why is crop spacing important for photosynthesis?", "back": "It prevents leaves from blocking each other's sunlight, ensuring maximum photosynthesis and yield.", "difficulty": "beginner", "tags": ["application"]},
    {"id": "fc-14", "front": "What are stomata?", "back": "Microscopic pores on leaf surfaces that allow carbon dioxide to enter and oxygen to exit.", "difficulty": "beginner", "tags": ["vocabulary"]},
    {"id": "fc-15", "front": "What happens during the Calvin Cycle?", "back": "Carbon dioxide is 'fixed' into glucose using ATP and NADPH energy from the light reaction.", "difficulty": "intermediate", "tags": ["process"]},
    {"id": "fc-16", "front": "What is glucose used for by plants?", "back": "Energy (through respiration), growth, and storage as starch.", "difficulty": "beginner", "tags": ["application"]},
    {"id": "fc-17", "front": "Name two human activities that affect photosynthesis.", "back": "Deforestation (fewer trees to photosynthesise) and pollution (blocks sunlight, damages leaves).", "difficulty": "intermediate", "tags": ["application"]},
    {"id": "fc-18", "front": "What is transpiration?", "back": "The loss of water vapour from leaves through stomata — related to photosynthesis because it drives water flow.", "difficulty": "intermediate", "tags": ["related-concept"]},
    {"id": "fc-19", "front": "How do greenhouses increase photosynthesis?", "back": "By controlling temperature, sunlight, and adding extra CO₂ to boost plant growth.", "difficulty": "intermediate", "tags": ["application"]},
    {"id": "fc-20", "front": "What is the difference between the light reaction and the dark reaction?", "back": "Light reaction needs sunlight directly (produces O₂, ATP, NADPH). Dark reaction uses those products to make glucose (does not need light directly).", "difficulty": "intermediate", "tags": ["comparison"]},
]

PRACTICE = [
    {"id": "pq-1", "question": "A plant is placed in a sealed jar with sunlight. After several hours, what gas accumulates in the jar?", "type": "multiple_choice", "options": ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], "correctAnswer": "Oxygen", "explanation": "Plants release oxygen as a by-product of photosynthesis.", "difficulty": "beginner", "hint": "Think about what plants release into the air."},
    {"id": "pq-2", "question": "If you cover a leaf with black paper, what will happen to photosynthesis in that leaf?", "type": "multiple_choice", "options": ["It will increase", "It will decrease or stop", "It will not change", "The leaf will turn yellow immediately"], "correctAnswer": "It will decrease or stop", "explanation": "Light is essential for the light reaction. Without it, photosynthesis cannot proceed.", "difficulty": "beginner", "hint": "What does the light reaction need?"},
    {"id": "pq-3", "question": "Why do farmers in Kenya plant maize in rows with spaces between them?", "type": "multiple_choice", "options": ["To save water", "To allow sunlight to reach lower leaves for photosynthesis", "To prevent weeds", "To allow root growth only"], "correctAnswer": "To allow sunlight to reach lower leaves for photosynthesis", "explanation": "Proper spacing maximises light interception, improving photosynthesis and crop yield.", "difficulty": "intermediate", "hint": "Think about how leaves compete for sunlight."},
    {"id": "pq-4", "question": "Explain in your own words why photosynthesis is important for humans.", "type": "short_answer", "correctAnswer": "Humans depend on photosynthesis for oxygen to breathe and for food (directly from plants or indirectly from animals that eat plants).", "explanation": "Photosynthesis produces oxygen and glucose, forming the base of all food chains.", "difficulty": "intermediate", "hint": "Think about what we breathe and what we eat."},
    {"id": "pq-5", "question": "True or False: Plants only photosynthesise in greenhouses.", "type": "true_false", "correctAnswer": "False", "explanation": "Photosynthesis happens in all green parts of plants everywhere, not just in greenhouses.", "difficulty": "beginner", "hint": "Do plants only grow in greenhouses?"},
    {"id": "pq-6", "question": "What would happen to photosynthesis if the concentration of CO₂ in the air doubled?", "type": "multiple_choice", "options": ["Photosynthesis would stop", "Photosynthesis would increase (up to a limit)", "Nothing would change", "Plants would die immediately"], "correctAnswer": "Photosynthesis would increase (up to a limit)", "explanation": "More CO₂ provides more raw material for the Calvin Cycle, boosting photosynthesis until another factor becomes limiting.", "difficulty": "advanced", "hint": "Think about what limiting factors do."},
    {"id": "pq-7", "question": "Identify the parts labelled A, B, C, C, D in a chloroplast diagram: A = outer membrane, B = thylakoid, C = stroma, D = granum.", "type": "multiple_choice", "options": ["A = nucleus, B = ribosome, C = cytoplasm, D = membrane", "A = outer membrane, B = thylakoid, C = stroma, D = granum", "A = cell wall, B = chloroplast, C = nucleus, D = vacuole", "A = stroma, B = granum, C = thylakoid, D = outer membrane"], "correctAnswer": "A = outer membrane, B = thylakoid, C = stroma, D = granum", "explanation": "The thylakoid is where the light reaction occurs, and the stroma is where the Calvin Cycle takes place.", "difficulty": "intermediate", "hint": "Remember the two stages of photosynthesis happen in different parts."},
    {"id": "pq-8", "question": "A farmer in Nakuru notices her tomato plants have yellow leaves. Using your knowledge of photosynthesis, suggest two possible causes.", "type": "short_answer", "correctAnswer": "Chlorophyll deficiency (possibly due to lack of nitrogen or magnesium in soil) or insufficient sunlight.", "explanation": "Yellow leaves suggest chlorophyll breakdown, which can be caused by nutrient deficiency or poor light conditions.", "difficulty": "advanced", "hint": "What makes leaves green?"},
    {"id": "pq-9", "question": "If you place an aquatic plant (like Elodea) in water and measure bubbles coming out in sunlight, what gas are the bubbles mostly?", "type": "multiple_choice", "options": ["Carbon dioxide", "Nitrogen", "Oxygen", "Water vapour"], "correctAnswer": "Oxygen", "explanation": "The bubbles are oxygen released during the light reaction of photosynthesis.", "difficulty": "beginner", "hint": "What gas do plants release?"},
    {"id": "pq-10", "question": "True or False: The dark reaction of photosynthesis only happens at night.", "type": "true_false", "correctAnswer": "False", "explanation": "The dark reaction (Calvin Cycle) does not need light directly, but it usually happens during the day when ATP and NADPH from the light reaction are available.", "difficulty": "intermediate", "hint": "The name 'dark reaction' is misleading!"},
]

# ── demo user ──────────────────────────────────────────────────────────────
DEMO_USER = {
    "id": uid(),
    "firstName": "Amina",
    "lastName": "Wanjiku",
    "fullName": "Amina Wanjiku",
    "phone": "+254712345678",
    "phoneNumber": "+254712345678",
    "email": "amina@example.com",
    "role": "student",
    "grade": 7,
    "subjects": ["sub-1", "sub-4", "sub-5"],
    "xp": 4850,
    "streak": 12,
    "level": 9,
    "onboardingComplete": True,
    "createdAt": NOW,
}

ADMIN_USER = {
    "id": uid(),
    "firstName": "Admin",
    "lastName": "User",
    "fullName": "Admin User",
    "phone": "+254700000000",
    "phoneNumber": "+254700000000",
    "email": "admin@somapace.co.ke",
    "role": "admin",
    "grade": 10,
    "subjects": ["sub-1", "sub-2", "sub-3", "sub-4", "sub-5", "sub-6", "sub-7"],
    "xp": 0,
    "streak": 0,
    "level": 1,
    "onboardingComplete": True,
    "createdAt": NOW,
}

# ── routes ─────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "somapace-api-mock", "version": "1.0.0"}


# ── Auth ───────────────────────────────────────────────────────────────────

@app.post("/api/v1/auth/register")
async def register(body: dict):
    return {
        "user": DEMO_USER,
        "token": "demo-token-mock-12345",
        "refreshToken": "demo-refresh-mock-12345",
    }

@app.post("/api/v1/auth/login")
async def login(body: dict):
    phone = body.get("phoneNumber", "")
    if phone == "+254700000000":
        return {"user": ADMIN_USER, "token": "demo-admin-token-12345", "refreshToken": "demo-admin-refresh-12345"}
    return {"user": DEMO_USER, "token": "demo-token-mock-12345", "refreshToken": "demo-refresh-mock-12345"}

@app.get("/api/v1/auth/me")
async def me():
    return DEMO_USER

@app.put("/api/v1/auth/me")
async def update_me(body: dict):
    return {**DEMO_USER, **body}


# ── Subjects / Topics ─────────────────────────────────────────────────────

@app.get("/api/v1/subjects")
async def list_subjects():
    return SUBJECTS

@app.get("/api/v1/topics")
async def list_topics(grade: int = 7, subjectId: str | None = None):
    topics = TOPICS
    if subjectId:
        topics = [t for t in topics if t["subjectId"] == subjectId]
    return topics

@app.get("/api/v1/topics/{topic_id}")
async def get_topic(topic_id: str):
    t = next((t for t in TOPICS if t["id"] == topic_id), TOPICS[0])
    return t


# ── Lessons ────────────────────────────────────────────────────────────────

@app.get("/api/v1/topics/{topic_id}/lesson")
async def get_lesson(topic_id: str):
    return LESSON


# ── Quizzes ────────────────────────────────────────────────────────────────

@app.get("/api/v1/topics/{topic_id}/quiz")
async def get_quiz(topic_id: str):
    return QUIZ


# ── Flashcards ─────────────────────────────────────────────────────────────

@app.get("/api/v1/topics/{topic_id}/flashcards")
async def get_flashcards(topic_id: str):
    return FLASHCARDS


# ── Practice ───────────────────────────────────────────────────────────────

@app.get("/api/v1/topics/{topic_id}/practice")
async def get_practice(topic_id: str):
    return PRACTICE


# ── Student Dashboard ─────────────────────────────────────────────────────

@app.get("/api/v1/student/dashboard")
async def student_dashboard():
    return {
        "user": {
            "fullName": DEMO_USER["fullName"],
            "firstName": DEMO_USER["firstName"],
            "grade": DEMO_USER["grade"],
            "streak": DEMO_USER["streak"],
            "xp": DEMO_USER["xp"],
            "level": DEMO_USER["level"],
        },
        "continueLearning": {"id": "tp-3", "title": "Fractions", "subject": "Mathematics", "progress": 65},
        "recommendation": {"topicId": "tp-1", "title": "Photosynthesis", "minutes": 8, "subject": "Integrated Science"},
        "weakTopics": [
            {"id": "tp-4", "title": "Decimals", "subject": "Mathematics", "progress": 30},
            {"id": "tp-5", "title": "Reading Comprehension", "subject": "English", "progress": 40},
        ],
        "recentActivity": [
            {"id": uid(), "type": "lesson_complete", "title": "Fractions — Proper & Improper", "at": "2026-09-14T10:30:00Z", "subject": "Mathematics"},
            {"id": uid(), "type": "quiz_attempt", "title": "Fractions Quiz", "at": "2026-09-13T15:45:00Z", "subject": "Mathematics"},
            {"id": uid(), "type": "flashcard_review", "title": "States of Matter flashcards", "at": "2026-09-13T14:20:00Z", "subject": "Integrated Science"},
            {"id": uid(), "type": "lesson_complete", "title": "Decimals — Place Value", "at": "2026-09-12T09:15:00Z", "subject": "Mathematics"},
        ],
        "weeklyMinutes": [35, 20, 45, 10, 30, 25, 25],
        "badges": [
            {"id": "b1", "name": "Science Starter", "emoji": "🔬", "earnedAt": "2026-09-01T00:00:00Z"},
            {"id": "b2", "name": "Streak Master", "emoji": "🔥", "earnedAt": "2026-09-10T00:00:00Z"},
            {"id": "b3", "name": "Quiz Champion", "emoji": "🏆", "earnedAt": "2026-09-12T00:00:00Z"},
        ],
    }


# ── Onboarding ─────────────────────────────────────────────────────────────

@app.post("/api/v1/student/onboarding")
async def onboarding(body: dict):
    return {"status": "complete", "message": "Onboarding completed successfully"}

@app.post("/api/v1/student/diagnostic")
async def diagnostic(body: dict):
    return {
        "level": "intermediate",
        "results": {
            "Mathematics": {"level": "intermediate", "score": 72},
            "English": {"level": "beginner", "score": 55},
            "Integrated Science": {"level": "beginner", "score": 68},
        },
        "recommendation": "You are doing well in Maths and Science. Let us focus on strengthening your English reading skills!",
    }


# ── Progress ───────────────────────────────────────────────────────────────

@app.post("/api/v1/student/progress")
async def record_progress(body: dict):
    return {"status": "recorded", "id": uid()}

@app.get("/api/v1/student/progress")
async def get_progress(topicId: str | None = None):
    return {
        "topicId": topicId,
        "lessonsCompleted": 2,
        "quizzesTaken": 1,
        "averageScore": 78,
        "flashcardsReviewed": 15,
        "totalMinutes": 45,
    }

@app.get("/api/v1/student/flashcards/review")
async def get_review_cards():
    return [c for c in FLASHCARDS[:5]]

@app.post("/api/v1/student/flashcards/{card_id}/review")
async def review_card(card_id: str, body: dict):
    return {"status": "updated", "nextReview": (datetime.utcnow() + timedelta(days=3)).isoformat() + "Z"}


# ── Payments ───────────────────────────────────────────────────────────────

@app.post("/api/v1/payments/init")
async def init_payment(body: dict):
    return {
        "status": "pending",
        "checkoutRequestId": "ws_CO_123456789",
        "message": "STK push sent to +254712345678",
    }

@app.post("/api/v1/payments/callback")
async def mpesa_callback(body: dict):
    return {"ResultCode": 0, "ResultDesc": "Success"}

@app.get("/api/v1/payments/subscription")
async def get_subscription():
    return {
        "isActive": True,
        "plan": "annual",
        "startDate": (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z",
        "endDate": (datetime.utcnow() + timedelta(days=335)).isoformat() + "Z",
        "amountKes": 700,
    }


# ── Frontend-compatible aliases ────────────────────────────────────────────

@app.get("/api/v1/dashboard")
async def dashboard_alias():
    return await student_dashboard()

@app.post("/api/v1/payments/initiate")
async def initiate_payment_alias(body: dict):
    return await init_payment(body)

@app.get("/api/v1/payments/{order_id}/status")
async def payment_status_alias(order_id: str):
    return await get_subscription()

@app.post("/api/v1/lessons/{lesson_id}/progress")
async def lesson_progress_alias(lesson_id: str, body: dict):
    return {"xpEarned": 50, "status": "recorded"}

@app.post("/api/v1/quizzes/{quiz_id}/submit")
async def quiz_submit_alias(quiz_id: str, body: dict):
    answers = body.get("answers", {})
    correct = sum(1 for i, ans in answers.items() if i < len(QUIZ["questions"]) and ans == QUIZ["questions"][i]["correctIndex"])
    total = len(QUIZ["questions"])
    score = int((correct / total) * 100) if total else 0
    return {
        "score": score,
        "passed": score >= QUIZ["passingScore"],
        "xpEarned": score * 2,
        "explanations": [
            {"questionIndex": i, "correct": answers.get(i) == QUIZ["questions"][i]["correctIndex"], "explanation": QUIZ["questions"][i]["explanation"]}
            for i in range(total)
        ],
    }

@app.patch("/api/v1/flashcards/{card_id}/review")
async def flashcard_review_alias(card_id: str, body: dict):
    return await review_card(card_id, body)


# ── Admin ──────────────────────────────────────────────────────────────────

@app.get("/api/v1/admin/dashboard")
async def admin_dashboard():
    return {
        "totalUsers": 1247,
        "activeUsersToday": 312,
        "totalMaterials": 45,
        "lessonsGenerated": 189,
        "quizzesGenerated": 156,
        "totalRevenue": 523600,
        "monthlyGrowth": 18.5,
        "recentUsers": [
            {"name": "Faith Akinyi", "grade": 7, "joined": "2026-09-14"},
            {"name": "Brian Kipchoge", "grade": 5, "joined": "2026-09-14"},
            {"name": "Grace Muthoni", "grade": 9, "joined": "2026-09-13"},
        ],
        "topLessons": [
            {"title": "Photosynthesis", "views": 342, "avgScore": 81},
            {"title": "Fractions", "views": 289, "avgScore": 76},
            {"title": "The Human Digestive System", "views": 215, "avgScore": 72},
        ],
        "generationQueue": [
            {"id": uid(), "topic": "Algebra Basics", "status": "in_progress", "startedAt": NOW},
            {"id": uid(), "topic": "Reading Comprehension", "status": "queued", "queuedAt": NOW},
        ],
    }

@app.get("/api/v1/admin/materials")
async def list_materials():
    return [
        {"id": uid(), "filename": "biology_g7_ch3.pdf", "grade": 7, "subject": "Integrated Science", "status": "processed", "topicsCount": 4, "uploadedAt": "2026-09-10"},
        {"id": uid(), "filename": "math_g7_fractions.docx", "grade": 7, "subject": "Mathematics", "status": "processed", "topicsCount": 3, "uploadedAt": "2026-09-08"},
        {"id": uid(), "filename": "english_g7_comprehension.pdf", "grade": 7, "subject": "English", "status": "processing", "topicsCount": 0, "uploadedAt": "2026-09-12"},
        {"id": uid(), "filename": "kiswahili_g7_methali.pptx", "grade": 7, "subject": "Kiswahili", "status": "pending", "topicsCount": 0, "uploadedAt": "2026-09-13"},
        {"id": uid(), "filename": "social_studies_g7_counties.pdf", "grade": 7, "subject": "Social Studies", "status": "processed", "topicsCount": 2, "uploadedAt": "2026-09-05"},
    ]

@app.post("/api/v1/materials/upload")
async def upload_material():
    return {"id": uid(), "status": "processing", "message": "Material uploaded and processing started"}

@app.post("/api/v1/admin/lessons/{lesson_id}/approve")
async def approve_lesson(lesson_id: str):
    return {"status": "approved", "lessonId": lesson_id}

@app.post("/api/v1/admin/lessons/{lesson_id}/reject")
async def reject_lesson(lesson_id: str, body: dict = {}):
    return {"status": "rejected", "lessonId": lesson_id, "reason": body.get("reason", "Does not meet quality standards")}

@app.get("/api/v1/admin/analytics")
async def admin_analytics():
    return {
        "topLessons": [
            {"title": "Photosynthesis", "views": 342, "completionRate": 89, "avgScore": 81},
            {"title": "Fractions", "views": 289, "completionRate": 76, "avgScore": 76},
            {"title": "States of Matter", "views": 215, "completionRate": 92, "avgScore": 85},
            {"title": "County Governments", "views": 178, "completionRate": 68, "avgScore": 70},
            {"title": "Reading Comprehension", "views": 156, "completionRate": 64, "avgScore": 62},
        ],
        "dropoutPoints": [
            {"topic": "Reading Comprehension", "dropoutRate": 36, "avgTimeSpent": "4 min"},
            {"topic": "Algebra Basics", "dropoutRate": 28, "avgTimeSpent": "6 min"},
        ],
        "quizPassRates": [
            {"topic": "Photosynthesis", "passRate": 81, "avgAttempts": 1.3},
            {"topic": "Fractions", "passRate": 76, "avgAttempts": 1.5},
            {"topic": "States of Matter", "passRate": 85, "avgAttempts": 1.1},
        ],
        "monthlyUsers": [
            {"month": "Apr", "users": 120},
            {"month": "May", "users": 280},
            {"month": "Jun", "users": 450},
            {"month": "Jul", "users": 680},
            {"month": "Aug", "users": 920},
            {"month": "Sep", "users": 1247},
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
