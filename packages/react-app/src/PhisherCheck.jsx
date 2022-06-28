import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { gql, useLazyQuery } from "@apollo/client";
import createRegistry from "./createRegistry";
import TextInput from "./TextInput";

export default function PhisherCheck(props) {
  const [output, setOutput] = useState("");
  return (
    <div>
      <h3>Check Phisher Status</h3>
      <TextInput
        placeholder="Enter a Twitter name"
        buttonLabel="Check"
        onComplete={name => {
          props
            .checkPhisher(name)
            .then(result => {
              setOutput(result);
            })
            .catch(console.error);
        }}
      />
      {output ? <p>{output}</p> : null}
    </div>
  );
}

export function PhisherCheckButton(props) {
  const { provider } = props;
  const ethersProvider = new ethers.providers.Web3Provider(provider, "any");
  const [registry, setRegistry] = useState(null);

  const IS_PHISHER_GRAPHQL = `
    query isPhisher($blockHash: String!, $contractAddress: String!, $key0: String!) {
      isPhisher(blockHash: $blockHash, contractAddress: $contractAddress, key0: $key0) {
        value
        proof {
          data
        }
      }
    }
  `;
  const IS_PHISHER_GQL = gql(IS_PHISHER_GRAPHQL);
  const [isPhisher, { loading, data }] = useLazyQuery(IS_PHISHER_GQL, {
    context: { clientName: "watcher" },
    variables: { blockHash: "123", contractAddress: "0x123123" }, // TODO: replace with correct values
  });

  console.log("isPhisher", isPhisher);
  console.log("loading", loading);
  console.log("data", data);

  // Get registry
  useEffect(() => {
    if (registry) {
      return;
    }

    createRegistry(ethersProvider, true)
      .then(_registry => {
        console.log("_registry", _registry);
        setRegistry(_registry);
      })
      .catch(console.error);
  });

  if (!registry) {
    return <p>Loading...</p>;
  }

  return (
    <PhisherCheck
      checkPhisher={async name => {
        const codedName = `TWT:${name.toLowerCase()}`;
        console.log("codedName", codedName);
        try {
          const result = await isPhisher({ variables: { key0: codedName } });
          console.log("result", result);
          // const result = await registry.isPhisher(codedName);
          if (result) {
            return `${name} is an accused phisher.`;
          } else {
            return `${name} is not a registered phisher.`;
          }
        } catch (err) {
          console.error(err);
        }
      }}
    />
  );
}
