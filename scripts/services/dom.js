export { renderPokemonView, renderCollectionView, removeChildren, starter, renderResults, clickTypeEventHandler,  removeResultsSection, addOpacityToSections, removeOpacityToSections, createElement, toggleLoader, displayMessage };
// import { globalUsername } from '../../src/index.js';
import { getUserPokemonsCollection, isPokemonExistsForUser, getPokemonImgByName } from "../network/my-pokedex-api.js";
import { getPokemonsByType } from "../network/pokedex-api.js";
import { globalUsername, changePokemonAngleImg, clickPokemonPickEventHandler, clickCatchReleaseHandler, searchEventHandler, signInEventHandler, clickCloseErrorHandler } from './event-handlers.js';

//DOM - FUNCTION
function renderCollectionView(pokemons) {
    const pokemonCollection = document.getElementById("pokemon-collection");
    removeChildren(pokemonCollection);
    if(pokemons.status) return;
    for(const pokemon of pokemons) {
        const pokemonName = createElement('p', [pokemon.name], ['pokemon-collection__name']);
        const pokemonImg = createElement('img', [], ['pokemon-collection__img'], { src: pokemon.front_pic });
        const divButton = createElement('div', [pokemonName, pokemonImg], ['pokemon-collection__button']);
        pokemonCollection.append(divButton);
    }
}

//DOM - FUNCTION
async function renderPokemonView(pokemon) {
    const pokemonName = document.getElementById("pokemon-view__name");
    pokemonName.textContent = pokemon.name;
    const pokemonImg = document.getElementById("pokemon-view__img");
    pokemonImg.src = pokemon.front_pic;
    const pokemonHeight = document.getElementById("pokemon-view__height");
    pokemonHeight.textContent = "Height: " + pokemon.height;
    const pokemonWeight = document.getElementById("pokemon-view__weight");
    pokemonWeight.textContent = "Weight: " + pokemon.weight;
    const pokemonTypes = document.getElementById("pokemon-view__types");
    removeChildren(pokemonTypes);
    pokemonTypes.append("Types: ");
    for(const type of pokemon.types) {
        pokemonTypes.append(createElement('button', [type.name], ["button"], {}, {click: clickTypeEventHandler} ));
    }
    const pokemonAction = document.getElementById('pokemon-view__action');
    removeChildren(pokemonAction);
    pokemonAction.append(createElement('button', [await isPokemonExistsForUser(pokemon.id, globalUsername) ? 'Release' : 'Catch'], ['button'], {}, {click: clickCatchReleaseHandler}));

}

//DOM - FUNCTION
function removeChildren(elem) {
    while(elem.firstChild) elem.removeChild(elem.firstChild);
}

//DOM - FUNCTION
const starter = async () => {
    const searchInput = document.getElementById("search__input");
    searchInput.addEventListener("keyup", searchEventHandler);
    searchInput.value = "";
    document.getElementById("search-button").addEventListener("click", searchEventHandler);

    document.getElementById("user-sign-in__input").addEventListener('keyup', signInEventHandler);
    document.getElementById("user-sign-in__button").addEventListener("click", signInEventHandler);
    if(!globalUsername) {
        displayMessage('Must sign in first!');
        return;
    }
    const pokemons = await getUserPokemonsCollection(globalUsername);
    const pokemon = !pokemons.status ? pokemons[0] : null;
    if(!pokemon) {
        return;
    }
    renderPokemonView(pokemon);
    const pokemonsCollection = await getUserPokemonsCollection(globalUsername);
    renderCollectionView(pokemonsCollection);
    document.querySelector(".pokemon-view__img").addEventListener("mouseover", changePokemonAngleImg);
    document.querySelector(".pokemon-view__img").addEventListener("mouseout", changePokemonAngleImg);

    document.querySelector("aside").addEventListener("click", clickPokemonPickEventHandler);

    document.getElementById('error__close').addEventListener('click', clickCloseErrorHandler);


    document.querySelector('.errors').classList.remove('display-block');
};

