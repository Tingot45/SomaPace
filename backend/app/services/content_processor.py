from __future__ import annotations

import math
import re


def calculate_flesch_kincaid(text: str) -> float:
    """Calculate Flesch-Kincaid Grade Level."""
    sentences = _split_sentences(text)
    words = text.split()
    total_sentences = max(len(sentences), 1)
    total_words = max(len(words), 1)
    total_syllables = sum(_count_syllables(w) for w in words)

    score = (
        0.39 * (total_words / total_sentences)
        + 11.8 * (total_syllables / total_words)
        - 15.59
    )
    return max(0.0, score)


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def extract_keywords(text: str, num_keywords: int = 10) -> list[str]:
    """Extract top keywords by TF frequency, excluding stop words."""
    stop_words = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "dare", "ought",
        "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
        "as", "into", "through", "during", "before", "after", "above", "below",
        "between", "out", "off", "over", "under", "again", "further", "then",
        "once", "here", "there", "when", "where", "why", "how", "all", "both",
        "each", "few", "more", "most", "other", "some", "such", "no", "nor",
        "not", "only", "own", "same", "so", "than", "too", "very", "just",
        "that", "this", "these", "those", "it", "its", "and", "or", "but",
        "if", "because", "about", "up", "down", "which", "what", "who",
        "whom", "whose", "they", "them", "their", "we", "he", "she", "his",
        "her", "our", "my", "your", "me", "him", "us", "you", "i",
    }
    words = re.findall(r"[a-z]+", text.lower())
    freq: dict[str, int] = {}
    for w in words:
        if len(w) > 2 and w not in stop_words:
            freq[w] = freq.get(w, 0) + 1
    sorted_words = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)
    return sorted_words[:num_keywords]


def generate_mermaid_diagram(topic: str, concepts: list[str]) -> str:
    """Generate a Mermaid flowchart diagram for the given topic and concepts."""
    nodes: list[str] = []
    edges: list[str] = []

    safe_topic = re.sub(r"[^a-zA-Z0-9 ]", "", topic).strip().replace(" ", "_")
    nodes.append(f"    A[\"{topic}\"]")

    num_concepts = min(len(concepts), 8)
    for i in range(num_concepts):
        letter = chr(65 + i + 1)
        safe_concept = re.sub(r"[^a-zA-Z0-9 ]", "", concepts[i]).strip()
        nodes.append(f"    {letter}[\"{safe_concept[:60]}\"]")
        edges.append(f"    A --> {letter}")

    for i in range(1, num_concepts):
        letter1 = chr(65 + i)
        letter2 = chr(65 + i + 1)
        edges.append(f"    {letter1} --> {letter2}")

    diagram = "```mermaid\nflowchart TD\n"
    diagram += "\n".join(nodes) + "\n"
    diagram += "\n".join(edges) + "\n"
    diagram += "```"
    return diagram


def _split_sentences(text: str) -> list[str]:
    """Split text into sentences."""
    return [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]


def _count_syllables(word: str) -> int:
    """Estimate syllable count for a word."""
    word = word.lower().strip()
    if len(word) <= 3:
        return 1
    vowels = "aeiouy"
    count = 0
    prev_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    if word.endswith("le") and len(word) > 2 and word[-3] not in vowels:
        count += 1
    return max(count, 1)
