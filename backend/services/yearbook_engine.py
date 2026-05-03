"""
AstroPinch YearBook Engine
==========================
Pure Vedic calculation engine for 12-month annual predictions.
Uses pyswisseph (Swiss Ephemeris / NASA JPL) for all planetary data.

Architecture:
  1. Compute natal chart sign/house positions
  2. For each of 12 months, compute transit positions using swe.calc_ut
  3. Apply Vedic transit rules (Gochara) to score each life area
  4. DeepSeek only NARRATES the scores — it does NOT invent them

Vedic Rules Applied (Brihat Parashara Hora Shastra):
  - Jupiter transit over natal Moon/Ascendant = auspicious (benefic)
  - Saturn transit over 4th/8th/12th from natal Moon = Sade Sati / Kantaka
  - Mars over natal Mars = energy boost
  - 8th house transit = obstacles; 11th house = gains
  - Dasha lord in transit favorable position = amplifier
"""

import swisseph as swe
import math
import calendar
from datetime import date, datetime
from typing import Dict, List, Tuple


# ──────────────────────────────────────────────────────────────
# CONSTANTS
# ──────────────────────────────────────────────────────────────
SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

# Swiss Ephemeris planet codes
SWE_PLANETS = {
    "Sun":     swe.SUN,
    "Moon":    swe.MOON,
    "Mars":    swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus":   swe.VENUS,
    "Saturn":  swe.SATURN,
    "Rahu":    swe.TRUE_NODE,   # North Node
}

# Lahiri ayanamsa (standard for KP / Vedic)
AYANAMSA = swe.SIDM_LAHIRI

# ──────────────────────────────────────────────────────────────
# TRANSIT SCORING TABLES (Gochara rules)
# Key: (transit_house_from_natal_moon)  → score delta
# Based on Phaladeepika / BPHS Gochara chapter
# ──────────────────────────────────────────────────────────────
JUPITER_GOCHARA = {
    1: +18, 2: +14, 3: -5,  4: -8,  5: +16, 6: -6,
    7: -4,  8: -10, 9: +20, 10: +8, 11: +20, 12: -8
}
SATURN_GOCHARA = {
    1: -15, 2: -12, 3: +10, 4: -15, 5: -8,  6: +12,
    7: -8,  8: -18, 9: -5,  10: +8, 11: +15, 12: -10
}
MARS_GOCHARA = {
    1: -5,  2: -3,  3: +12, 4: -8,  5: -5,  6: +10,
    7: -5,  8: -12, 9: +5,  10: -5, 11: +12, 12: -8
}
SUN_GOCHARA = {
    1: +5,  2: -3,  3: +8,  4: -5,  5: +8,  6: +5,
    7: -5,  8: -8,  9: +8,  10: +5, 11: +8,  12: -5
}
VENUS_GOCHARA = {
    1: +10, 2: +12, 3: +8,  4: +8,  5: -5,  6: -8,
    7: +10, 8: -5,  9: +5,  10: +8, 11: +12, 12: -8
}
MERCURY_GOCHARA = {
    1: +8,  2: +5,  3: +10, 4: -3,  5: +8,  6: +5,
    7: -5,  8: -8,  9: +5,  10: +8, 11: +12, 12: -5
}
MOON_GOCHARA = {
    1: +5,  2: -3,  3: +5,  4: -5,  5: +3,  6: +8,
    7: -5,  8: -8,  9: +5,  10: -3, 11: +8,  12: -5
}

PLANET_GOCHARA = {
    "Jupiter": JUPITER_GOCHARA,
    "Saturn":  SATURN_GOCHARA,
    "Mars":    MARS_GOCHARA,
    "Sun":     SUN_GOCHARA,
    "Venus":   VENUS_GOCHARA,
    "Mercury": MERCURY_GOCHARA,
    "Moon":    MOON_GOCHARA,
}

