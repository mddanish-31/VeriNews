import re
from typing import Set, Tuple


class UnsupportedLanguageException(Exception):
    """Raised when an input text has an unsupported script or ambiguous language."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


# Distinctive, high-specificity Indic words commonly used in Romanized Hindi (Hinglish).
# Carefully selected to avoid coincidental collisions with standard English words.
ROMANIZED_HINDI_INDIC_WORDS: Set[str] = {
    "hai", "hain", "nahi", "nahin", "kya", "kyun", "kyon", "liye",
    "gaya", "gaye", "gayi", "raha", "rahe", "rahi", "hoga", "hogi", "hoge",
    "hota", "hoti", "hote", "kiya", "kiye", "bharat", "sarkar", "khabar",
    "desh", "apne", "apni", "unke", "unki", "inka", "inke", "inki",
    "jhooth", "sach", "lekin", "magar", "bahut", "shuru", "pehle",
    "samay", "aur", "yeh", "woh", "kaise", "jaise", "waise", "kaha",
}


def is_devanagari_char(char: str) -> bool:
    """Check if a character falls within the Unicode Devanagari block (U+0900 to U+097F)."""
    code = ord(char)
    return 0x0900 <= code <= 0x097F


def is_latin_char(char: str) -> bool:
    """Check if a character is a Latin alphabet character."""
    code = ord(char)
    return (0x0041 <= code <= 0x005A) or (0x0061 <= code <= 0x007A) or (0x00C0 <= code <= 0x024F)


def is_likely_romanized_hindi(text: str) -> bool:
    """Check if a Latin-script text contains at least 3 distinct common Romanized Hindi words.

    Conservative heuristic requiring a cluster of 3+ distinct matches to avoid false positives
    on ordinary English sentences that may happen to contain a single borrowed word.
    """
    tokens = set(re.findall(r"\b[a-z]{2,}\b", text.lower()))
    matches = tokens & ROMANIZED_HINDI_INDIC_WORDS
    return len(matches) >= 3


def detect_script_and_language(
    text: str,
    language_hint: str = "auto",
    allow_romanized_hindi: bool = False,
) -> Tuple[str, str]:
    """
    Inspect the Unicode character distribution of the input text to determine
    the appropriate language pipeline ('en' for English or 'hi' for Hindi).

    Returns:
        Tuple of (iso_code, human_readable_name), e.g. ('en', 'English') or ('hi', 'Hindi').

    Raises:
        UnsupportedLanguageException: If script is non-Latin/non-Devanagari,
        if Romanized Hindi is detected (when allow_romanized_hindi is False),
        or if language hint conflicts directly with detected script.
    """
    devanagari_count = 0
    latin_count = 0
    other_alpha_count = 0

    for char in text:
        if is_devanagari_char(char):
            devanagari_count += 1
        elif is_latin_char(char):
            latin_count += 1
        elif char.isalpha():
            other_alpha_count += 1

    total_alpha = devanagari_count + latin_count + other_alpha_count

    if total_alpha < 10:
        raise UnsupportedLanguageException(
            "Input contains insufficient alphabetic characters to determine language reliably (minimum 10 letters). "
            "Please provide a complete news headline."
        )

    # Check for predominantly unsupported scripts (Cyrillic, Arabic, Chinese, etc.)
    if other_alpha_count > (devanagari_count + latin_count):
        raise UnsupportedLanguageException(
            "Unsupported script detected. VeriNews currently supports English (Latin script) "
            "and Hindi (Devanagari script) only. Other scripts are not supported."
        )

    # Check for Romanized Hindi (Hinglish) when Latin characters dominate or when hint is English/auto
    if devanagari_count == 0 or latin_count > devanagari_count:
        if is_likely_romanized_hindi(text):
            if allow_romanized_hindi:
                return "hi", "Hindi (Romanized)"
            raise UnsupportedLanguageException(
                "Romanized Hindi (Hinglish) is not supported yet. Please enter Hindi using Devanagari script."
            )

    # Validate against explicit language hints
    if language_hint == "hi":
        if devanagari_count == 0:
            if allow_romanized_hindi and is_likely_romanized_hindi(text):
                return "hi", "Hindi (Romanized)"
            raise UnsupportedLanguageException(
                "Hindi was specified as the language hint, but the text contains no Devanagari characters. "
                "Romanized Hindi (Hinglish) is not supported yet. Please enter Hindi using Devanagari script."
            )
        return "hi", "Hindi"

    if language_hint == "en":
        if latin_count == 0:
            raise UnsupportedLanguageException(
                "English was specified as the language hint, but the text contains no Latin characters. "
                "Please provide English text in Latin script."
            )
        return "en", "English"

    # Auto-detect based on character dominance
    if devanagari_count > latin_count:
        return "hi", "Hindi"

    if latin_count > 0:
        return "en", "English"

    raise UnsupportedLanguageException(
        "Could not determine language from text. VeriNews supports English and Hindi (Devanagari)."
    )
