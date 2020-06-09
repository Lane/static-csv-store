# CSV Store

## Summary

This module creates a store for loading and accessing data from static CSV files. It is designed so data can be loaded from a series of CSV files as needed, instead of loading a large file all at once. Built using:

- zustand
- d3-dsv (for parsing)

## Usage

```
npm i @lane/csv-store
```

1. Create a store

**File:** `store.js`

```js
import createCsvStore from "@lane/csv-store";

// create the store
const [
  useSchoolStore,
] = createCsvStore("https://file-endpoint.com/", [
  "id",
  "name",
  "city",
  "lat",
  "lon",
]);
// shorthand to provide loader
export const useCsvLoader = useSchoolStore(
  (state) => state.loadFile
);
// shorthand to provide data
export const useSchoolData = useSchoolStore(
  (state) => state.getData
);
// shorthand to provide files loading
export const useLoadingFiles = useSchoolStore(
  (state) => state.loading
);
// shorthand to provide filed loaded
export const useLoadedFiles = useSchoolStore(
  (state) => state.loaded
);
// shorthand to provide errors
export const useLoadingErrors = useSchoolStore(
  (state) => state.errors
);
// provide store
export default useSchoolStore;
```

2. Use the store in a component

```js
import { useCsvLoader, useSchoolData } from './store'

export default function Component() {
  const loadFile = useCsvLoader();
  const schoolData = useSchoolData();

  // load schools for a county whenever county changes
  useEffect(() => {
    loadFile({ file: `/${county}/schools.csv` })
  }, [ county ])

  return (
    { Object.values(schoolData) }
  )
}
```

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

Describe csv-store here.

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo
[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package
[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo
