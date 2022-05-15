import React, { useCallback, useEffect, useState } from "react";
const { ethers } = require("ethers");
import MetaMaskOnboarding from '@metamask/onboarding'
const config = require('./config.json');
const { chainId } = config;

export default function LazyConnect (props) {
  const { actionName } = props;
  const [provider, setInjectedProvider] = useState();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [userChainId, setUserChainId] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!provider && MetaMaskOnboarding.isMetaMaskInstalled()) { 
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    setInjectedProvider(ethersProvider);
  }

  // Get accounts;
  useEffect(() => {
    if (!provider) {
      return;
    }
    getAccounts()
    .then(setAccounts)
    .catch(console.error);

    async function getAccounts() {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      return accounts;
    }

    provider.on("accountsChanged", setAccounts);
  }, []);

  // Get current selected network:
  useEffect(() => {
    if (!provider || userChainId) {
      return;
    }
    getUserChainId()
    .then(setUserChainId)
    .catch(console.error);

    async function getUserChainId() {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      return chainId;
    }

    provider.provider.on('chainChanged', (_chainId) => {
      setUserChainId(_chainId);
    });
  }, []);

  if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
    return (<div className="lazyConnect">
      <p>You need a wallet to {actionName}.</p>
      <button onClick={() => {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
        }}>Install MetaMask</button>
    </div>);
  }

  if (Number(userChainId) !== config.chainId) {
    return <div className="lazyConnect">
      <p>This app requires the Goerli test network to be selected in your wallet, since this is just a test for now.</p>
      <button onClick={async () => {
        ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + config.chainId.toString(16) }],
        })
        .then(() => {
          setLoading(false);
        })
        .catch((reason) => {
          setLoading(false);
          setError(reason);
        });
        setLoading(true);
      }}>Switch to Goerli</button>
    </div>
  }

  if (accounts && accounts.length === 0) {
    return <div className="lazyConnect">
      <p>You need to connect an account to {actionName}.</p>
      <button onClick={async () => {
        const accounts = await ethereum.request({ method: 'wallet_requestAccounts' });
        setAccounts(accounts);
      }}>Connect an account</button>
    </div>
  }

  if (loading) {
    return (<div className="lazyConnect">Loading...</div>)
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

  return (<div>{childrenWithProps}</div>)
}