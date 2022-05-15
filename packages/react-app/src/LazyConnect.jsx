import React, { useEffect, useState } from "react";
import MetaMaskOnboarding from '@metamask/onboarding';
import chainList from './chainList';

export default function LazyConnect (props) {
  const { actionName, chainId, opts = {} } = props;
  const { needsAccountConnected = true } = opts;
  const [provider, setInjectedProvider] = useState();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [userChainId, setUserChainId] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!provider && MetaMaskOnboarding.isMetaMaskInstalled()) { 
    setInjectedProvider(window.ethereum);
  }

  const chainName = chainId ? chainList[Number(chainId)] : null;

  // Get accounts;
  useEffect(() => {
    if (!provider) {
      return;
    }
    getAccounts()
    .then(setAccounts)
    .catch(console.error);

    async function getAccounts() {
      const accounts = await provider.request({ method: 'eth_accounts' });
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
      const chainId = await provider.request({ method: 'eth_chainId' });
      return chainId;
    }

    provider.on('chainChanged', (_chainId) => {
      setUserChainId(_chainId);
    });
  }, []);

  if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
    return (<div className="lazyConnect">
      { createChecklist({
        hasWallet: MetaMaskOnboarding.isMetaMaskInstalled(),
        provider,
        setLoading,
        chainId: chainId,
        userChainId,
        chainName,
        setAccounts,
        needsAccountConnected,
        actionName,
        accounts,
      })}
      <button onClick={() => {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
        }}>Get MetaMask</button>
    </div>);
  }

  const needsToSwitchChain = Number(userChainId) !== chainId;
  const needsToConnectAccount = needsAccountConnected && accounts && accounts.length === 0;
  const requiresAction = needsToSwitchChain || needsToConnectAccount;

  if (requiresAction) {
    return <div className="lazyConnect">
      { createChecklist({
        setLoading,
        provider,
        hasWallet: MetaMaskOnboarding.isMetaMaskInstalled(),
        chainId: chainId,
        userChainId,
        chainName,
        setAccounts,
        needsAccountConnected,
        actionName,
        accounts,
      })}
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

  return (<div className="lazyConnected">{childrenWithProps}</div>)
}

function createChecklist (checklistOpts) {
  const { chainId, userChainId, chainName, setAccounts, provider, setLoading,
    needsAccountConnected, actionName, hasWallet, accounts } = checklistOpts;
  return (<div>
    <p>You need a few things to {actionName}.</p>
    <ol>
      { hasWallet ?
        <li>✅ Get a web3 compatible Wallet (like MetaMask)</li> :
        <li>☐ Get a web3 compatible Wallet (like MetaMask)</li> }
      { needsAccountConnected ? (
          accounts && accounts.length === 0 ?
          <li>☐ <button onClick={async () => {
            const accounts = await provider.request({ method: 'wallet_requestAccounts' });
            setAccounts(accounts);
          }}>Connect an account</button></li> :
          <li>✅ Connect an account</li>
      )
          : null }
      { !!chainId && 
        (Number(userChainId) !== chainId ?
          <li>☐ <button onClick={async () => {
        provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + chainId.toString(16) }],
        })
        .then(() => {
          setLoading(false);
        })
        .catch((reason) => {
          setLoading(false);
          setError(reason);
        });
        setLoading(true);
      }}>Switch to the { chainName } network</button>
      </li> :
        <li>✅ Switch to the {chainName} network</li>)
      }
    </ol>
   </div>);
}
