import React, { useEffect, useState } from 'react';
import Landing from "./Landing"
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useHistory,
  useLocation
} from "react-router-dom";

import { ethers } from "ethers";
const types = require('./types')
const { generateUtil } = require('eth-delegatable-utils');
const { abi } = require('./artifacts');
const { chainId, address, name } = require('./config.json');
const CONTRACT_NAME = name;

import PhishingReport from './PhishingReport';
import PhisherCheck from './PhisherCheck';
import { validateInvitation } from './delegator';
import createInvitation from './createInvitation';

export default function (props) {
  const query = useQuery();
  const { provider } = props;
  const [ invitation, setInvitation ] = useState(null);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ registry, setRegistry ] = useState(null);
  const history = useHistory();

  // Get registry
  useEffect(() => {
    if (registry) {
      return;
    }
    const registryContract = new ethers.Contract(address, abi, provider);
    registryContract.deployed().then((registry) => {
      setRegistry(registry);
    });
  });

  useEffect(() => {
    async function checkInvitations () {
      const network = await provider.getNetwork();
      console.log('network is ', network);

      if (!loading) {
        setLoading(true);

        if (!invitation) {
          try {
            let parsedInvitation;
            let rawLoaded = document.cookie;
            if (rawLoaded) {
              parsedInvitation = JSON.parse(rawLoaded);
            }
            if (!parsedInvitation || parsedInvitation === 'null') {
              parsedInvitation = JSON.parse(query.get("invitation"));
              await validateInvitation(parsedInvitation, provider);
              document.cookie = query.get("invitation");
            }

            history.push('/members');
            console.dir(parsedInvitation)
            setInvitation(parsedInvitation);
            setLoading(false);
          } catch (err) {
            console.error(err);
            setErrorMessage(err.message);
          }
        }
      }
    }

    checkInvitations().catch(console.error);
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

  const inviteView = generaetInviteView(invitation);

  return (
    <div>
      <h1>
        Member Portal 
      </h1>

      <div className="controlBoard">
        { inviteView }

        <PhishingReport invitation={invitation} provider={provider}/>

        <PhisherCheck checkPhisher={async (name) => {
          console.log('checking if phisher', name);
          try {
            const result = await registry.isPhisher('TWT:' + name.toLowerCase());
            console.log('result is ', result);
            if (result) {
              return `${name} is an accused phisher.`;
            } else {
              return `${name} is not a registered phisher.`;
            }
          } catch (err) {
            console.error(err);
          }
        }}/>

        <div className='box'>
          <h3>Endorse a benevolent entity (coming soon)</h3>
        </div>

        <div className='box'>
          <h3>Review your invites and their reports. (Coming soon!)</h3>
        </div>

        <Landing />
      </div>

    </div>
  )
}

function generaetInviteView (invitation) {
  const tier = invitation.signedDelegations.length;

  if (tier < 4) {
    return (
      <div className='box'>
        <p>You are a tier {invitation.signedDelegations.length} invitee. This means you can invite up to {4-tier} additional tiers of members.</p>
        <button onClick={() => {
          const newInvitation = createInvitation(invitation);
          const inviteLink = window.location.origin + '/members?invitation=' + encodeURIComponent(JSON.stringify(newInvitation));
          navigator.clipboard.writeText(inviteLink).then(function() {
            alert('Copied to clipboard!');
          });
        }}>Copy new invite link</button>
      </div> 
    );
  } else if (tier === 4) {
    <div>
      <p>You are a tier 4 member. That means you can't currently invite new members through this interface, but if this site becomes popular, we can add support for this later.</p>
    </div> 
  }
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}