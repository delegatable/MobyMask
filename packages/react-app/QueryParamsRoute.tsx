import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useLocation
} from "react-router-dom";
import Initiation from './Initiation';

// Routes
import Landing from './Landing';

export default function QueryParamsRouter() {
  let query = useQuery();

  return (
    <Routes>
      <Route path="/" element={<Landing/>}></Route>
      <Route path="/initiation/" element={<Initiation/>}></Route>
    </Routes>
  );
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
