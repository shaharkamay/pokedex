const baseURL = "https://pokeapi.co/api/v2/";
let allPokemons= {};

async function getData(url) {
    const response = await axios.get(url);
    return response.data;
}

async function getPokemonByName(name) {
    const pokemon = await getData(`${baseURL}pokemon/${name}`);
    return pokemon;
}

async function getPokemonById(id) {
    const pokemon = await getData(`${baseURL}pokemon/${id}`);
    return pokemon;
}

async function getAllPokemons() {
    const pokemons = await getData(`${baseURL}pokemon?limit=10000`);
    return pokemons;
}

async function getPokemonImgByName(name) {
    const pokemon = await getPokemonByName(name);
    return pokemon.sprites.front_default;
}

async function getPokemonsByType(type) {
    const pokemons = await getData(`${baseURL}type/${type}`);
    return pokemons.pokemon;
}

function renderPokemonView(pokemon) {
    const pokemonName = document.getElementById("pokemon-view__name");
    pokemonName.textContent = pokemon.name;
    const pokemonImg = document.getElementById("pokemon-view__img");
    pokemonImg.src = pokemon.sprites.front_default;
    const pokemonHeight = document.getElementById("pokemon-view__height");
    pokemonHeight.textContent = "Height: " + pokemon.height;
    const pokemonWeight = document.getElementById("pokemon-view__weight");
    pokemonWeight.textContent = "Weight: " + pokemon.weight;
    const pokemonTypes = document.getElementById("pokemon-view__types");
    pokemonTypes.append("types: ");
    const types = [];
    for(const type of pokemon.types) {
        pokemonTypes.append(createElement('button', [type["type"].name], [], {}, {click: clickTypeEventHandler} ));
    }

    //  types.join(", ");
}

function changePokemonAngleImg(pokemon) {
    const pokemonImg = document.getElementById("pokemon-view__img");
    if(pokemonImg.src === pokemon.sprites.back_default) {
        pokemonImg.src = pokemon.sprites.front_default;
    } else {
        pokemonImg.src = pokemon.sprites.back_default;
    }
}


(async () => {
    allPokemons = await getAllPokemons();
    const pokemon = await getPokemonByName("bulbasaur");
    renderPokemonView(pokemon);
    // filterPokemons();
    document.querySelector(".pokemon-view__img").addEventListener("mouseover", () => {changePokemonAngleImg(pokemon)});
    document.querySelector(".pokemon-view__img").addEventListener("mouseout", () => {changePokemonAngleImg(pokemon)});
    document.getElementById("search__input").addEventListener("keyup", keyupSearchEventHandler);
})();

function filterPokemons(query) {
    const pokemons = [];
    for(const pokemon of allPokemons.results) {
        if(searchByQuery(pokemon.name, query)) {
            pokemons.push(pokemon)
            // console.log(pokemonDirect.name);
        }
    }
    return pokemons;
}
function searchByQuery(str, query) {
    return (str.search(new RegExp(query.replace(/\s+/, '|'))) !== -1); 
}

function keyupSearchEventHandler(e) {
    if(!e.target.value) return;

    renderResults(filterPokemons(e.target.value));
}

async function renderResults(pokemons) {
    
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    addOpacityToSections(null, main, footer);
    
    const resultsSection = createElement('section', [], ["search__results"], {id: "search__results"});
    
    console.log(pokemons)
    for(const pokemon of pokemons) {
        let resultDiv;
        if(pokemon["pokemon"]) {
            const img = createElement('img', [], ["result__img"], {src: await getPokemonImgByName(pokemon["pokemon"].name)});
            
            const imgDiv = createElement('div', [img], ["result__img-div"]);
            const nameP = createElement('p', [pokemon["pokemon"].name], ["result__name"]);
            resultDiv = createElement('div', [imgDiv, nameP], ["search__result", "row"]);
        } else {
            const img = createElement('img', [], ["result__img"], {src: await getPokemonImgByName(pokemon.name)});
            
            const imgDiv = createElement('div', [img], ["result__img-div"]);
            const nameP = createElement('p', [pokemon.name], ["result__name"]);
            resultDiv = createElement('div', [imgDiv, nameP], ["search__result", "row"]);
        }
        
        resultsSection.append(resultDiv);
    }
    
    const closeResults = createElement('button', ["X"], ["close__results"], {}, {click: removeResultsSection});
    
    
    const resultsContainer = createElement('div', [closeResults, resultsSection], ["results-container"]);
    
    removeResultsSection();
    main.before(resultsContainer);
}
async function clickTypeEventHandler(e) {
    const type = e.target.textContent;
    const pokemons = await getPokemonsByType(type);
    renderResults(pokemons);
}

function removeResultsSection() {
    const resultsCheck = document.querySelector(".results-container");
    if(resultsCheck) resultsCheck.remove();

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    removeOpacityToSections(null, main, footer);
}

function addOpacityToSections(header = null, main = null, footer = null) {
    if(header) header.classList.add("opacity");
    if(main) main.classList.add("opacity");
    if(footer) footer.classList.add("opacity");
}
function removeOpacityToSections(header = null, main = null, footer = null) {
    if(header) header.classList.remove("opacity");
    if(main) main.classList.remove("opacity");
    if(footer) footer.classList.remove("opacity");
}

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

