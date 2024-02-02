![](https://raw.githubusercontent.com/Cumcord/assets/main/spitroast/banner.svg)

# spitroast
A very simple JavaScript monkeypatcher library that inserts your code in both ends.

# Usage
```javascript
// ESM
import * as spitroast from 'spitroast';

// CJS
const spitroast = require('spitroast');

// Deno / CDN
import * as spitroast from 'https://esm.sh/spitroast';

const exampleObject = { testFunction: () => {} };

// Patches that run before the original function
spitroast.before('testFunction', exampleObject, (args) => { // args is an array of arguments passed to the function
  console.log('Before');

  // You can return an array to replace the original arguments
}, false); // Change false to true to unpatch after the patch is first called!

exampleObject.testFunction(); // logs "Before"


// Patches that run after the original function
spitroast.after('testFunction', exampleObject, (args, response) => { // response is the return value of the function
  console.log('After');

  // You can return something to replace the original response
});

exampleObject.testFunction(); // logs "Before", then "After"


// Patches that replace the original function
const unpatch = spitroast.instead('testFunction', exampleObject, (args, originalFunction) => { // instead patches are passed the original function as the second argument
  console.log('Instead')
});

exampleObject.testFunction(); // logs "Instead" and nothing else

// Unpatches are as simple as running the return value of the patch function
unpatch();
// Now if you call the function it'll log "Before" and "After" again

// You can also unpatch every patch
spitroast.unpatchAll();

// Patches inherit context from the original function, you just have to use `this`
```
