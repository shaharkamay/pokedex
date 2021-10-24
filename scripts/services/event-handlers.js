export { globalUsername, changePokemonAngleImg, clickPokemonPickEventHandler, clickCatchReleaseHandler, searchEventHandler, signInEventHandler, clickCloseErrorHandler };
import { signInSignUp, getPokemonByName, getPokemonById, releasePokemon, getUserPokemonsCollection, catchPokemon } from '../network/my-pokedex-api.js';
import { starter, removeResultsSection, renderPokemonView, renderCollectionView, renderResults } from './dom.js';
import { filterPokemons } from '../helpers/helpers.js'

let globalUsername = null;


//EVENT-HANDLERS - FUNCTION
function changePokemonAngleImg() {
    const pokemonImg = document.getElementById("pokemon-view__img");
    if(pokemonImg.src.indexOf("/back") === -1) {
        pokemonImg.src = pokemonImg.src.replace("pokemon/", "pokemon/back/");
    } else {
        pokemonImg.src = pokemonImg.src.replace("pokemon/back/", "pokemon/");
    }
}

//EVENT-HANDLERS - FUNCTION
async function clickPokemonPickEventHandler(e) {
    removeResultsSection();
    const pokemonPickDiv = e.target.closest(".pokemon-collection__button");
    if(!pokemonPickDiv) return;
    const pokemon = await getPokemonByName(pokemonPickDiv.querySelector(".pokemon-collection__name").textContent, globalUsername);
    if(pokemon) renderPokemonView(pokemon);
}

//EVENT-HANDLERS - FUNCTION
async function clickCatchReleaseHandler(e) {
    if(e.target.textContent === 'Catch') {
        const pokemonName = document.getElementById('pokemon-view__name').textContent;
        await catchPokemon(pokemonName, globalUsername);
        renderCollectionView(await getUserPokemonsCollection(globalUsername));
        e.target.textContent = 'Release';
    } else {
        const pokemonName = document.getElementById('pokemon-view__name').textContent;
        await releasePokemon(pokemonName, globalUsername);
        renderCollectionView(await getUserPokemonsCollection(globalUsername));
        e.target.textContent = 'Catch';
    }
}

//EVENT-HANDLERS - FUNCTION
async function searchEventHandler(e) {
    const searchInput = document.getElementById("search__input");
    if(e.target.tagName !== 'BUTTON') {
        if(!searchInput.value) return;
        if(e.key !== 'Enter') return;
    }
    if(!searchInput.value) return;
    
    if(isNaN(searchInput.value)) renderResults(await filterPokemons(searchInput.value));
    else {
        await getPokemonById(searchInput.value, globalUsername).then((pokemon) => {
            if(pokemon) {
                if(pokemon.name) renderPokemonView(pokemon);
            }
        });
    }
}
//EVENT-HANDLERS - FUNCTION
function signInEventHandler(e) {
    const signInInput = document.getElementById("user-sign-in__input");
    if(e.target.tagName !== 'BUTTON') {
        if(!signInInput.value) return;
        if(e.key !== 'Enter') return;
    }
    if(!signInInput.value) return;
    
    signInSignUp(signInInput.value);
    globalUsername = signInInput.value;
    starter();
}

//EVENT-HANDLERS - FUNCTION
function clickCloseErrorHandler(e) {
    if(e.target.tagName !== 'BUTTON') return;

    const errorsSection = document.querySelector('.errors');
    errorsSection.classList.remove('display-block');
}