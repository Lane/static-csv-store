import create from "zustand";
import axios from "axios";
import { csvParse, autoType } from "d3-dsv";

/**
 * Returns a URL for the provided endpoint and file
 * @param {*} endpoint
 * @param {*} file
 */
const getUrl = (endpoint, file) => {
  return endpoint + file;
};

/**
 * Maps the object to an array based on the property map
 */
const mapObjectToArray = (obj, propMap) => {
  const allProps = Object.keys(propMap);
  const objProps = Object.keys(obj);
  const arr = new Array(allProps.length).fill(null);
  for (let i = 0; i < objProps.length; i++) {
    const key = objProps[i];
    const index = propMap.hasOwnProperty(key)
      ? propMap[key]
      : -1;
    if (index > -1) arr[index] = obj[key];
  }
  return arr;
};

const mapArrayToObject = (arr, columnMap) => {
  const result = {};
  Object.keys(columnMap).forEach(
    (column) => (result[column] = arr[columnMap[column]])
  );
  return result;
};

/**
 * Checks to see if the provided row matches the filters
 */
const applyFilters = (filters, row, columnMap) => {
  for (var i = 0; i < filters.length; i++) {
    const [column, condition, filterValue] = filters[i];
    const rowValue = row[columnMap[column]];
    if (condition === "starts-with")
      if (
        typeof rowValue !== "string" ||
        !rowValue.startsWith(filterValue)
      )
        return false;
  }
  return true;
};

/**
 * Merges two arrays, replacing values in arr1 with
 * values in arr2 if they exist.
 * @param {*} arr1
 * @param {*} arr2
 */
const mergeValues = (arr1, arr2) => {
  if (arr1.length !== arr2.length)
    throw new Error(
      "cannot merge values in arrays of different length"
    );
  const merged = [];
  for (let i = 0; i < arr1.length; i++) {
    merged[i] = arr2[i] || arr1[i] || null;
  }
  return merged;
};

/**
 * Returns object of updates to currentData based
 * on the provided rows
 * @param {object} currentData
 * @param {array} rows
 * @param {string} key
 */
const getDataUpdatesFromRows = (
  currentData,
  rows,
  key,
  columnMap
) => {
  const newData = {};
  // loop through rows and update data
  for (let i = 0; i < rows.length; i++) {
    const currentDataArray = currentData[rows[i][key]];
    const newDataArray = mapObjectToArray(rows[i], columnMap);
    // update the data row
    newData[rows[i][key]] = currentDataArray
      ? mergeValues(currentDataArray, newDataArray)
      : newDataArray;
  }
  return newData;
};

export const selectData = ({
  data,
  columns,
  filters,
  columnMap,
}) => {
  if (!data || !columnMap)
    throw new Error(
      "cannot transform data without `data` or `columnMap`"
    );
  const t0 = performance.now();
  const arr = Object.values(data);
  // if no subset and no filters, return full array
  if (!columns && !filters)
    return arr.map((r) => mapArrayToObject(r, columnMap));
  // get reduced column map if subset requested
  columnMap = columns
    ? columns.reduce((obj, current, i) => {
        obj[current] = columnMap[current];
        return obj;
      }, {})
    : columnMap;
  // loop through data, applying filters and column subset
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const row = arr[i];
    const isMatch = filters
      ? applyFilters(filters, row, columnMap)
      : true;
    if (isMatch) {
      result.push(mapArrayToObject(row, columnMap));
    }
  }
  const t1 = performance.now();
  console.debug(`took ${t1 - t0}ms to create subset`);
  return result;
};

/**
 * Creates a store for CSV data that is loaded in chunks as
 * needed.
 * @param {*} columns
 */
const createCSVStore = (endpoint, columns) => {
  // map column names to index
  const columnMap = columns.reduce((obj, current, i) => {
    obj[current] = i;
    return obj;
  }, {});
  return create((set, get, api) => ({
    endpoint,
    columns,
    columnMap,
    // files that are currently loading
    loading: [],
    // files that have loaded
    loaded: [],
    // files where errors occured when loading
    errors: [],
    // data store containing all data by unique id
    data: {},
    // retreive entry by ID
    getById: (id) => get().data[id],
    getData: (options = {}) => {
      return selectData({
        data: get().data,
        columnMap: get().columnMap,
        ...options,
      });
    },
    // function to load CSV data
    loadFile: ({
      file,
      key = columns[0],
      parser = autoType,
    }) => {
      // check if file is already loaded or currently loading
      if (
        get().loading.indexOf(file) > -1 ||
        get().loaded.indexOf(file) > -1
      )
        return;
      // set loading status
      set((state) => ({ loading: [...state.loading, file] }));
      const t0 = performance.now();
      // load the file
      return (
        axios
          .get(getUrl(endpoint, file))
          // parse the data
          .then((res) => csvParse(res.data, parser))
          // shape data into dict
          .then((rows) =>
            getDataUpdatesFromRows(
              get().data,
              rows,
              key,
              columnMap
            )
          )
          // set data in the store
          .then((updatedData) => {
            const t1 = performance.now();
            console.debug(`${file} loaded in ${t1 - t0}ms`);
            set((state) => ({
              data: {
                ...state.data,
                ...updatedData,
              },
              loading: state.loading.filter((f) => f !== file),
              loaded: [...state.loaded, file],
            }));
          })
          // catch any errors
          .catch((err) => {
            console.error(err);
            set((state) => ({
              loading: state.loading.filter((f) => f !== file),
              errors: [...state.errors, file],
            }));
          })
      );
    },
  }));
};

export default createCSVStore;
