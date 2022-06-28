import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import useLazyQuery from "./hooks/useLazyQuery";
import LATEST_BLOCK_GRAPHQL from "./queries/latestBlock";
import IS_MEMBER_GRAPHQL from "./queries/isMember";
import TextInput from "./TextInput";

export default function MemberCheck(props) {
  const [output, setOutput] = useState("");
  return (
    <div>
      <h3>Check Member Status</h3>
      <TextInput
        placeholder="Enter a Twitter name"
        buttonLabel="Check"
        onComplete={name => {
          props
            .checkMember(name)
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

export function MemberCheckButton() {
  // Get latest block
  const LATEST_BLOCK_GQL = gql(LATEST_BLOCK_GRAPHQL);
  const { loading, data: latestBlockData } = useQuery(LATEST_BLOCK_GQL, {
    context: { clientName: "watcher" },
  });

  // Check if isMember
  const IS_MEMBER_GQL = gql(IS_MEMBER_GRAPHQL);
  const isMember = useLazyQuery(IS_MEMBER_GQL, {
    context: { clientName: "watcher" },
    variables: {
      contractAddress: process?.env?.REACT_APP_CONTRACT_ADDRESS,
    },
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <MemberCheck
      checkMember={async name => {
        const codedName = `TWT:${name.toLowerCase()}`;
        try {
          const { data } = await isMember({ blockHash: latestBlockData?.latestBlock?.hash, key0: codedName });

          if (data?.isMember?.value) {
            return `${name} is an endorsed moby.`;
          } else {
            return `${name} has not been endorsed.`;
          }
        } catch (err) {
          console.error(err);
        }
      }}
    />
  );
}
