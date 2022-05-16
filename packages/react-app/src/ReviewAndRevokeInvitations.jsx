import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
const { generateUtil } = require('eth-delegatable-utils');
const { chainId, address, name } = require('./config.json');
import createRegistry from './createRegistry';
const CONTRACT_NAME = name;
const util = generateUtil({
  chainId,
  verifyingContract: address,
  name: CONTRACT_NAME,
});
import copyInvitationLink from './copyInvitationLink';

export default function (props) {
  const { provider, invitations, invitation, setInvitations } = props;
  const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');

  const [ registry, setRegistry ] = useState(null);

  // Get registry
  useEffect(() => {
    if (registry) {
      return;
    }

    createRegistry(ethersProvider)
    .then((_registry) => {
      setRegistry(_registry);
    }).catch(console.error);
  });

  if (!registry) {
    return <p>Loading...</p>
  }

  return (<details className='box'>
    <summary>Outstanding Invitations ({invitations.length})</summary>
    { invitations.map((_invitation, index) => {
      return (
        <div key={index}>
          <span>{ _invitation.petName }</span>
          <button onClick={() => {
            copyInvitationLink(_invitation.invitation, _invitation.petName)
            .catch((err) => alert(err.message));
          }}>Re-Copy</button>
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
  </details>);

}