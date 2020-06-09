import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import {
  useLoader,
  useData,
  useLoading,
  useLoaded,
  useErrors,
} from "./store";
import states from "./states";

function FilteredSchools({ filters }) {
  const schools = useData({ filters });
  const schoolList =
    schools.length > 100 ? schools.slice(0, 100) : schools;
  const fullList = schoolList.length === schools.length;
  return (
    <div>
      <h1>
        Showing {schoolList.length}{" "}
        {fullList ? "" : "of " + schools.length} schools that
        start with "{filters[0][2]}"
      </h1>
      <ul>
        {schoolList.map((school, i) => (
          <li key={school.id}>{school.name}</li>
        ))}
      </ul>
    </div>
  );
}

function TotalSchools() {
  const schools = useData();
  return (
    <div>
      <h1>{schools.length} schools in the data store</h1>
    </div>
  );
}

function Loaded() {
  const loaded = useLoaded();
  return (
    <div>
      <h1>Loaded {loaded.length} files</h1>
    </div>
  );
}

function Loading() {
  const loading = useLoading();
  return <h1>Loading {loading.length} files</h1>;
}

function Errors() {
  const errors = useErrors();
  return errors.length > 0 ? (
    <h1>Encountered {errors.length} Error(s)</h1>
  ) : null;
}

function StateSelect({ onLoadAll, ...props }) {
  return (
    <div>
      <select {...props}>
        {Object.keys(states).map((id) => (
          <option key={id} value={id}>
            {states[id]}
          </option>
        ))}
      </select>
      <button onClick={onLoadAll}>Load All</button>
    </div>
  );
}

export default function Demo() {
  const [fips, setFips] = useState("06");
  const [filter, setFilter] = useState("Za");
  const loadFile = useLoader();
  // load schools for a county whenever county changes
  useEffect(() => {
    loadFile({ file: `/${fips}.csv` });
  }, [fips]);
  const handleLoadAll = () => {
    Object.keys(states).forEach((s) =>
      loadFile({ file: `/${s}.csv` })
    );
  };
  return (
    <div>
      <StateSelect
        onChange={(e) => setFips(e.target.value)}
        onLoadAll={handleLoadAll}
        value={fips}
      />
      <Loading />
      <Loaded />
      <TotalSchools />
      <input
        type="text"
        onChange={(e) => setFilter(e.target.value)}
        value={filter}
      />
      {filter && (
        <FilteredSchools
          filters={[["name", "starts-with", filter]]}
        />
      )}
      <Errors />
    </div>
  );
}

render(<Demo />, document.querySelector("#demo"));
