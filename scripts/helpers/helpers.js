export { filterPokemons };
import { getAllPokemons } from '../network/pokedex-api.js';

//HELPERS - FUNCTION
async function filterPokemons(query) {
    const allPokemons = await getAllPokemons();
    const pokemons = [];
    for(const pokemon of allPokemons.results) {
        if(searchByQuery(pokemon.name, query)) {
            pokemons.push(pokemon)
        }
    }
    return pokemons;
}
//HELPERS - FUNCTION
function searchByQuery(str, query) {
    return (str.search(new RegExp(query.replace(/\s+/, '|'))) !== -1); 
}