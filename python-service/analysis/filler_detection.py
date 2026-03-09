FILLERS = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of", "right", "okay"]

def count_fillers(text: str) -> int:

    if not text:
        return 0
    words = text.lower().split()
    return sum(1 for w in words if w.strip(".,!?;:") in FILLERS)

def get_filler_details(text: str) -> dict:

    if not text:
        return {"total": 0, "breakdown": {}}

    words = text.lower().split()
    breakdown = {}
    for w in words:
        clean = w.strip(".,!?;:")
        if clean in FILLERS:
            breakdown[clean] = breakdown.get(clean, 0) + 1

    return {
        "total": sum(breakdown.values()),
        "breakdown": breakdown
    }