//DOM - FUNCTION
async function renderResults(pokemons) {
    toggleLoader();
    const resultsSection = createElement('section', [], ["search__results"], {id: "search__results"});
    
    for(const pokemon of pokemons) {
        let resultDiv;
        if(pokemon["pokemon"]) {
            let img = "";
            if(pokemons.length < 10) img = createElement('img', [], ["result__img"], {src: await getPokemonImgByName(pokemon["pokemon"].name)});
            
            const imgDiv = createElement('div', [img], ["result__img-div"]);
            const nameP = createElement('p', [pokemon["pokemon"].name], ["result__name", "pokemon-collection__name"]);
            resultDiv = createElement('div', [imgDiv, nameP], ["search__result", "row", "pokemon-collection__button"]);
        } else {
            let img = "";
            if(pokemons.length < 10) img = createElement('img', [], ["result__img"], {src: await getPokemonImgByName(pokemon.name)});
            
            const imgDiv = createElement('div', [img], ["result__img-div"]);
            const nameP = createElement('p', [pokemon.name], ["result__name", "pokemon-collection__name"]);
            resultDiv = createElement('div', [imgDiv, nameP], ["search__result", "row", "pokemon-collection__button"]);
        }
        
        resultsSection.append(resultDiv);
    }
    if(pokemons.length === 0) resultsSection.append("Pokemon Not Found!");
    
    const closeResults = createElement('button', ["X"], ["close__results"], {}, {click: removeResultsSection});
    
    
    const resultsContainer = createElement('div', [closeResults, resultsSection], ["results-container"]);
    toggleLoader();
    
    removeResultsSection();
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    addOpacityToSections(null, main, footer);
    main.before(resultsContainer);
    resultsSection.addEventListener("click", clickPokemonPickEventHandler);
}
async function clickTypeEventHandler(e) {
    const type = e.target.textContent;
    const pokemons = await getPokemonsByType(type);
    renderResults(pokemons);
}

//DOM - FUNCTION
function removeResultsSection() {
    const resultsCheck = document.querySelector(".results-container");
    if(resultsCheck) resultsCheck.remove();

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    removeOpacityToSections(null, main, footer);
}

//DOM - FUNCTION
function addOpacityToSections(header = null, main = null, footer = null) {
    if(header) header.classList.add("opacity");
    if(main) main.classList.add("opacity");
    if(footer) footer.classList.add("opacity");
}
//DOM - FUNCTION
function removeOpacityToSections(header = null, main = null, footer = null) {
    if(header) header.classList.remove("opacity");
    if(main) main.classList.remove("opacity");
    if(footer) footer.classList.remove("opacity");
}

//DOM - FUNCTION
/**
 * Creates a new DOM element.
 *
 * Example usage:
 * createElement("div", ["just text", createElement(...)], ["nana", "banana"], {id: "bla"})
 *
 * @param {String} tagName - the type of the element
 * @param {Array} children - the child elements for the new element.
 *                           Each child can be a DOM element, or a string (if you just want a text element).
 * @param {Array} classes - the class list of the new element
 * @param {Object} attributes - the attributes for the new element
 */
 function createElement(tagName, children = [], classes = [], attributes = {}, eventListeners = {}) {
    const element = document.createElement(tagName);
    for(const child of children) element.append(child);
    element.classList = classes.join(" ");
    for(const attr in attributes) element.setAttribute(attr, attributes[attr]);
    for(const event in eventListeners) element.addEventListener(event, eventListeners[event]);
    return element;
}

//DOM - FUNCTION
function toggleLoader() {
    const div = document.getElementById("loader-div");

    const header = document.querySelector("header");
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    if(div) {
        div.remove();
        removeOpacityToSections(header, main, footer);
    } else {
        const img = createElement('img', [], ["loaderImg"], {src: "./images/loading.gif"});
        const loaderDiv = createElement("div", [img], ["loaderDiv", "results-container"], {id: "loader-div"});
        document.body.append(loaderDiv);

        addOpacityToSections(header, main, footer);
    }
}

//DOM - FUNCTION
function displayMessage(message) {
    const errorsSection = document.querySelector('.errors');
    errorsSection.classList.add('display-block');
    const errorMessageElem = document.querySelector('.error__message');
    errorMessageElem.textContent = message;
}