# Life area weights: which planet most influences which domain
AREA_WEIGHTS = {
    # area: {planet: weight}
    "career": {
        "Sun": 0.35, "Jupiter": 0.25, "Saturn": 0.20, "Mars": 0.15, "Mercury": 0.05
    },
    "finance": {
        "Venus": 0.30, "Jupiter": 0.30, "Mercury": 0.20, "Moon": 0.10, "Saturn": 0.10
    },
    "love": {
        "Venus": 0.40, "Moon": 0.30, "Mars": 0.15, "Jupiter": 0.10, "Mercury": 0.05
    },
    "health": {
        "Mars": 0.30, "Sun": 0.25, "Saturn": 0.25, "Moon": 0.15, "Jupiter": 0.05
    },
    "travel": {
        "Mercury": 0.35, "Jupiter": 0.25, "Mars": 0.20, "Moon": 0.15, "Venus": 0.05
    },
}

# Dasha lord bonus: if Mahadasha lord is transiting a favorable house, boost overall score
DASHA_BONUS_HOUSES = {11: +8, 9: +6, 5: +4, 10: +4, 7: +3, 1: +2}
DASHA_PENALTY_HOUSES = {8: -10, 12: -8, 6: -5, 4: -4}

# ──────────────────────────────────────────────────────────────
# INTERPRETATION TEMPLATES (fully rule-based, no AI)
# Keyed by score bucket: "high" ≥ 65, "mid" 45-64, "low" < 45
# ──────────────────────────────────────────────────────────────
INTERPRETATIONS = {
    "career": {
        "high": [
            "Planetary alignments strongly favor career advancement — initiate important projects and seek leadership roles this month.",
            "Benefic transits open doors for professional growth; push for that promotion or new contract with confidence.",
            "This is a peak period for career momentum — your efforts now will create compounding results through the year.",
        ],
        "mid": [
            "Career energy is steady this month — focus on consolidating current work rather than launching new initiatives.",
            "Moderate professional momentum; complete pending tasks diligently and build rapport with decision-makers.",
            "A stable month at work — nurture existing projects and refine your long-term professional strategy.",
        ],
        "low": [
            "Planetary pressure on the career sector — avoid major decisions and politics; keep a low profile and deliver quality work.",
            "Delays or friction may arise at work this month; exercise patience and don't force outcomes.",
            "Transit patterns suggest headwinds in career — focus on skill-building and avoid confrontations with superiors.",
        ],
    },
    "finance": {
        "high": [
            "Venus and Jupiter in favorable transit create ideal conditions for financial gains — invest strategically.",
            "This month favors wealth accumulation; explore new income streams and long-term investment opportunities.",
            "Financial planets are well-placed — a good time to negotiate salary, close deals, or expand revenue.",
        ],
        "mid": [
            "Finances are stable this month — maintain your budget and avoid speculative risks.",
            "A neutral financial period; prioritize savings and review your expenditure patterns.",
            "Moderate financial energy — existing income streams are reliable, but avoid large new commitments.",
        ],
        "low": [
            "Malefic transits over the wealth house advise caution — avoid loans, risky investments, or large purchases.",
            "Financial pressure is indicated this month; tighten your budget and postpone major financial decisions.",
            "Transit patterns suggest financial caution — cut unnecessary expenses and avoid lending money.",
        ],
    },
    "love": {
        "high": [
            "Venus in a highly favorable position brings warmth, romance, and deep emotional connections this month.",
            "The transit of Venus and Moon create a beautiful period for relationships — express your feelings openly.",
            "A peak period for love and family bonds — plan quality time together and strengthen emotional ties.",
        ],
        "mid": [
            "Relationship energy is warm but calm — nurture existing bonds with small, consistent gestures of care.",
            "A steady month for relationships; maintain open communication and be attentive to your partner's needs.",
            "Moderate romantic energy — focus on understanding and compromise rather than grand gestures.",
        ],
        "low": [
            "Planetary stress on the relationship sector — avoid unnecessary arguments and give your partner space.",
            "Transit tensions may create friction in relationships; practice patience and empathy rather than reacting.",
            "A challenging month for love — prioritize self-reflection and avoid making impulsive emotional decisions.",
        ],
    },
    "health": {
        "high": [
            "Vitality is strong this month — channel your energy into new fitness routines or health goals.",
            "Planetary support for physical well-being; an excellent time to start a diet, exercise regimen, or wellness practice.",
            "High energy levels and good health indicated — stay active and capitalize on this positive physical period.",
        ],
        "mid": [
            "Health is stable — maintain your current routines and don't neglect rest and nutrition.",
            "A steady month for well-being; avoid overexertion and prioritize consistent sleep patterns.",
            "Moderate vitality; listen to your body and address minor ailments before they become bigger issues.",
        ],
        "low": [
            "Malefic transits over the health sector — be extra mindful of diet, sleep, and avoiding stress.",
            "Planetary pressure may bring fatigue or minor health concerns; slow down and prioritize recovery.",
            "A cautionary month for health — avoid extreme physical exertion and don't ignore warning signals.",
        ],
    },
    "travel": {
        "high": [
            "Mercury and Jupiter in favorable transit create excellent conditions for travel — book that trip you've been planning.",
            "This is a highly auspicious month for travel, new experiences, and expanding your horizons.",
            "Planetary alignments strongly favor journeys; short or long trips undertaken now yield positive outcomes.",
        ],
        "mid": [
            "A moderate month for travel — short, planned trips are favorable while long journeys should be carefully planned.",
            "Travel is possible and generally smooth this month; ensure all logistics are organized in advance.",
            "Neutral travel energy — avoid impulsive travel decisions but planned trips should proceed without issues.",
        ],
        "low": [
            "Malefic transit patterns suggest avoiding unnecessary travel this month — delays and complications are likely.",
            "Not an ideal month for major journeys; if travel is unavoidable, plan meticulously and have contingencies.",
            "Transit tensions advise caution for travel — postpone non-urgent trips and stay closer to home.",
        ],
    },
}

