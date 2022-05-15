import React, { useEffect, useState } from 'react';

export default function (props) {
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