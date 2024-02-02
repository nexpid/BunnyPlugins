# spitroast cannot be used from deno.land/x/
Unfortunately due to Deno and TypeScript having some conflict, spitroast cannot be used from deno.land/x/.

We recommend using a CDN like esm.sh instead of deno.land for using this package.

```js
import * as spitroast from 'https://esm.sh/spitroast';
```
