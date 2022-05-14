import React, { useEffect, useState } from 'react';
import reportPhishers from './reportPhishers';

export default function (props ) {
  const { invitation, provider } = props;
  const [ phisher, setPhisher ] = useState(null);
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
  });

  return (
    <div className='box'>
      <h3>Report a phishing attempt (coming soon)</h3>
      <input type="text" placeholder="@phisher_person" onChange={(event) => {
        setPhisher(event.target.value);
      }}/>
      <button onClick={() => {
        if (phisher) {
          console.log(`appending ${phisher} to `, phishers);
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
          <button onClick={async () => {
            console.log('submitting batch');
            const block = await reportPhishers(phishers, provider, invitation);
            console.log('batch submitted', block);
            localStorage.clear();
            setPhishers([]);
          }}>Submit batch to blockchain</button>
        </div> : null }
      </div>
    </div>
  )
}