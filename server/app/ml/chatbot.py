RESPONSES = {
    "en": {
        "greeting": "Hello! I'm CiviBot, your AI assistant for Puducherry civic issues. How can I help you today?",
        "report": "To report a civic issue, click 'Report Issue' and follow our 5-step form. Your report will be automatically categorized by AI and reviewed by the local ward NGO.",
        "track": "You can track your issue status on the Issue Detail page. For anonymous reports, use your secret 6-digit tracking token on the /track page.",
        "status": "Issue statuses: PENDING_VERIFICATION (awaiting NGO review), VERIFIED (publicly visible), IN_PROGRESS (assigned to municipal team), RESOLVED (work completed).",
        "ecoscore": "EcoScore rewards citizen participation! Earn +10 pts for submitting an issue, +5 pts for upvoting, +3 pts for commenting, and +50 pts when your issue is resolved.",
        "anonymous": "You can report anonymously using Zero-Knowledge protection. Plaintext user IDs are never saved — only a bcrypt hash of your 6-digit tracking token is stored.",
        "ward": "Puducherry is divided into 10 key wards (White Town, Lawspet, Oulgaret, Mudaliarpet, etc.). Each ward has a dedicated NGO that verifies reports.",
        "priority": "AI priority scoring uses a 3-factor formula: Location Weight (e.g. Highway/Hospital), Crowd Density (Hectic level), and Photo Severity score (0-100 scale).",
        "ngo": "Ward NGOs verify submitted issues to prevent spam and duplicate reports before they are published to the public map and assigned to authorities.",
        "default": "I can help you report issues, track status, understand AI priority scoring, EcoScore points, or ward NGO verification. What would you like to know?",
    },
    "ta": {
        "greeting": "வணக்கம்! நான் CiviBot, புதுச்சேரி நகர் பிரச்சினைகளுக்கான AI உதவியாளர். எவ்வாறு உதவலாம்?",
        "report": "நகர் பிரச்சினையை தெரிவிக்க, 'பிரச்சினை தெரிவி' பக்கத்திற்கு சென்று 5 படி படிவத்தை பூர்த்தி செய்யுங்கள். AI தானாக வகைப்படுத்தும்.",
        "track": "உங்கள் பிரச்சினையை பிரச்சினை விவர பக்கத்தில் கண்காணிக்கலாம். அனாமதேய அறிக்கைகளுக்கு 6-இலக்க கோடை பயன்படுத்துங்கள்.",
        "status": "நிலை விளக்கம்: நிலுவை (NGO மதிப்பாய்வு), சரிபார்க்கப்பட்டது (பொது பார்வை), செயல்பாட்டில், தீர்வு செய்யப்பட்டது.",
        "ecoscore": "EcoScore நகர் பங்கேற்பிற்கு வெகுமதி அளிக்கிறது! அறிக்கையிடலுக்கு +10, வாக்களிக்க +5, கருத்து தெரிவிக்க +3 புள்ளிகள் பெறலாம்.",
        "anonymous": "அனாமதேயமாக அறிக்கை செய்யலாம். உங்கள் அடையாளம் பாதுகாப்பாக இருக்கும் — 6-இலக்க டிராக்கிங் டோக்கன் மூலம் கண்காணிக்கலாம்.",
        "ward": "புதுச்சேரி 10 வார்டுகளாக பிரிக்கப்பட்டுள்ளது. ஒவ்வொரு வார்டுக்கும் அர்ப்பணிக்கப்பட்ட NGO உள்ளது.",
        "priority": "AI முன்னுரிமை மதிப்பெண்: இடம், மக்கள் நெரிசல் மற்றும் புகைப்பட தீவிரத்தன்மை அடிப்படையில் 0-100 வரை கணக்கிடப்படுகிறது.",
        "ngo": "வார்டு NGO-க்கள் அறிக்கைகளை சரிபார்த்து போலி பதிவுகளை தவிர்க்கின்றன.",
        "default": "பிரச்சினைகளை தெரிவிக்க, நிலையை கண்காணிக்க அல்லது EcoScore பற்றி அறிய உதவுகிறேன்.",
    },
    "fr": {
        "greeting": "Bonjour! Je suis CiviBot, votre assistant IA pour les problèmes civiques de Pondichéry. Comment puis-je vous aider?",
        "report": "Pour signaler un problème, cliquez sur 'Signaler un problème' et suivez le formulaire en 5 étapes. L'IA catégorise automatiquement votre rapport.",
        "track": "Vous pouvez suivre votre problème sur la page de détail. Pour les rapports anonymes, utilisez votre code à 6 chiffres sur la page /track.",
        "status": "Statuts: EN ATTENTE (examen ONG), VÉRIFIÉ (public), EN COURS (équipe assignée), RÉSOLU (terminé).",
        "ecoscore": "EcoScore récompense la participation civique! Gagnez +10 pts pour un rapport, +5 pts pour un vote, +50 pts pour la résolution.",
        "anonymous": "Vous pouvez signaler anonymement grâce à la protection Zero-Knowledge. Seul un hash bcrypt de votre code est conservé.",
        "ward": "Pondichéry est divisée en 10 quartiers (Ville Blanche, Lawspet, Oulgaret...). Chaque quartier a une ONG dédiée.",
        "priority": "Le score de priorité IA (0-100) dépend du lieu, de la densité de population et de la sévérité de l'image.",
        "ngo": "Les ONG de quartier vérifient les signalements avant leur publication sur la carte publique.",
        "default": "Je peux vous aider à signaler des problèmes, suivre le statut ou en savoir plus sur CiviTrack.",
    }
}

INTENT_KEYWORDS = {
    "greeting": ["hello", "hi", "hey", "vanakkam", "bonjour", "நமஸ்காரம்", "salut"],
    "report": ["report", "submit", "issue", "problem", "complaint", "சிக்கல்", "அறிக்கை", "signaler", "creer"],
    "track": ["track", "status", "find", "check", "கண்காணி", "suivre", "statut", "suivi"],
    "ecoscore": ["eco", "score", "points", "badge", "level", "புள்ளி", "points", "récompense"],
    "anonymous": ["anonymous", "private", "identity", "hide", "அனாமதேய", "anonyme", "confidentiel"],
    "ward": ["ward", "area", "zone", "வார்டு", "quartier", "ville"],
    "priority": ["priority", "score", "severity", "critical", "high", "முன்னுரிமை", "priorité"],
    "ngo": ["ngo", "verify", "verification", "approve", "சரிபார்ப்பு", "ong", "vérification"],
}


def load_or_train():
    print("Chatbot ready (rule-based intent classifier).")


def respond(message: str, language: str = "en") -> dict:
    lang = language if language in RESPONSES else "en"
    msg_lower = message.lower()

    intent = "default"
    for intent_name, keywords in INTENT_KEYWORDS.items():
        if any(kw in msg_lower for kw in keywords):
            intent = intent_name
            break

    response_text = RESPONSES[lang].get(intent, RESPONSES[lang]["default"])
    return {"intent": intent, "response": response_text, "language": lang}

