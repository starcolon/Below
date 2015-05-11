# Below 

Below module is a javascript library implementing on top of `Grid` module for spatial routing application. This module is specifically designed for `io.js` and absolutely won't run on the classical node.js.

## Include Below to your project
As simple as getting an F grade in the first semester, you can simply just `require` Below.js file as follows:

```javascript
var below = require('./below.js');
```

## Generating a Grid from settings
As mentioned on the top of this document, Below library does extend functionalities of `Grid` for spatial routing app. You can eaither create a grid data structure using conventional Grid library or create it on the fly with a help of Below library.

To create your first grid from the settings, try this:
```javascript
var settings = below.settings.create(); // create the setting package
settings.size = {width: 50, height:50};
settings.entrances.push({i:25,j:0});
settings.exits.push({i:49,j:49});

var grid = below.generate(settings); // generate a grid according to the settings
```