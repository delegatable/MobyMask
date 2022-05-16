import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import createRegistry from './createRegistry';

export default function MemberCheck (props) {
  const [name, setName] = useState('');
  const [output, setOutput] = useState('');
  return (
    <div>
      <h3>Check Member Status</h3>
      <input type="text" onChange={(e) => setName(e.target.value)} />
      <button onClick={() => {
        props.checkMember(name)
        .then((result) => {
          setOutput(result);
          setName('');
        })
        .catch(console.error);
      }}>Check</button>
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