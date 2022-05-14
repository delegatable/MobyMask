import React, { useCallback, useEffect, useState } from "react";
const { ethers } = require("ethers");
import MetaMaskOnboarding from '@metamask/onboarding'
const config = require('./config.json');

export default function NeedWalletAction (props) {
  const [injectedProvider, setInjectedProvider] = useState();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!injectedProvider && MetaMaskOnboarding.isMetaMaskInstalled()) { 
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    setInjectedProvider(ethersProvider);
  }

  useEffect(() => {
    if (!injectedProvider) {
      return;
    }
    getAccounts()
    .then(setAccounts)
    .catch(console.error);

    async function getAccounts() {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      return accounts;
    }

    provider.on("accountsChanged", setAccounts);
  }, []);

  if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
    return (<div>
      <p>This section requires a wallet to continue.</p>
      <p>Please <button onClick={() => {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
        }}>Install MetaMask</button> to continue.
      </p>
    </div>);
  }

  if (chainId && chainId !== config.chainId) {
    return <div>
      <p>This app requires the Goerli test network to be selected in your wallet, since this is just a test for now.</p>
      <button onClick={async () => {
        ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [config.chainId],
        })
        .then(() => {
          setLoading(false);
        })
        .catch((reason) => {
          setLoading(false);
          setError(reason);
        });
        setLoading(true);
      }}>Connect to Goerli</button>
    </div>
  }

  if (loading) {
    return (<div>Loading...</div>)
  }

  const { children } = props;

  const childrenWithProps = React.Children.map(children, child => {
    // Checking isValidElement is the safe way and avoids a typescript
    // error too.
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { provider });
    }
    return child;
  });  

  return (<div>{children}</div>)
}