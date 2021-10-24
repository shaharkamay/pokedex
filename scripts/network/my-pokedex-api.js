export { getPokemonByName, getPokemonById, getPokemonImgByName, getUserPokemonsCollection, isPokemonExistsForUser, catchPokemon, releasePokemon, signInSignUp };
import { displayMessage } from "../services/dom.js"

const baseURL = 'http://localhost:8080/';

async function getData(url, username) {
    const response = await axios.get(url, {
        headers: {
            username,
        }
    });

    if(response.data.status >= 400) {
        displayMessage(response.data.message);
    }
    return response.data;
}

async function putData(url, username) {
    const response = await axios.put(url, {
        headers: {
            username,
        }
    })
    if(response.data.status >= 400) {
        displayMessage(response.data.message);
    }
}

async function deleteData(url, username) {
    const response = await axios.delete(url, {
        headers: {
            username,
        }
    })
    if(response.data.status >= 400) {
        displayMessage(response.data.message);
    }
}

async function postData(url, username = nul) {
    const response = await axios.post(url, {
        headers: {
            username,
        }
    });
    if(response.data.status >= 400) {
        displayMessage(response.data.message);
    }
}

async function getPokemonByName(name, username) {
    const pokemon = await getData(`${baseURL}pokemon/query?name=${name}`, username);
    return pokemon;
}

async function getPokemonById(id, username) {
    const pokemon = await getData(`${baseURL}pokemon/get/${id}`, username);
    return pokemon;
}

async function getPokemonImgByName(name) {
    const pokemon = await getPokemonByName(name);
    if(pokemon) return pokemon.front_pic;
    return null;
}

async function getUserPokemonsCollection(username) {
    const pokemons = await getData(`${baseURL}pokemon/`, username);
    return pokemons;
}

async function isPokemonExistsForUser(pokemonId, username) {
    const userPokemons = await getUserPokemonsCollection(username);
    if(userPokemons.status) return false;
    for(const userPokemon of userPokemons) {
        if(pokemonId === userPokemon.id) {
            return true;
        }
    }
    return false;
}

async function catchPokemon(pokemonName, username) {
    const pokemon = await getPokemonByName(pokemonName);
    if(pokemon) await putData(`${baseURL}pokemon/catch/${pokemon.id}`, username);
}
async function releasePokemon(pokemonName, username) {
    const pokemon = await getPokemonByName(pokemonName);
    if(pokemon) await deleteData(`${baseURL}pokemon/release/${pokemon.id}`, username);
}

async function signInSignUp(userName) {
    await postData(`${baseURL}users/info`, userName);
}