# Seasonal context for each month (adds natural rhythm to predictions)
SEASONAL_CONTEXT = {
    "January":   "a winter planning period",
    "February":  "a late-winter season of new intentions",
    "March":     "a spring season of new beginnings",
    "April":     "a spring season of growth and action",
    "May":       "a late-spring season of expansion",
    "June":      "a summer peak-energy period",
    "July":      "a summer season of peak social activity",
    "August":    "a late-summer season of transition",
    "September": "an autumn harvest season",
    "October":   "a mid-autumn consolidation period",
    "November":  "a pre-winter preparation season",
    "December":  "a winter season of completion and reflection",
}


# ──────────────────────────────────────────────────────────────
# CORE ENGINE
# ──────────────────────────────────────────────────────────────

def _get_sidereal_longitude(jd: float, swe_planet: int) -> float:
    """Return sidereal longitude (Lahiri) for a planet at Julian Day."""
    swe.set_sid_mode(AYANAMSA)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
    result, _ = swe.calc_ut(jd, swe_planet, flags)
    return result[0] % 360.0


def _sign_from_longitude(lon: float) -> int:
    """Return 1-based sign index (1=Aries … 12=Pisces)."""
    return int(lon / 30.0) % 12 + 1


def _house_from_moon(planet_sign: int, moon_sign: int) -> int:
    """
    Count houses from natal Moon to transit planet (Gochara).
    Returns 1-12.
    """
    diff = (planet_sign - moon_sign) % 12
    return diff if diff != 0 else 12


def _date_to_jd(year: int, month: int, day: int) -> float:
    """Convert calendar date to Julian Day (noon UT)."""
    return swe.julday(year, month, day, 12.0)


def _score_bucket(score: float) -> str:
    if score >= 65:
        return "high"
    elif score >= 45:
        return "mid"
    else:
        return "low"


def _pick_interpretation(area: str, bucket: str, month_idx: int) -> str:
    """Pick a deterministic (not random) interpretation from the template list."""
    templates = INTERPRETATIONS[area][bucket]
    return templates[month_idx % len(templates)]


def compute_natal_positions(
    birth_year: int, birth_month: int, birth_day: int,
    birth_hour: int, birth_minute: int
) -> Dict[str, int]:
    """
    Compute natal sign positions (1-12) for all planets.
    Returns dict: {"Moon": 4, "Sun": 6, ...}
    """
    jd = _date_to_jd(birth_year, birth_month, birth_day)
    # Adjust for birth time (approximate UT — close enough for sign-level accuracy)
    jd += (birth_hour + birth_minute / 60.0 - 5.5) / 24.0  # IST → UT offset

    natal = {}
    for name, code in SWE_PLANETS.items():
        lon = _get_sidereal_longitude(jd, code)
        natal[name] = _sign_from_longitude(lon)
    return natal


