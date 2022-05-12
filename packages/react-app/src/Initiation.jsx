import React, { useEffect, useState } from 'react';
import Landing from "./Landing"
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useLocation
} from "react-router-dom";

import { validateInvitation } from './delegator';

export default function (props) {
  const query = useQuery();
  const { provider } = props;
  const [ invitation, setInvitation ] = useState(null);
  const [ errorMessage, setErrorMessage ] = useState(null);

  useEffect(async () => {
    const network = await provider.getNetwork();
    console.log('network is ', network);

    try {
      const parsedInvitation = JSON.parse(query.get("invitation"));
      await validateInvitation(parsedInvitation, provider);
      console.dir(parsedInvitation)
      setInvitation(parsedInvitation);
    } catch (err) {
      setErrorMessage(err.message);
    }
  })

  if (!invitation) {
    if (errorMessage) {
      return (<div>
        <h3>Invalid invitation.</h3>
        <p>Sorry, we were unable to process your invitation.</p>
        <p className='error'>{ errorMessage } </p>
      </div>)   
    } else {
      return (<div>
        <h3>Processing invitation...</h3> 
      </div>)
    }
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