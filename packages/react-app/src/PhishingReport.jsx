import React, { useEffect, useState } from 'react';
import reportPhishers from './reportPhishers';
import LazyConnect from './LazyConnect';
const { ethers } = require("ethers");
const config = require('./config.json')
const { chainId } = config;

export default function (props ) {
  const { invitation } = props;
  const [ phisher, setPhisher ] = useState();
  const [ phishers, setPhishers ] = useState([]);
  const [ loaded, setLoaded ] = useState(false);

  useEffect(() => {
    if (loaded) {
      return;
    }
    try {
      const rawStorage = localStorage.getItem('pendingPhishers');
      let storedPhishers = JSON.parse(rawStorage) || [];
      setPhishers(storedPhishers);
      setLoaded(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  function registerNewPhisher() {
    if (phisher) {
      phishers.push(phisher);
      localStorage.setItem('pendingPhishers', JSON.stringify(phishers));
      setPhisher('');
    } 
  }

  return (
    <div className='box'>
      <h3>Report a phishing attempt</h3>
      <input type="text" value={phisher} placeholder="@phisher_person" onChange={(event) => {
        setPhisher(event.target.value);
      }} onKeyPress={(event) => {
        if (event.key === 'Enter') {
          return registerNewPhisher();
        } 
      }}/>
      
      <button onClick={() => {
        if (phisher) {
          phishers.push(phisher);
          localStorage.setItem('pendingPhishers', JSON.stringify(phishers));
          setPhisher('');
        } 
      }}>Report twitter phisher</button>

      <div className='phishers'>
        { phishers && phishers.length > 0 ? 
        <div>
          <p>Pending phishing reports:</p>
          <ol>
            {phishers.map((phisher, index) => {
              return (<li key={index}>{phisher}</li>);
            })}
          </ol>

          <LazyConnect actionName="submit reports directly to the blockchain" chainId={chainId}>
            <SubmitBatchButton phishers={phishers} invitation={invitation} setPhishers={setPhishers}/>
          </LazyConnect>
          </div> : null }
      </div>
    </div>
  )
}

function SubmitBatchButton (props) {
  const { provider, phishers, invitation, setPhishers } = props;
  const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
  console.log('trying to submit batch with', ethersProvider);
  return (<div>
    <button onClick={async () => {
      const block = await reportPhishers(phishers, ethersProvider, invitation);
      localStorage.clear();
      setPhishers([]);
    }}>Submit batch to blockchain</button>
  </div>);
}
