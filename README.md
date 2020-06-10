# CSV Store

## Summary

This module creates a store for loading and accessing data from static CSV files. It is designed so data can be loaded from a series of CSV files as needed, instead of loading a large file all at once. Built using:

- [zustand](https://github.com/react-spring/zustand) (provides base store)
- d3-dsv (for parsing)
- axios (for file requests)

## Usage

```
npm i static-csv-store
```

```js
import createCsvStore from "static-csv-store";

// create the store
const [useStore] = createCsvStore(
  // endpoint
  "https://data.edopportunity.org/dev/scatterplot/meta/schools",
  // csv columns to store
  ["id", "name", "lat", "lon"]
);
```

See [zustand](https://github.com/react-spring/zustand) documentation on how to use the store. The state of the store will have the following properties:

### Properties

- `data`: an object containing all of the loaded data. each data entry is stored as an array of values with the primary key (default `id`) as the key.
- `loading`: an array of the files currently loading
- `loaded`: an array of files that have been loaded into the store
- `errors`: an array of errors that have occured when loading files

### Methods

- `loadFile({ file, key, parser })`: a function that loads a csv file into the data store
  - `file`: the filename to load from the endpoint (e.g. `/texas/schools.csv`)
  - `key`: the column name to use as the primary key
  - `parser`: a function to parse each row (default: `d3.autoType`)
- `getData({ filters, columns })`: a function for retrieving data from the store
  - `filters`: an array of filters to filter data in the store
  - `columns`: an array of columns to keep in the returned data

## Example

Take a look at the [demo](https://static-csv-store-demo.surge.sh/) (`/demo/src`) for a closer look at how to use the store.

1. Create a store for CSV data

**File:** `store.js`

```js
import createCsvStore from "static-csv-store";

// create the store
const [useStore] = createCsvStore(
  // endpoint
  "https://data.edopportunity.org/dev/scatterplot/meta/schools",
  // csv columns to store
  ["id", "name", "lat", "lon"]
);

// you can export the `useStore` hook as is
// but it is nice to provide some shorthand
// hooks for common use cases

// shorthand to provide loader
export const useLoader = () =>
  useStore((state) => state.loadFile);

// shorthand to provide data
export const useData = (options = {}) => {
  const data = useStore((state) => state.data);
  const columnMap = useStore((state) => state.columnMap);
  return selectData({ data, columnMap, ...options });
};

// provide store
export default useStore;
```

2. Use the store in a component

```js
import { useLoader, useData } from "./store";

// component re-renders any time data changes
export default function County({ county }) {
  // get loader for the store
  const loadFile = useLoader();
  // get the data from the store
  const allSchools = useData();

  // load schools for a county whenever county changes
  useEffect(() => {
    loadFile({ file: `/${county}/schools.csv` });
  }, [county]);

  return (
    <ul>
      {allSchools.map((school) => (
        <li key={school.id}>{school.name}</li>
      ))}
    </ll>
  );
}
```
