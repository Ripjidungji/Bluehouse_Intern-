const BASE = 'https://api.spoonacular.com'
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY
const africanCountries = new Set([
  'Africa',
  'Algeria',
  'Angola',
  'Benin',
  'Botswana',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cameroon',
  'Central African Republic',
  'Chad',
  'Comoros',
  'Congo',
  'Democratic Republic of the Congo',
  'Djibouti',
  'Egypt',
  'Equatorial Guinea',
  'Eritrea',
  'Eswatini',
  'Ethiopia',
  'Gabon',
  'Gambia',
  'Ghana',
  'Guinea',
  'Guinea-Bissau',
  'Ivory Coast',
  'Kenya',
  'Lesotho',
  'Liberia',
  'Libya',
  'Madagascar',
  'Malawi',
  'Mali',
  'Mauritania',
  'Mauritius',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Niger',
  'Nigeria',
  'Rwanda',
  'Sao Tome and Principe',
  'Senegal',
  'Seychelles',
  'Sierra Leone',
  'Somalia',
  'South Africa',
  'South Sudan',
  'Sudan',
  'Tanzania',
  'Togo',
  'Tunisia',
  'Uganda',
  'Zambia',
  'Zimbabwe',
])

function apiUrl(path, params = {}) {
  const url = new URL(`${BASE}${path}`)
  if (API_KEY) url.searchParams.set('apiKey', API_KEY)
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') url.searchParams.set(key, String(value))
  })
  return url
}

async function handleResponse(res) {
  if (res.status === 401 || res.status === 403) {
    throw new Error('Invalid or missing API key. Add VITE_SPOONACULAR_API_KEY to your .env file.')
  }
  if (res.status === 402) {
    throw new Error('Spoonacular API quota exceeded. Try again tomorrow or upgrade your plan.')
  }
  if (!res.ok) {
    throw new Error(`API request failed (${res.status})`)
  }
  return res.json()
}

export function hasApiKey() {
  return Boolean(API_KEY)
}

export async function searchRecipes(query, country = 'all') {
  const isAfricanCountry = africanCountries.has(country)
  const data = await fetch(
    apiUrl('/recipes/complexSearch', {
      query,
      number: 12,
      cuisine: country === 'all' ? undefined : isAfricanCountry ? 'African' : country,
    }),
  ).then(handleResponse)
  return data.results ?? []
}

export async function searchByIngredients(ingredients) {
  const csv = ingredients
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',')

  return fetch(
    apiUrl('/recipes/findByIngredients', {
      ingredients: csv,
      number: 12,
      ranking: 1,
      ignorePantry: true,
    }),
  ).then(handleResponse)
}

export async function getRecipeDetails(id) {
  return fetch(
    apiUrl(`/recipes/${id}/information`, { includeNutrition: false }),
  ).then(handleResponse)
}

export async function getRandomRecipe() {
  const data = await fetch(apiUrl('/recipes/random', { number: 1 })).then(handleResponse)
  return data.recipes?.[0] ?? null
}

export function stripHtml(html = '') {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? ''
}
