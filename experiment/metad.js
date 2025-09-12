/*
    To compile the model for TinyStan:
    - install Docker and run `docker run -p 8083:8080 -it ghcr.io/flatironinstitute/stan-wasm-server:latest`
    - copy the stan file to the docker using e.g., `docker cp <file.stan> <container>:app/tinystan/metad/<file.stan>`
    - inside the docker, ensure that oneTBB and tinystan are setup (https://github.com/WardBrian/stan-web-demo/blob/main/DEVELOPMENT.md)
    - build the model from the `tinystan` directory by running `emmake make <model.js>`
    - copy both `model.js` and `model.wasm` to your local computer
*/
import StanModel from "https://cdn.jsdelivr.net/npm/tinystan/+esm"; // import directly from jsDelivr
import createModule from "../analysis/metad_flat.js";

// simple print callback to replace printCallbackSponge because it cannot be directly imported in esm version
function makePrintCallback() {
    let buffer = "";
    return {
        printCallback: (s) => { buffer += s + "\n"; },
        getStdout: () => buffer,
        clearStdout: () => { buffer = ""; }
    };
}
const { printCallback, getStdout, clearStdout } = makePrintCallback();

// helper function to run stan recursively
function _analyze(stan_params = {}, attempts = 1) {
    console.log('Attempts left: ' + attempts);

    if (attempts <= 0)
        throw new Error('');

    // load Stan model
    return StanModel.load(createModule, printCallback)
        .then(model => model.sample(stan_params))
        .then(fit => zip(fit.paramNames, fit.draws))
        .catch(err => {
            console.log(err);
            return _analyze(stan_params, attempts - 1);
        });
}

/*
 * analyze(stan_params):
 *   run the metad model on the data
 *   
 *   arguments:  
 *     stan_params: a tinystan SamplerParams object (https://brianward.dev/tinystan/latest/languages/js.html#samplerparams)
 * 
 *   value:
 *     an object containing the model draws  
 */
function analyze(stan_params = {}, num_attempts = 100) {
    return _analyze(stan_params, num_attempts)
        .catch(() => {
            throw new Error(`Analysis failed after ${num_attempts} attempts.`)
        });
}

export { analyze };
