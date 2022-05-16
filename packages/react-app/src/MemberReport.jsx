import React, { useEffect, useState } from 'react';
import reportMembers from './reportMembers';
import LazyConnect from './LazyConnect';
const { ethers } = require("ethers");
const config = require('./config.json')
const { chainId } = config;
import TextInput from './TextInput';

export default function (props ) {
  const { invitation } = props;
  const [ member, setMember ] = useState();
  const [ members, setMembers ] = useState([]);
  const [ loaded, setLoaded ] = useState(false);

  useEffect(() => {
    if (loaded) {
      return;
    }
    try {
      const rawStorage = localStorage.getItem('pendingMembers');
      let storedMembers = JSON.parse(rawStorage) || [];
      setMembers(storedMembers);
      setLoaded(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className='box'>
      <h3>Endorse a member</h3>
      <TextInput placeholder="@member_person" buttonLabel="Endorse"
        onComplete={(member) => {
        members.push(member);
        setMembers(members);
        localStorage.setItem('pendingMembers', JSON.stringify(members));
      }}/>

      <div className='members'>
        { members && members.length > 0 ? 
        <div>
          <p>Pending member nominations:</p>
          <ol>
            {members.map((member, index) => {
              return (<li key={index}>{member} <button onClick={() => {
                const newMembers = members.filter((p) => p !== member);
                localStorage.setItem('pendingMembers', JSON.stringify(newMembers));
                setMembers(newMembers);
              }}>Remove</button></li>);
            })}
          </ol>

          <LazyConnect actionName="submit endorsements directly to the blockchain" chainId={chainId}>
            <SubmitBatchButton members={members} invitation={invitation} setMembers={setMembers}/>
          </LazyConnect>
          </div> : null }
      </div>
    </div>
  )
}

function SubmitBatchButton (props) {
  const { provider, members, invitation, setMembers } = props;
  const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
  return (<div>
    <button onClick={async () => {
      const block = await reportMembers(members, ethersProvider, invitation);
      localStorage.clear();
      setMembers([]);
    }}>Submit batch to blockchain</button>
  </div>);
}
