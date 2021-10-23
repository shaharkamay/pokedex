const baseUrlPokeApi = "https://pokeapi.co/api/v2/";
const baseURL = 'http://localhost:8080/';
let allPokemons= {};// fixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

async function getData(url, username) {
    const response = await axios.get(url, {
        headers: {
            username,
        }
    });
    return response.data;
}

async function setData(url, username) {
    await axios.put(url, {
        headers: {
            username,
        }
    })
}

async function deleteData(url, username) {
    await axios.delete(url, {
        headers: {
            username,
        }
    })
}

async function getPokemonByName(name) {
    const pokemon = await getData(`${baseURL}pokemon/query?name=${name}`, 'max');
    return pokemon;
}

async function getPokemonById(id) {
    const pokemon = await getData(`${baseURL}pokemon/get/${id}`, 'max');
    return pokemon;
}

async function getAllPokemons() { //fixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const pokemons = await getData(`${baseUrlPokeApi}pokemon?limit=10000`);
    return pokemons;
}

async function getPokemonImgByName(name) {
    const pokemon = await getPokemonByName(name);
    return pokemon.front_pic;
}

async function getPokemonsByType(type) {
    const pokemons = await getData(`${baseUrlPokeApi}type/${type}`);
    return pokemons.pokemon;
}

async function getUserPokemonsCollection(username) {
    const pokemons = await getData(`${baseURL}pokemon/`, username);
    return pokemons;
}

async function isPokemonExistsForUser(pokemonId, username) {
    const userPokemons = await getUserPokemonsCollection(username);
    for(const userPokemon of userPokemons) {
        if(pokemonId === userPokemon.id) {
            return true;
        }
    }
    return false;
}

async function catchPokemon(pokemonName, username) {
    const pokemon = await getPokemonByName(pokemonName);
    await setData(`${baseURL}pokemon/catch/${pokemon.id}`, username);
}
async function releasePokemon(pokemonName, username) {
    const pokemon = await getPokemonByName(pokemonName);
    await deleteData(`${baseURL}pokemon/release/${pokemon.id}`, username);
}

function renderCollectionView(pokemons) {
    const pokemonCollection = document.getElementById("pokemon-collection");
    removeChildren(pokemonCollection);
    for(const pokemon of pokemons) {
        const pokemonName = createElement('p', [pokemon.name], ['pokemon-collection__name']);
        const pokemonImg = createElement('img', [], ['pokemon-collection__img'], { src: pokemon.front_pic });
        const divButton = createElement('div', [pokemonName, pokemonImg], ['pokemon-collection__button']);
        pokemonCollection.append(divButton);
    }
}

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
    pokemonAction.append(createElement('button', [await isPokemonExistsForUser(pokemon.id, 'max') ? 'Release' : 'Catch'], ['button'], {}, {click: clickCatchReleaseHandler}));

}

function removeChildren(elem) {
    while(elem.firstChild) elem.removeChild(elem.firstChild);
}

function changePokemonAngleImg() {
    const pokemonImg = document.getElementById("pokemon-view__img");
    if(pokemonImg.src.indexOf("/back") === -1) {
        pokemonImg.src = pokemonImg.src.replace("pokemon/", "pokemon/back/");
    } else {
        pokemonImg.src = pokemonImg.src.replace("pokemon/back/", "pokemon/");
    }
}


(async () => {
    allPokemons = await getAllPokemons();
    const pokemon = await getPokemonByName("bulbasaur");
    renderPokemonView(pokemon);
    const pokemonsCollection = await getUserPokemonsCollection('max');
    renderCollectionView(pokemonsCollection);
    // filterPokemons();
    document.querySelector(".pokemon-view__img").addEventListener("mouseover", changePokemonAngleImg);
    document.querySelector(".pokemon-view__img").addEventListener("mouseout", changePokemonAngleImg);
    const searchInput = document.getElementById("search__input");
    searchInput.addEventListener("keyup", searchEventHandler);
    searchInput.value = "";
    document.getElementById("search-button").addEventListener("click", searchEventHandler);

    document.querySelector("aside").addEventListener("click", clickPokemonPickEventHandler);
})();

function filterPokemons(query) {
    const pokemons = [];
    for(const pokemon of allPokemons.results) {
        if(searchByQuery(pokemon.name, query)) {
            pokemons.push(pokemon)
        }
    }
    return pokemons;
}
function searchByQuery(str, query) {
    return (str.search(new RegExp(query.replace(/\s+/, '|'))) !== -1); 
}

async function clickPokemonPickEventHandler(e) {
    removeResultsSection();
    const pokemonPickDiv = e.target.closest(".pokemon-collection__button");
    if(!pokemonPickDiv) return;
    const pokemon = await getPokemonByName(pokemonPickDiv.querySelector(".pokemon-collection__name").textContent);
    renderPokemonView(pokemon);

}

async function clickCatchReleaseHandler(e) {
    if(e.target.textContent === 'Catch') {
        const pokemonName = document.getElementById('pokemon-view__name').textContent;
        await catchPokemon(pokemonName, 'max');
        renderCollectionView(await getUserPokemonsCollection('max'));
        e.target.textContent = 'Release';
    } else {
        const pokemonName = document.getElementById('pokemon-view__name').textContent;
        await releasePokemon(pokemonName, 'max');
        renderCollectionView(await getUserPokemonsCollection('max'));
        e.target.textContent = 'Catch';
    }
}

async function searchEventHandler(e) {
    const searchInput = document.getElementById("search__input");
    if(e.target.tagName !== 'BUTTON') {
        if(!searchInput.value) return;
        if(e.key !== 'Enter') return;
    }
    if(!searchInput.value) return;
    
    if(isNaN(searchInput.value)) renderResults(filterPokemons(searchInput.value));
    else {
        await getPokemonById(searchInput.value).then((pokemon) => {
            renderPokemonView(pokemon);
        }, (err) => {
            window.alert(`${err}\nPokemon Not Found!`);
        });
    }
}

async function renderResults(pokemons) {
    toggleLoader();
    const resultsSection = createElement('section', [], ["search__results"], {id: "search__results"});
    
    for(const pokemon of pokemons) {
        let resultDiv;
        if(pokemon["pokemon"]) {
            const img = createElement('img', [], ["result__img"], {src: await getPokemonImgByName(pokemon["pokemon"].name)});
            
            const imgDiv = createElement('div', [img], ["result__img-div"]);
            const nameP = createElement('p', [pokemon["pokemon"].name], ["result__name", "pokemon-collection__name"]);
            resultDiv = createElement('div', [imgDiv, nameP], ["search__result", "row", "pokemon-collection__button"]);
        } else {
            const img = createElement('img', [], ["result__img"], {src: await getPokemonImgByName(pokemon.name)});
            
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