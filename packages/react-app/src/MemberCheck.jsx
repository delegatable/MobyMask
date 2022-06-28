import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { gql, useLazyQuery } from "@apollo/client";
import createRegistry from "./createRegistry";
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

export function MemberCheckButton(props) {
  const { provider } = props;
  const ethersProvider = new ethers.providers.Web3Provider(provider, "any");
  const [registry, setRegistry] = useState(null);

  const IS_MEMBER_GRAPHQL = `
    query isMember($blockHash: String!, $contractAddress: String!, $key0: String!) {
      isMember(blockHash: $blockHash, contractAddress: $contractAddress, key0: $key0) {
        value
        proof {
          data
        }
      }
    }
  `;
  const IS_MEMBER_GQL = gql(IS_MEMBER_GRAPHQL);
  const [isMember, { loading, data }] = useLazyQuery(IS_MEMBER_GQL, {
    context: { clientName: "watcher" },
    variables: { blockHash: "123", contractAddress: "0x123123" }, // TODO: replace with correct values
  });

  console.log("isMember", isMember);
  console.log("loading", loading);
  console.log("data", data);

  // Get registry
  useEffect(() => {
    if (registry) {
      return;
    }

    createRegistry(ethersProvider, true)
      .then(_registry => {
        setRegistry(_registry);
      })
      .catch(console.error);
  });

  if (!registry) {
    return <p>Loading...</p>;
  }

  return (
    <MemberCheck
      checkMember={async name => {
        const codedName = `TWT:${name.toLowerCase()}`;
        try {
          const result = await isMember({ variables: { key0: codedName } });
          console.log("result", result);
          // const result = await registry.isMember(codedName);
          if (result) {
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
