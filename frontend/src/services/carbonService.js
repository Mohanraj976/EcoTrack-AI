// src/services/carbonService.js
// Client-side carbon calculation helpers

export const EMISSION_FACTORS = {
  electricity: 0.82,       // kg CO₂ per kWh
  car_petrol: 0.21,        // kg CO₂ per km
  car_diesel: 0.18,        // kg CO₂ per km
  motorbike: 0.11,         // kg CO₂ per km
  bus: 0.089,              // kg CO₂ per km
  train: 0.041,            // kg CO₂ per km
  flight_domestic: 0.255,  // kg CO₂ per km per passenger
  flight_international: 0.195,
  beef: 27,                // kg CO₂ per kg of food
  chicken: 6.9,
  pork: 12.1,
  fish: 6.1,
  vegetables: 2,
  dairy: 3.2
};

export const HABIT_SAVINGS = {
  public_transport:   { saving: 2.0,  points: 20, label: 'Used Public Transport' },
  reusable_bottle:    { saving: 0.5,  points: 5,  label: 'Used Reusable Bottle' },
  plant_tree:         { saving: 10.0, points: 100,label: 'Planted a Tree' },
  vegetarian_meal:    { saving: 1.5,  points: 15, label: 'Vegetarian Meal' },
  led_bulbs:          { saving: 0.3,  points: 3,  label: 'Used LED Bulbs' },
  bike_instead_car:   { saving: 3.0,  points: 30, label: 'Cycled Instead of Driving' },
  recycled_waste:     { saving: 0.8,  points: 8,  label: 'Recycled Waste' },
  short_shower:       { saving: 0.5,  points: 5,  label: 'Took a Short Shower' },
  no_car_day:         { saving: 4.0,  points: 40, label: 'Car-Free Day' },
};

// Calculate electricity emission from kWh units
export function calcElectricityEmission(units) {
  return parseFloat((units * EMISSION_FACTORS.electricity).toFixed(2));
}

// Calculate car travel emission
export function calcCarEmission(km, fuelType = 'car_petrol') {
  const factor = EMISSION_FACTORS[fuelType] || EMISSION_FACTORS.car_petrol;
  return parseFloat((km * factor).toFixed(2));
}

// Calculate yearly emissions from lifestyle
export function calcYearlyEmission({ transport, electricity, flights, diet }) {
  const transportKg = (transport.kmPerDay || 0) * 365 * (EMISSION_FACTORS[transport.mode] || 0.21);
  const electricityKg = (electricity.monthlyKwh || 0) * 12 * EMISSION_FACTORS.electricity;
  const flightKg = (flights.domesticFlights || 0) * 500 * EMISSION_FACTORS.flight_domestic
                 + (flights.internationalFlights || 0) * 8000 * EMISSION_FACTORS.flight_international;
  const dietKg = calcDietEmission(diet) * 365;
  const totalKg = transportKg + electricityKg + flightKg + dietKg;
  const totalTons = parseFloat((totalKg / 1000).toFixed(2));
  return {
    transport: parseFloat((transportKg / 1000).toFixed(2)),
    electricity: parseFloat((electricityKg / 1000).toFixed(2)),
    flights: parseFloat((flightKg / 1000).toFixed(2)),
    diet: parseFloat((dietKg / 1000).toFixed(2)),
    total: totalTons,
    status: totalTons < 2 ? 'Excellent' : totalTons < 4 ? 'Below Average' : totalTons < 7 ? 'Average' : 'Above Average',
    globalAverage: 4.0
  };
}

function calcDietEmission({ meatMealsPerWeek = 0, dairyServingsPerDay = 0 }) {
  const meatKgPerDay = (meatMealsPerWeek / 7) * 0.2 * EMISSION_FACTORS.beef;
  const dairyKgPerDay = dairyServingsPerDay * 0.2 * EMISSION_FACTORS.dairy;
  return meatKgPerDay + dairyKgPerDay + 1.0; // base vegetable footprint
}

// Trees needed to offset X kg CO₂
export function calcTreesNeeded(kgCO2) {
  const absorbedPerTreePerYear = 21; // kg
  return Math.ceil(kgCO2 / absorbedPerTreePerYear);
}

// Get status badge color
export function getEmissionStatus(totalTons) {
  if (totalTons < 2) return { label: 'Excellent 🌿', color: 'badge-teal' };
  if (totalTons < 4) return { label: 'Below Average ✅', color: 'badge-green' };
  if (totalTons < 7) return { label: 'Average ⚠️', color: 'badge-yellow' };
  return { label: 'High ❗', color: 'badge-red' };
}