# backend/services/suggestion_service.py

def get_suggestions(total_emission_tons: float, top_category: str) -> list[str]:
    """
    Return personalized carbon reduction suggestions.
    """
    suggestions = []

    if total_emission_tons > 6:
        suggestions.append("🚨 Your footprint is high. Consider major lifestyle changes.")
    elif total_emission_tons > 4:
        suggestions.append("⚠️ Above global average. Small daily changes can make a big difference.")
    else:
        suggestions.append("✅ Your footprint is below average. Keep it up!")

    category_tips = {
        'car_petrol': [
            "🚌 Switch to public transport 2-3 days/week to save ~150 kg CO₂/year.",
            "🚲 Cycle short distances under 5 km instead of driving.",
        ],
        'electricity': [
            "💡 Switch to LED bulbs — saves ~80% energy vs incandescent.",
            "🔌 Unplug idle electronics — standby power wastes ~10% of home electricity.",
        ],
        'flight_domestic': [
            "🚆 Take trains for trips under 600 km — 10x lower emissions than flying.",
        ],
        'flight_international': [
            "💺 Choose economy class and direct flights to reduce per-person emissions.",
            "🌍 Offset your flights by planting trees or contributing to carbon funds.",
        ],
    }

    tips = category_tips.get(top_category, [
        "🌱 Track your daily activities to identify your biggest emission sources.",
        "🌲 Plant a tree monthly to offset your footprint.",
    ])
    suggestions.extend(tips)
    return suggestions