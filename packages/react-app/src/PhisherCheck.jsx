import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import useLazyQuery from "./hooks/useLazyQuery";
import LATEST_BLOCK_GRAPHQL from "./queries/latestBlock";
import IS_PHISHER_GRAPHQL from "./queries/isPhisher";
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

export function PhisherCheckButton() {
  // Get latest block
  const LATEST_BLOCK_GQL = gql(LATEST_BLOCK_GRAPHQL);
  const { loading, data: latestBlockData } = useQuery(LATEST_BLOCK_GQL, {
    context: { clientName: "watcher" },
  });

  // Check if isPhisher
  const IS_PHISHER_GQL = gql(IS_PHISHER_GRAPHQL);
  const isPhisher = useLazyQuery(IS_PHISHER_GQL, {
    context: { clientName: "watcher" },
    variables: {
      contractAddress: process?.env?.REACT_APP_CONTRACT_ADDRESS,
    },
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <PhisherCheck
      checkPhisher={async name => {
        const codedName = `TWT:${name.toLowerCase()}`;
        try {
          const { data } = await isPhisher({ blockHash: latestBlockData?.latestBlock?.hash, key0: codedName });

          if (data?.isPhisher?.value) {
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
