export default function SearchBar({
  query,
  setQuery,
  searchMode,
  setSearchMode,
  country,
  setCountry,
  onSearch,
  loading,
}) {
  const countries = [
    ['all', 'All countries'],
    ['Africa', 'Africa'],
    ['Algeria', 'Algeria'],
    ['Angola', 'Angola'],
    ['Benin', 'Benin'],
    ['Botswana', 'Botswana'],
    ['Burkina Faso', 'Burkina Faso'],
    ['Burundi', 'Burundi'],
    ['Cabo Verde', 'Cabo Verde'],
    ['Cameroon', 'Cameroon'],
    ['Central African Republic', 'Central African Republic'],
    ['Chad', 'Chad'],
    ['Comoros', 'Comoros'],
    ['Congo', 'Congo'],
    ['Democratic Republic of the Congo', 'Democratic Republic of the Congo'],
    ['Djibouti', 'Djibouti'],
    ['Egypt', 'Egypt'],
    ['Equatorial Guinea', 'Equatorial Guinea'],
    ['Eritrea', 'Eritrea'],
    ['Eswatini', 'Eswatini'],
    ['Ethiopia', 'Ethiopia'],
    ['Gabon', 'Gabon'],
    ['Gambia', 'Gambia'],
    ['Ghana', 'Ghana'],
    ['Guinea', 'Guinea'],
    ['Guinea-Bissau', 'Guinea-Bissau'],
    ['Ivory Coast', 'Ivory Coast'],
    ['Kenya', 'Kenya'],
    ['Lesotho', 'Lesotho'],
    ['Liberia', 'Liberia'],
    ['Libya', 'Libya'],
    ['Madagascar', 'Madagascar'],
    ['Malawi', 'Malawi'],
    ['Mali', 'Mali'],
    ['Mauritania', 'Mauritania'],
    ['Mauritius', 'Mauritius'],
    ['Morocco', 'Morocco'],
    ['Mozambique', 'Mozambique'],
    ['Namibia', 'Namibia'],
    ['Niger', 'Niger'],
    ['Nigeria', 'Nigeria'],
    ['Rwanda', 'Rwanda'],
    ['Sao Tome and Principe', 'Sao Tome and Principe'],
    ['Senegal', 'Senegal'],
    ['Seychelles', 'Seychelles'],
    ['Sierra Leone', 'Sierra Leone'],
    ['Somalia', 'Somalia'],
    ['South Africa', 'South Africa'],
    ['South Sudan', 'South Sudan'],
    ['Sudan', 'Sudan'],
    ['Tanzania', 'Tanzania'],
    ['Togo', 'Togo'],
    ['Tunisia', 'Tunisia'],
    ['Uganda', 'Uganda'],
    ['Zambia', 'Zambia'],
    ['Zimbabwe', 'Zimbabwe'],
    ['American', 'United States'],
    ['British', 'United Kingdom'],
    ['Cajun', 'Cajun'],
    ['Caribbean', 'Caribbean'],
    ['Chinese', 'China'],
    ['Eastern European', 'Eastern Europe'],
    ['European', 'Europe'],
    ['French', 'France'],
    ['German', 'Germany'],
    ['Greek', 'Greece'],
    ['Indian', 'India'],
    ['Irish', 'Ireland'],
    ['Italian', 'Italy'],
    ['Japanese', 'Japan'],
    ['Jewish', 'Jewish'],
    ['Korean', 'Korea'],
    ['Latin American', 'Latin America'],
    ['Mediterranean', 'Mediterranean'],
    ['Mexican', 'Mexico'],
    ['Middle Eastern', 'Middle East'],
    ['Nordic', 'Nordic'],
    ['Spanish', 'Spain'],
    ['Thai', 'Thailand'],
    ['Vietnamese', 'Vietnam'],
  ]

  return (
    <section className="mx-auto max-w-3xl px-4 pb-8">
      <div className="mb-4 flex justify-center gap-2">
        {['recipes', 'ingredients'].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSearchMode(mode)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              searchMode === mode
                ? 'bg-kitchen-terracotta text-white shadow-md'
                : 'bg-white/60 text-kitchen-charcoal hover:bg-white'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSearch()
        }}
        className="flex gap-2 rounded-2xl border border-white/40 bg-white/70 p-2 shadow-xl backdrop-blur-md"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            searchMode === 'recipes'
              ? 'Search recipes… e.g. pasta, curry, tacos'
              : 'Search by ingredients… e.g. chicken, rice, tomato'
          }
          className="flex-1 bg-transparent px-4 py-3 text-kitchen-charcoal outline-none placeholder:text-gray-400"
        />
        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          disabled={loading || searchMode === 'ingredients'}
          aria-label="Choose a country"
          title={searchMode === 'ingredients' ? 'Country filtering is available for recipe searches' : 'Choose a country'}
          className="max-w-36 rounded-xl border border-kitchen-sage/30 bg-white/70 px-2 py-3 text-sm text-kitchen-charcoal outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-44"
        >
          {countries.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-xl bg-kitchen-terracotta px-6 py-3 font-semibold text-white transition hover:bg-kitchen-terracotta/90 disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Find'}
        </button>
      </form>
    </section>
  )
}
