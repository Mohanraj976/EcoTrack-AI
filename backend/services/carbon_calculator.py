# backend/services/carbon_calculator.py
from config import Config

FACTORS = Config.EMISSION_FACTORS

def calc_electricity_emission(units: float) -> float:
    """kWh → kg CO₂"""
    return round(units * Config.ELECTRICITY_FACTOR, 2)

def calc_activity_emission(activity_type: str, quantity: float) -> float:
    """Generic activity → kg CO₂"""
    factor = FACTORS.get(activity_type, 0)
    return round(quantity * factor, 2)

def calc_yearly_emission(transport_km_day, transport_mode, monthly_kwh,
                          domestic_flights, international_flights,
                          meat_meals_week, dairy_servings_day) -> dict:
    transport = transport_km_day * 365 * FACTORS.get(transport_mode, 0.21)
    electricity = monthly_kwh * 12 * Config.ELECTRICITY_FACTOR
    flights = (domestic_flights * 500 * FACTORS['flight_domestic'] +
               international_flights * 8000 * FACTORS['flight_international'])
    diet = ((meat_meals_week / 7) * 0.2 * 27 + dairy_servings_day * 0.2 * 3.2 + 1.0) * 365

    total_kg = transport + electricity + flights + diet
    total_tons = round(total_kg / 1000, 2)

    return {
        'transport': round(transport / 1000, 2),
        'electricity': round(electricity / 1000, 2),
        'flights': round(flights / 1000, 2),
        'diet': round(diet / 1000, 2),
        'total': total_tons,
        'status': ('Excellent' if total_tons < 2 else 'Below Average' if total_tons < 4
                   else 'Average' if total_tons < 7 else 'Above Average'),
        'globalAverage': 4.0,
        'treesNeeded': -(-int(total_kg) // Config.TREES_ABSORPTION)
    }

def calc_trees_needed(kg_co2: float) -> int:
    return -(-int(kg_co2) // Config.TREES_ABSORPTION)