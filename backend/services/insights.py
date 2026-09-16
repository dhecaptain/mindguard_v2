"""Deterministic insight and recommendation generation for self-analysis.

Pure helpers: given per-platform scored post data they produce the
``findings``, ``insights`` and ``recommendations`` payloads for an
``analysis_sessions`` row. Nothing here calls the ML predictor or any
external API; the orchestration layer owns those calls and passes fully
calibrated post dicts.

Language is deliberately wellbeing-oriented ("signals", "patterns",
"potentially concerning content"), never diagnostic.
"""

from __future__ import annotations

import statistics
from typing import Any

from backend.utils import detect_socioeconomic, risk_label

LOW = 0.35
MODERATE = 0.55
HIGH = 0.75

TREND_WINDOW_WEEKS = 12


def _cap(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


def _post_score(post: dict[str, Any]) -> float:
    return float(post.get("risk_score") or 0.0)


def merge_posts(platform_results: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    for slug, res in platform_results.items():
        for post in res.get("posts", []) or []:
            merged.append({**post, "platform": slug})
    return merged


def compute_overall_risk(platform_results: dict[str, dict[str, Any]]) -> float | None:
    """Prevalence-weighted mean of calibrated per-post risk scores."""
    posts = merge_posts(platform_results)
    if not posts:
        return None
    scores = [_post_score(p) for p in posts if _post_score(p) > 0]
    if not scores:
        return None
    return round(_cap(statistics.fmean(scores)), 3)


def detect_trend(posts: list[dict[str, Any]]) -> dict[str, Any]:
    """Compare the risk of the most recent posts vs earlier posts in the window."""
    if len(posts) < 8:
        return {"direction": "insufficient_data", "description": "Not enough posts yet to describe a trend."}
    ordered = sorted(posts, key=lambda p: p.get("date") or "", reverse=True)
    recent = ordered[: max(1, len(ordered) // 3)]
    earlier = ordered[len(ordered) // 3:]
    recent_avg = statistics.fmean([_post_score(p) for p in recent])
    earlier_avg = statistics.fmean([_post_score(p) for p in earlier])
    delta = recent_avg - earlier_avg
    if delta > 0.06:
        return {
            "direction": "rising",
            "description": f"Signals are more frequent in recent posts than earlier ones in the window (recent avg {recent_avg:.2f} vs earlier {earlier_avg:.2f}).",
            "delta": round(delta, 3),
        }
    if delta < -0.06:
        return {
            "direction": "falling",
            "description": f"Signals appear less often in the most recent posts (recent avg {recent_avg:.2f} vs earlier {earlier_avg:.2f}).",
            "delta": round(delta, 3),
        }
    return {
        "direction": "stable",
        "description": f"Signal intensity has stayed roughly level across the window (recent avg {recent_avg:.2f} vs earlier {earlier_avg:.2f}).",
        "delta": round(delta, 3),
    }


def top_risk_posts(posts: list[dict[str, Any]], limit: int = 3) -> list[dict[str, Any]]:
    ordered = sorted(posts, key=_post_score, reverse=True)
    return [
        {
            "platform": p.get("platform"),
            "text": (p.get("text") or "")[:600],
            "risk_score": _post_score(p),
            "level": risk_label(_post_score(p))[2],
            "date": p.get("date"),
            "url": p.get("url"),
        }
        for p in ordered[:limit]
        if _post_score(p) >= MODERATE
    ]


def platform_breakdown(platform_results: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for slug, res in platform_results.items():
        posts = res.get("posts", []) or []
        if not posts:
            continue
        scores = [_post_score(p) for p in posts if _post_score(p) > 0]
        avg = round(_cap(statistics.fmean(scores)), 3) if scores else None
        counts = {"low": 0, "moderate": 0, "high": 0, "critical": 0}
        for p in posts:
            level = risk_label(_post_score(p))[2]
            if level in counts:
                counts[level] += 1
        out.append(
            {
                "platform": slug,
                "posts_analyzed": len(posts),
                "earliest": min((p.get("date") or "" for p in posts), key=lambda d: d) or None,
                "latest": max((p.get("date") or "" for p in posts), key=lambda d: d) or None,
                "average_risk": avg,
                "distribution": counts,
            }
        )
    return out


def build_findings(platform_results: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Aggregate facts about what was actually analyzed.

    ``posts_analyzed == 0`` means nothing real was retrieved and the UI must
    not present a fake score — the caller handles that separately.
    """
    posts = merge_posts(platform_results)
    overall_risk = compute_overall_risk(platform_results)
    return {
        "platforms_analyzed": sorted(k for k, v in platform_results.items() if (v.get("posts") or [])),
        "posts_analyzed": len(posts),
        "overall_risk": overall_risk,
        "overall_level": risk_label(overall_risk)[2] if overall_risk is not None else None,
        "trend": detect_trend(posts),
        "top_posts": top_risk_posts(posts),
        "platforms": platform_breakdown(platform_results),
        "socioeconomic": detect_socioeconomic(posts),
    }


def build_insights(findings: dict[str, Any], platform_results: dict[str, dict[str, Any]]) -> list[str]:
    overall_risk = findings.get("overall_risk")
    level = findings.get("overall_level")
    insights: list[str] = []
    if overall_risk is None:
        insights.append(
            "No retrievable activity was analyzed this session, so there are no signals to report yet. "
            "Connect a platform with public activity, or re-run after you have posted something, to get a real check."
        )
        return insights

    if level == "low":
        insights.append(
            f"Across {findings['posts_analyzed']} posts your activity shows no consistent pattern of distress — most content sits in the low-signal range."
        )
    elif level == "moderate":
        insights.append(
            f"In the {findings['posts_analyzed']} posts analyzed, a moderate signal appears in places. "
            "These are patterns some people notice, not a diagnosis — and they are worth talking through."
        )
    elif level == "high":
        insights.append(
            f"Of {findings['posts_analyzed']} posts, several carry stronger signals of distress. "
            "That is enough to be worth taking seriously and speaking with a trusted person or professional soon."
        )
    else:
        insights.append(
            "Multiple posts in this set carry critical signals. These can reflect genuine distress and are worth "
            "reaching out to a crisis line or a professional right away."
        )

    trend = findings.get("trend") or {}
    if trend.get("direction") == "rising":
        insights.append(trend["description"])
    elif trend.get("direction") == "falling":
        insights.append(trend["description"])


    socio = findings.get("socioeconomic") or {}
    for category, hits in socio.items():
        if hits:
            insights.append(
                f"References to {category.lower()} situations appeared in your posts ({len(hits)} matched term{'s' if len(hits) != 1 else ''}). "
                "These are practical stressors that can increase strain."
            )

    per_platform = findings.get("platforms") or []
    loaded = [p for p in per_platform if (p.get("posts_analyzed") or 0) > 0]
    if loaded:
        highest = max(loaded, key=lambda p: p.get("average_risk") or 0)
        if (highest.get("average_risk") or 0) >= MODERATE:
            insights.append(
                f"The {platform_label(highest['platform'])} account carries the highest average signal "
                f"{highest['average_risk']:.2f}, based on {highest['posts_analyzed']} posts."
            )

    return insights[:6]


def build_recommendations(
    findings: dict[str, Any],
    platform_results: dict[str, dict[str, Any]],
    connected_platforms: list[str] | None = None,
) -> list[str]:
    overall_level = findings.get("overall_level")
    recs: list[str] = []
    if overall_level is None:
        recs.append("No signal data to act on yet — the analysis genuinely found nothing to review.")
        return recs

    if overall_level in ("high", "critical"):
        recs.append(
            "Given the strength of these signals, please consider speaking with a mental health professional soon. "
            "You can find crisis numbers below or reach a trusted person today."
        )
    elif overall_level == "moderate":
        recs.append("The moderate signal is worth checking in about — a conversation with someone you trust can help you see it in context.")

    connected_missing = [
        slug
        for slug in (connected_platforms or []) if slug not in (findings.get("platforms_analyzed") or [])
    ]
    for slug in connected_missing:
        recs.append(
            f"You have {platform_label(slug)} linked but no public activity could be retrieved for it this run. "
            "You can verify the account on the Accounts page and re-run analysis for that platform."
        )
    connected_missing = [
        slug for slug in (connected_platforms or []) if slug not in (findings.get("platforms_analyzed") or [])
    ]
    for slug in connected_missing:
        recs.append(
            f"You have {platform_label(slug)} linked but no public activity could be retrieved for it this run. "
            "You can verify the account on the Accounts page and re-run analysis for that platform."
        )

    return recs[:6]


def build_summary_text(findings: dict[str, Any]) -> str:
    if findings.get("overall_risk") is None:
        return "Analysis ran but could not retrieve any activity to review. No score was produced."
    level = findings.get("overall_level")
    posts = findings.get("posts_analyzed") or 0
    return f"{level_title(level)} — {posts} posts reviewed across {len(findings.get('platforms') or [])} platform(s)."


def level_title(level: str | None) -> str:
    if level == "moderate":
        return "Moderate signal"
    if level == "high":
        return "High signal"
    if level == "critical":
        return "Critical signal"
    return "Low signal"


def platform_label(slug: str) -> str:
    try:
        from backend.services.platform_registry import get_platform

        spec = get_platform(slug)
        if spec:
            return str(spec["name"])
    except Exception:  # noqa: BLE001
        pass
    return slug.title()