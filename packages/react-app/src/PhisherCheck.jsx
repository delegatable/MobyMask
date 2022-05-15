import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import createRegistry from './createRegistry';

export default function PhisherCheck (props) {
  const [name, setName] = useState('');
  const [output, setOutput] = useState('');
  return (
    <div>
      <h3>Check Phisher Status</h3>
      <input type="text" onChange={(e) => setName(e.target.value)} />
      <button onClick={() => {
        props.checkPhisher(name)
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

export function PhisherCheckButton (props) {
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

  return <PhisherCheck checkPhisher={async (name) => {
    const codedName = `TWT:${name.toLowerCase()}`;
    try {
      const result = await registry.isPhisher(codedName);
      if (result) {
        return `${name} is an accused phisher.`;
      } else {
        return `${name} is not a registered phisher.`;
      }
    } catch (err) {
      console.error(err);
    }
  }}/>
}