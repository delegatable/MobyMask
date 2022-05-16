import React, { useEffect, useState } from 'react';
import reportMembers from './reportMembers';
import LazyConnect from './LazyConnect';
const { ethers } = require("ethers");
const config = require('./config.json')
const { chainId } = config;

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

  function registerNewMember () {
    if (member) {
      members.push(member);
      localStorage.setItem('pendingMembers', JSON.stringify(members));
      setMember('');
    } 
  }

  return (
    <div className='box'>
      <h3>Endorse a member</h3>
      <input type="text" value={member} placeholder="@member_person" onKeyPress={(event) => {
        if (event.key === 'Enter') {
          return registerNewMember();
        }
      }} onChange={(event) => {
        setMember(event.target.value);
      }}/>
      
      <button onClick={registerNewMember}>Endorse twitter user</button>

      <div className='members'>
        { members && members.length > 0 ? 
        <div>
          <p>Pending member nominations:</p>
          <ol>
            {members.map((member, index) => {
              return (<li key={index}>{member}</li>);
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