def compute_monthly_transit_scores(
    natal: Dict[str, int],
    target_year: int,
    mahadasha_lord: str = "Jupiter"
) -> List[Dict]:
    """
    For each of 12 months in target_year:
      1. Compute transit planet positions (mid-month, 15th)
      2. Calculate Gochara house from natal Moon for each planet
      3. Apply area weights to produce 5 life-area scores
      4. Apply Dasha lord bonus/penalty
      5. Pick rule-based interpretation text

    Returns list of 12 dicts with month, score, career, finance, love, health, travel.
    """
    natal_moon = natal.get("Moon", 1)
    results = []

    for month_idx, month_name in enumerate(MONTHS):
        cal_month = month_idx + 1

        # Use mid-month Julian Day for transit snapshot
        jd_mid = _date_to_jd(target_year, cal_month, 15)

        # Compute transit sign for each planet
        transit_signs: Dict[str, int] = {}
        for name, code in SWE_PLANETS.items():
            lon = _get_sidereal_longitude(jd_mid, code)
            transit_signs[name] = _sign_from_longitude(lon)

        # Compute Gochara house from natal Moon for each planet
        gochara_houses: Dict[str, int] = {
            name: _house_from_moon(transit_signs[name], natal_moon)
            for name in transit_signs
        }

        # Dasha lord bonus
        dasha_house = gochara_houses.get(mahadasha_lord, 6)
        dasha_delta = DASHA_BONUS_HOUSES.get(dasha_house, 0) + DASHA_PENALTY_HOUSES.get(dasha_house, 0)

        # Compute weighted area scores
        area_scores: Dict[str, float] = {}
        for area, weights in AREA_WEIGHTS.items():
            raw = 0.0
            for planet, weight in weights.items():
                gochara_table = PLANET_GOCHARA.get(planet, {})
                house = gochara_houses.get(planet, 6)
                delta = gochara_table.get(house, 0)
                raw += delta * weight

            # Normalize: raw ranges roughly -18 to +20 → map to 30–95
            score = 62.5 + (raw * 1.5) + (dasha_delta * 0.4)
            score = max(30.0, min(95.0, score))
            area_scores[area] = score

        # Overall alignment score = average of all areas
        overall = sum(area_scores.values()) / len(area_scores)
        overall = round(max(30, min(98, overall)))

        # Build interpretation strings using rule-based templates
        row = {
            "month": month_name,
            "score": overall,
        }
        for area in ["career", "finance", "love", "health", "travel"]:
            bucket = _score_bucket(area_scores[area])
            text = _pick_interpretation(area, bucket, month_idx)
            row[area] = text

        results.append(row)

    return results


def get_planet_transit_summary(natal: Dict[str, int], target_year: int) -> List[Dict]:
    """
    Compute actual Jupiter and Saturn transit events for the target year
    by comparing Jan 1 vs Dec 31 positions.
    Returns list of transit event dicts.
    """
    jd_start = _date_to_jd(target_year, 1, 1)
    jd_end   = _date_to_jd(target_year, 12, 31)

    transits = []
    for planet_name, swe_code in [("Jupiter", swe.JUPITER), ("Saturn", swe.SATURN), ("Mars", swe.MARS)]:
        sign_start = _sign_from_longitude(_get_sidereal_longitude(jd_start, swe_code))
        sign_end   = _sign_from_longitude(_get_sidereal_longitude(jd_end,   swe_code))

        if sign_start != sign_end:
            # Find approximate month of ingress by binary search
            jd_lo, jd_hi = jd_start, jd_end
            for _ in range(20):
                jd_mid = (jd_lo + jd_hi) / 2
                s_mid = _sign_from_longitude(_get_sidereal_longitude(jd_mid, swe_code))
                if s_mid == sign_start:
                    jd_lo = jd_mid
                else:
                    jd_hi = jd_mid
            ingress_jd = (jd_lo + jd_hi) / 2
            g_year, g_month, g_day, _ = swe.revjul(ingress_jd)
            approx_date = f"{MONTHS[int(g_month)-1]} {target_year}"
            transits.append({
                "planet": planet_name,
                "event": f"Enters {SIGN_NAMES[sign_end - 1]}",
                "date": approx_date
            })
        else:
            transits.append({
                "planet": planet_name,
                "event": f"Remains in {SIGN_NAMES[sign_start - 1]}",
                "date": f"Throughout {target_year}"
            })

    return transits
