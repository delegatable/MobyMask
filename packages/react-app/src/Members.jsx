import React, { useEffect, useState } from 'react';
import InstallExtension from "./InstallExtension"
import ReviewAndRevokeInvitations from './ReviewAndRevokeInvitations';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useHistory,
  useLocation
} from "react-router-dom";

const types = require('./types')
const { generateUtil } = require('eth-delegatable-utils');
const { abi } = require('./artifacts');
const { chainId, address, name } = require('./config.json');
const CONTRACT_NAME = name;
const util = generateUtil({
  chainId,
  verifyingContract: address,
  name: CONTRACT_NAME,
});

import PhishingReport from './PhishingReport';
import MemberReport from './MemberReport';
import { PhisherCheckButton } from './PhisherCheck';
import { MemberCheckButton } from './MemberCheck';
import { validateInvitation } from './validateInvitation';
import createInvitation from './createInvitation';
import LazyConnect from './LazyConnect';
import copyInvitationLink from './copyInvitationLink';

export default function Members (props) {
  const query = useQuery();
  const [ invitation, setInvitation ] = useState(null);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ invitations, setInvitations ] = useState([]);
  const [ loaded, setLoaded ] = useState(false); // For loading invitations
  const history = useHistory();

  
  // Load user's own invitation from disk or query string:
  useEffect(() => {
    async function checkInvitations () {
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
              validateInvitation(parsedInvitation);
              document.cookie = query.get("invitation");
            }

            history.push('/members');
            validateInvitation(parsedInvitation);
            if (parsedInvitation) {
              setInvitation(parsedInvitation);
            }
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

  // Load user's outstanding invitations from disk:
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
      const newInvites = [...invitations, invitation];
      localStorage.setItem('outstandingInvitations', JSON.stringify(newInvites));
      setInvitations(newInvites);
    } 
  });

  console.log('rendering members screen')
  return (
    <div>
      <div className="controlBoard">

        <div className="phisherBox">
          <div className='box'>
            <LazyConnect actionName="check if a user is a phisher" chainId={chainId}
              opts={{ needsAccountConnected: false }}>
              <PhisherCheckButton/>
            </LazyConnect>
          </div>

          <div className="box">
            <PhishingReport invitation={invitation}/>
          </div>
        </div>

        <div className="memberBox">
          <div className='box'>
            <LazyConnect actionName="check if a user is endorsed" chainId={chainId}
              opts={{ needsAccountConnected: false }}>
              <MemberCheckButton/>
            </LazyConnect>
          </div>

          <div className="box">
            <MemberReport invitation={invitation}/>
          </div>
        </div>

        <div className="inviteBox">
          { inviteView }

          <LazyConnect actionName="revoke outstanding invitations" chainId={chainId}>
            <ReviewAndRevokeInvitations
              invitations={invitations}
              invitation={invitation}
              setInvitations={setInvitations}/>
          </LazyConnect>

          <div className='box'>
            <h3>Review your invites and their reports. (Coming soon!)</h3>
          </div>

        </div>

        <InstallExtension />
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
        <p>Invite people who you think will respect the system, and only report definite impostors and frauds, and only endorse people who are neither.</p>
        <p>If you invite an abusive person and don't revoke their activity quickly, you may have your membership revoked.</p>
        <button onClick={() => {
          const petName = prompt('Who is this invitation for (for your personal use only, so you can view their reports and revoke the invitation)?');
          const newInvitation = createInvitation(invitation);
          copyInvitationLink(newInvitation, petName)
          .then(() => {
            if (addInvitation) {
              addInvitation({
                petName,
                invitation: newInvitation,
              });
            }
          })
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
