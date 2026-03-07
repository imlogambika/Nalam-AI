"""
PHQ-9 / GAD-7 Scoring Service.
Maps conversation turns to clinical screening scores silently.
"""

PHQ9_QUESTIONS = [
    "sleep_problems", "low_energy", "appetite_changes",
    "feeling_hopeless", "concentration_issues", "motor_changes",
    "worthlessness", "anhedonia", "suicidal_ideation"
]

GAD7_QUESTIONS = [
    "feeling_nervous", "uncontrollable_worry", "excessive_worry",
    "trouble_relaxing", "restlessness", "irritability", "fear_something_awful"
]

# Keywords mapped to PHQ-9 indicators
PHQ_KEYWORDS = {
    "sleep_problems": ["can't sleep", "insomnia", "sleeping too much", "trouble sleeping", "not sleeping"],
    "low_energy": ["tired", "no energy", "exhausted", "fatigue", "drained"],
    "appetite_changes": ["not eating", "eating too much", "no appetite", "lost appetite"],
    "feeling_hopeless": ["hopeless", "no hope", "pointless", "meaningless", "lost"],
    "concentration_issues": ["can't focus", "can't concentrate", "distracted", "brain fog"],
    "motor_changes": ["restless", "can't sit still", "sluggish", "slow"],
    "worthlessness": ["worthless", "failure", "useless", "disappointed", "burden"],
    "anhedonia": ["don't enjoy", "nothing interests", "no pleasure", "lost interest"],
    "suicidal_ideation": ["better off dead", "hurting myself", "want to die"],
}

# Keywords mapped to GAD-7 indicators
GAD_KEYWORDS = {
    "feeling_nervous": ["nervous", "anxious", "anxiety", "panicking", "panic"],
    "uncontrollable_worry": ["can't stop worrying", "worry all the time", "constant worry"],
    "excessive_worry": ["worrying too much", "overthinking", "ruminating"],
    "trouble_relaxing": ["can't relax", "tense", "on edge", "wound up"],
    "restlessness": ["restless", "fidgety", "can't sit still"],
    "irritability": ["irritable", "angry", "annoyed", "snapping"],
    "fear_something_awful": ["something bad", "dread", "fear", "scared", "terrified"],
}


def update_scores(message: str, current_phq: int, current_gad: int) -> tuple[int, int]:
    """
    Analyze message for PHQ-9 and GAD-7 indicators.
    Incrementally updates scores based on detected keywords.
    Returns (updated_phq, updated_gad).
    """
    message_lower = message.lower()
    phq_increment = 0
    gad_increment = 0

    for category, keywords in PHQ_KEYWORDS.items():
        if any(kw in message_lower for kw in keywords):
            phq_increment += 1

    for category, keywords in GAD_KEYWORDS.items():
        if any(kw in message_lower for kw in keywords):
            gad_increment += 1

    new_phq = min(current_phq + phq_increment, 27)
    new_gad = min(current_gad + gad_increment, 21)

    return new_phq, new_gad


def compute_severity(phq: int, gad: int) -> str:
    """Compute severity from PHQ-9 and GAD-7 scores."""
    max_score = max(phq, gad)
    if max_score <= 4:
        return "minimal"
    if max_score <= 9:
        return "mild"
    if max_score <= 14:
        return "moderate"
    if max_score <= 19:
        return "moderately_severe"
    return "severe"


def should_book_doctor(phq: int, gad: int) -> bool:
    """Determine if professional help should be recommended."""
    return phq >= 15 or gad >= 15
