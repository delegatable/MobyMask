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
import createRegistry from './createRegistry';
const CONTRACT_NAME = name;
const util = generateUtil({
  chainId,
  verifyingContract: address,
  name: CONTRACT_NAME,
});

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
  const [ invitations, setInvitations ] = useState([]);
  const [ loaded, setLoaded ] = useState(false); // For loading invitations
  const history = useHistory();

  // Get registry
  useEffect(() => {
    if (registry) {
      return;
    }

    createRegistry()
    .then((_registry) => {
      setRegistry(_registry);
    }).catch(console.error);
  });

  useEffect(() => {
    async function checkInvitations () {
      const network = await provider.getNetwork();

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
  });

  useEffect(() => {
    if (loaded) {
      return;
    }
    try {
      const rawStorage = localStorage.getItem('outstandingInvitations');
      let loadedInvitations = JSON.parse(rawStorage) || [];
      setInvitations(loadedInvitations);
      setLoaded(true);
    } catch (err) {
      console.error(err);
    }
  });

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

  const inviteView = generateInviteView(invitation, (invitation) => {
    if (invitation) {
      console.log(`appending ${invitation.petName} to outstanding invites`);
      const newInvites = [...invitations, invitation];
      localStorage.setItem('outstandingInvitations', JSON.stringify(newInvites));
      setInvitations(newInvites);
    } 
  });

  if (!registry) {
    return <p>Loading. Or connect to the Goerli test network. This is a hackathon project, please forgive the rough edges.</p>
  }

  return (
    <div>
      <h1>
        Member Portal 
      </h1>

      <div className="controlBoard">

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

        { inviteView }

        <div className='box'>
          <h3>Outstanding Invitations</h3>
          { invitations.map((_invitation, index) => {
            return (
              <div key={index}>
                <span>{ _invitation.petName }</span>
                <button onClick={async () => {
                  const { signedDelegations } = _invitation.invitation;
                  const signedDelegation = signedDelegations[signedDelegations.length - 1];

                  const delegationHash = util.createSignedDelegationHash(signedDelegation);
                  const intendedRevocation = {
                    delegationHash,
                  }
                  const signedIntendedRevocation = util.signRevocation(intendedRevocation, invitation.key);

                  const block = await registry.revokeDelegation(signedDelegation, signedIntendedRevocation);

                  const newInvites = [...invitations];
                  newInvites.splice(index, 1);
                  localStorage.setItem('outstandingInvitations', JSON.stringify(newInvites));
                  setInvitations(newInvites);
                }}>Revoke</button>
              </div>
            )
          })}
        </div>

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

function generateInviteView(invitation, addInvitation) {
  const tier = invitation.signedDelegations.length;

  if (tier < 4) {
    return (
      <div className='box'>
        <p>You are a tier {invitation.signedDelegations.length} invitee. This means you can invite up to {4-tier} additional tiers of members.</p>
        <button onClick={() => {
          const petName = prompt('Who is this invitation for (for your personal use only, so you can view their reports and revoke the invitation)?');
          const newInvitation = createInvitation(invitation);
          const inviteLink = window.location.origin + '/members?invitation=' + encodeURIComponent(JSON.stringify(newInvitation));
          navigator.clipboard.writeText(inviteLink).then(function() {
            alert('Copied to clipboard. Paste it somewhere only the intended recipients can see or you can lose your membership.');
            if (addInvitation) {
              addInvitation({
                petName,
                invitation: newInvitation,
              });
            }
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
