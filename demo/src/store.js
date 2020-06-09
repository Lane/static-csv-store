import createCsvStore, { selectData } from "../../src";

// create the store
const [
  useStore,
] = createCsvStore(
  "https://data.edopportunity.org/dev/scatterplot/meta/schools",
  ["id", "name", "lat", "lon"]
);
// shorthand to provide loader
export const useLoader = () =>
  useStore((state) => state.loadFile);
// shorthand to provide data
export const useData = (options = {}) => {
  const data = useStore((state) => state.data);
  const columnMap = useStore((state) => state.columnMap);
  return selectData({ data, columnMap, ...options });
};
// shorthand to provide files loading
export const useLoading = () =>
  useStore((state) => state.loading);
// shorthand to provide filed loaded
export const useLoaded = () => useStore((state) => state.loaded);
// shorthand to provide errors
export const useErrors = () => useStore((state) => state.errors);
// provide store
export default useStore;
