export {getAllPokemons, getPokemonsByType};

const baseUrlPokeApi = "https://pokeapi.co/api/v2/";

async function getData(url) {
    const response = await axios.get(url);
    return response.data;
}

async function getAllPokemons() {
    const pokemons = await getData(`${baseUrlPokeApi}pokemon?limit=10000`);
    return pokemons;
}

async function getPokemonsByType(type) {
    const pokemons = await getData(`${baseUrlPokeApi}type/${type}`);
    if(!pokemons) return null;
    return pokemons.pokemon;
}