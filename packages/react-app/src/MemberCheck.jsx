import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import createRegistry from './createRegistry';
import TextInput from './TextInput';

export default function MemberCheck (props) {
  const [output, setOutput] = useState('');
  return (
    <div>
      <h3>Check Member Status</h3>
      <TextInput placeholder="Enter a Twitter name" buttonLabel="Check"
      onComplete={(name) => {
        props.checkMember(name)
        .then((result) => {
          setOutput(result);
        })
        .catch(console.error);
      }}/>
      {output ? <p>{output}</p> : null}
    </div>
  )
}

export function MemberCheckButton (props) {
  const { provider } = props;
  const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
  const [ registry, setRegistry ] = useState(null);

  // Get registry
  useEffect(() => {
    if (registry) {
      return;
    }

    createRegistry(ethersProvider, true)
    .then((_registry) => {
      setRegistry(_registry);
    }).catch(console.error);
  });

  if (!registry) {
    return <p>Loading...</p>
  }

  return <MemberCheck checkMember={async (name) => {
    const codedName = `TWT:${name.toLowerCase()}`;
    try {
      const result = await registry.isMember(codedName);
      if (result) {
        return `${name} is an endorsed moby.`;
      } else {
        return `${name} has not been endorsed.`;
      }
    } catch (err) {
      console.error(err);
    }
  }}/>
}