import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import createRegistry from './createRegistry';
import TextInput from './TextInput';

export default function PhisherCheck (props) {
  const [output, setOutput] = useState('');
  return (
    <div>
      <h3>Check Phisher Status</h3>
      <TextInput placeholder="Enter a Twitter name" buttonLabel="Check"
      onComplete={(name) => {
        props.checkPhisher(name)
        .then((result) => {
          setOutput(result);
        })
        .catch(console.error);
      }}/>
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