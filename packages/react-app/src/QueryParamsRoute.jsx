import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  useLocation
} from "react-router-dom";
import Initiation from './Initiation';

// Routes
import Landing from './Landing';

export default function QueryParamsRouter(props) {
  const { provider } = props;
  let query = useQuery();

  return (
    <Switch>
      <Route exact path="/">
        <Landing/>
      </Route>
      <Route path="/initiation/">
        <Initiation provider={provider} />
      </Route>
    </Switch>
  );
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
