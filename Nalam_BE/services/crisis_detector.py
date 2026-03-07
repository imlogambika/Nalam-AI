"""
Crisis Detector Service — Rule-based keyword engine.
Runs FIRST before any LLM call for instant safety response.
"""

CRISIS_KEYWORDS = [
    "end it all", "don't want to be here", "want to die",
    "kill myself", "suicide", "self harm", "self-harm",
    "no point living", "disappear forever", "can't go on",
    "overdose", "hurt myself", "not worth living"
]


def detect_crisis(message: str) -> bool:
    """
    Check if a message contains crisis-related keywords.
    Returns True if any crisis keyword is found.
    """
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in CRISIS_KEYWORDS)


CRISIS_CONTACTS = [
    {"name": "iCall", "phone": "9152987821"},
    {"name": "Vandrevala Foundation", "phone": "1860-2662-345"},
    {"name": "iMind", "phone": "080-46110007"},
    {"name": "NIMHANS Helpline", "phone": "080-46110007"},
]

CRISIS_MESSAGE = (
    "It sounds like things are really heavy right now. "
    "You don't have to carry this alone. "
    "You matter deeply, and help is available right now."
)


DKMS_KEYWORDS = [
    "blood cancer", "leukemia", "leukaemia", "bone marrow",
    "lymphoma", "stem cell", "blood disease", "fear of cancer",
    "scared of cancer", "cancer diagnosis"
]


def detect_dkms_keywords(message: str) -> bool:
    """Check if a message contains DKMS-related keywords."""
    return any(kw in message.lower() for kw in DKMS_KEYWORDS)
