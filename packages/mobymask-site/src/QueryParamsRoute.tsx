import React from 'react';
import {
  BrowserRouter as Router,
  Link,
  useLocation
} from "react-router-dom";

// Routes
import Landing from './Landing';

export default function QueryParamsRouter() {
  let query = useQuery();

  console.dir(query);
  if (!query.get('page')) {
    return Landing();
  }

  return (
    <div>
      <div>
        <h2>Accounts</h2>
        <ul>
          <li>
            <Link to="/account?name=netflix">Netflix</Link>
          </li>
          <li>
            <Link to="/account?name=zillow-group">Zillow Group</Link>
          </li>
          <li>
            <Link to="/account?name=yahoo">Yahoo</Link>
          </li>
          <li>
            <Link to="/account?name=modus-create">Modus Create</Link>
          </li>
        </ul>

        <div>{query.get("name")}</div>
      </div>
    </div>
  );
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
