const rdfstore = require('rdfstore');
const fs = require('fs');
const _ = require('lodash');

// Function to create store
function createStore(){
    return new Promise((resolve,reject) => {
        rdfstore.create((err, store) => {
            if(err) reject(err);
            resolve(store);
        })
    })
}

// Function to load file
function readFile(file){
    return new Promise((resolve,reject) => {
        fs.readFile(file, "utf8", (err, data) => {
            if(err) reject(err);
            resolve(data);
        })
    })
}

// Function to load triples into an in-memory store
function loadTriplesInStore(store, triples){
    return new Promise((resolve, reject) => {
        store.load('text/turtle', triples, (err, size) => {
            if(err) reject(err);
            var message = `Loaded ${size} triples in store`;
            console.log(message);
            resolve(size);
        })
    })
}

// Function to query the store
function queryStore(store, query){
    return new Promise((resolve, reject) => {
        store.execute(query, (err, results) => {
            if(err) reject(err);
            resolve(results);
        })
    })
}

// Main function
const main = async (query, file) => {
    try {
        // Create store and read file in parallel
        const parallelResult = [await createStore(), await readFile(file)];
        const store = parallelResult[0];
        const triples = parallelResult[1];

        // Load triples in the store
        await loadTriplesInStore(store, triples);

        // Execute query
        const result = await queryStore(store, query);

        // Flatten result
        const flattened = _.map(result, obj => {
            return _.mapValues(obj, x => x.value);
        })

        // Log result to console
        console.log(flattened);

        // Log element URIs only
        console.log('---------');
        _.map(flattened, x => console.log(x.object));

    }catch(err){
        console.log(err);
    }
}

/**
 * EXECUTE
 */

const query = `
PREFIX xx:   <https://example.com#>
PREFIX bot:  <https://w3id.org/bot#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?object ?name ?displayValue
WHERE {
    ?object a bot:Element ;
        rdfs:label ?name ;
        xx:threeGeometry ?displayValue .
}`;

main(query, './data.ttl');