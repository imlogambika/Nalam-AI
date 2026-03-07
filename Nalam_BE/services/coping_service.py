"""
Coping Strategy Service — Fetches evidence-based coping strategies from DB.
"""
from db.connection import get_db


async def get_coping_strategy(category: str, severity: str) -> dict | None:
    """
    Fetch a coping strategy from the database matching category and severity.
    Returns strategy data dict or None.
    """
    try:
        db = get_db()
        result = (
            db.table("coping_strategies")
            .select("*")
            .eq("category", category)
            .in_("severity", [severity, "all"])
            .limit(1)
            .execute()
        )

        if result.data:
            row = result.data[0]
            return {
                "strategy_id": row.get("id"),
                "title": row.get("title", ""),
                "description": row.get("description", ""),
                "category": row.get("category", category),
                "severity": row.get("severity", severity),
                "interactive": row.get("interactive", False),
            }
        return None
    except Exception as e:
        print(f"[Coping] Error fetching strategy: {e}")
        # Return a fallback coping strategy
        return {
            "strategy_id": "strat_fallback",
            "title": "STOP Technique",
            "description": "Stop. Take a breath. Observe your thoughts. Proceed mindfully.",
            "category": "general",
            "severity": "all",
            "interactive": False,
        }
