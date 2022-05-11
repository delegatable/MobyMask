import React from 'react';
import Landing from "./Landing"
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useLocation
} from "react-router-dom";

import { validateInvitation } from './delegator';

export default function () {
  const query = useQuery();

  let parsedInvitation
  try {
    parsedInvitation = JSON.parse(query.get("invitation"));
    validateInvitation(parsedInvitation);
    console.dir(parsedInvitation)
  } catch (err) {
    return (<div>
      <h3>Invalid invitation.</h3>
      <p>Sorry, we were unable to process your invitation.</p>
      <p className='error'>{ err.message } </p>
    </div>)   
  }

  return (
    <div>
      <h1>
        Member Portal 
      </h1>

      <div className="controlBoard">
        <div>
          <input type="text" placeholder="@phisher_person" />
          <button>Report twitter phisher</button>
        </div>
        <button>Copy new invite link</button>
      </div>

      <Landing />
    </div>
  )
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}