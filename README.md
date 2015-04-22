# datalib

[![Build Status](https://travis-ci.org/uwdata/datalib.svg?branch=master)](https://travis-ci.org/uwdata/datalib)

JavaScript data utility library. Provides facilities for data loading,
type inference, common statistics, and string templates.

Created to power [Vega](http://vega.github.io) and related projects.

## Use

Datalib provides a set of utilities for working with data. These include:

- Loading and parsing data files (e.g., JSON, TopoJSON, CSV, TSV)
- Summary statistics (e.g., mean, stdev, median, skew, etc)
- Data-driven string templates, including a set of expressive filters
- Various utilities for working with JavaScript data types

Datalib can be used both server-side and client-side. For use in node.js,
simply `npm install datalib` or include datalibaas a dependency in your package.json file. For use on the client, datalib can be bundled into a single minified JS file via browserify (see below for details).

### Example

```
// Load datalib.
var dl = require('datalib');

// Load and parse a CSV file. Datalib does type inference for you.
// The result is an array of JavaScript objects with named values.
// Parsed dates are stored as UNIX timestamp values.
var csv = dl.csv("http://trifacta.github.io/vega/data/stocks.csv");

// Show summary statistics for each column of the data table.
console.log(dl.summary(csv).toString());
```

## Build Process

To use datalib in the browser, you need to build the datalib.js and datalib.min.js files. We use the [gulp](http://gulpjs.com/) build system along with [browserify](http://browserify.org/) to build the file.

1. Install gulp, as needed. Follow [step 1 on the Gulp Getting Started guide](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md).
2. Run `npm install` in the datalib folder to install dependencies.
3. Run `gulp`.
