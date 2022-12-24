import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { useState, useEffect, useRef} from 'react';
import Web3Modal from "web3modal";
import {  Contract, providers, utils } from "ethers";
import { BigNumber } from 'bignumber.js';
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from '../constants';
const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  // const BigNumber = require('bignumber.js');
  const zero = BigNumber(0);
  const[walletConnected, setWalletConnected] = useState<Boolean>(false);
  const[tokensMinted, setTokensMinted] = useState<BigNumber>(zero);
  const[BalanceOfCryptoDevToken, setBalanceOfCryptoDevToken] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState<BigNumber | Number>(zero);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState<BigNumber>(zero);

  const web3ModalRef = useRef<any>()
  
  const getProviderOrSigner = async(needSigner = false) => {
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);
  
  const {chainId }= await web3Provider.getNetwork();
  if(chainId !== 5){
  window.alert("Change the network to Goerli!");
  throw new Error("Change the network to Goerli");
  }
  if(needSigner){
    const signer = web3Provider.getSigner();
    return signer;
  };
  return web3Provider;
  };

  const connectWallet = async() => {
  try {
    await getProviderOrSigner();
    setWalletConnected(true);
  } catch (error) {
    console.log(error,"error from connectWallet function");
  }
}
const getBalanceOfCryptoDevTokens = async () => {
  try {
    const provider = await getProviderOrSigner();
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    );

    const signer = await getProviderOrSigner(true);
    // Get the address associated to the signer which is connected to  MetaMask
    const address = await signer.getAddress();
    console.log('address===>', address);

    // call the balanceOf from the token contract to get the number of tokens held by the user
    const balance = await tokenContract.balanceOf(address);
    // balance is already a big number, so we dont need to convert it before setting it
    setBalanceOfCryptoDevToken(balance);

  } catch (err) {
    console.error(err);
  }
}

const mintCryptoDevToken = async(amount : Number  ) => {
try {
  const signer = await getProviderOrSigner(true);
  const tokenContract = new Contract(
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    signer
  )
  const value = 0.001 * Number(amount);
  const tx = await tokenContract.mint(Number(amount),{
    value: utils.parseEther(value.toString())
  })
  setLoading(true);
  await tx.wait()
  setLoading(false);
  window.alert("Successfully minted Crypto Dev Token");
  await getBalanceOfCryptoDevTokens();
  await getTotalTokenMinted();
  await getTokensToBeClaimed();

} catch (error) {
  console.log(error,"Error from mintCryptoDevToken");
}
}
const getTotalTokenMinted = async() => {
  try {
    const provider = await getProviderOrSigner();
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    );
    const _tokenIsMinted = await tokenContract.totalSupply();
    setTokensMinted(_tokenIsMinted);
  } catch (error) {
    console.log(error,"Error from getTotalTokenMinted");
  }
}
const getTokensToBeClaimed = async() => {
  try {
    const provider = await getProviderOrSigner();
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    )
    const signer = await getProviderOrSigner(true);
  
    // Get the address associated to the signer which is connected to  MetaMask
    const address = await signer.getAddress();
    console.log('address===>', address);

    // call the balanceOf from the token contract to get the number of tokens held by the user
    const balance = await nftContract.balanceOf(address);
    if(balance === zero){
      setTokensToBeClaimed(zero)
    } else {
      let amount = 0;
      for(let i = 0; i < balance; i++){
        const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)
        const claimed = await tokenContract.tokenIsClaimed(tokenId);
        if(!claimed){
          amount++;
        }
      }
      setTokensToBeClaimed(BigNumber(amount));
    }
    } catch (error) {
    console.log(error, "Error from gettokensTobeClaimed");
    setTokensToBeClaimed(zero);
  }
}
const claimCryptoDevToken = async() => {
try {
  const signer = await getProviderOrSigner(true);
  const tokenContract = new Contract(
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    signer
  )
  const tx = tokenContract.claim();
  setLoading(true);
  await tx.wait();
  setLoading(false);
  window.alert("Successfully claimed CryptoDevs token");
  await getBalanceOfCryptoDevTokens();
  await getTotalTokenMinted();
  await getTokensToBeClaimed();
} catch (error) {
  console.log(error,"claimCryptoDevToken");
}
}
const renderButton = () => {
  if(loading){
    return(
      <div>
        <button className={styles.button}>Loading...</button>
      </div>
    )
  }
  if(BigNumber(tokensToBeClaimed).lt(0)){
    return(
      <div>
        <div className ={styles.description}>
        <>{tokensToBeClaimed.multipliedBy(10)}</> Tokens can be claimed
        </div>
        <button className={styles.button} onClick = {claimCryptoDevToken}>Claim Tokens</button>
      </div>
    )
  }
  return(
    <div style={{display: "flex-col"}}>
   <div>
   <input type="number" placeholder='Amount of Tokens' onChange={(e) => { setTokenAmount(Number(e.target.value))}} />
   <button
            className={styles.button}
            disabled={!(tokenAmount > 0)}
            onClick=  {() => mintCryptoDevToken(Number(tokenAmount))}
          >
            Mint Tokens
          </button>
    </div>
  </div>
  )
}
  useEffect(() => {
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
         network : "goerli",
         providerOptions: {},
         disableInjectedProvider : false
        })
        connectWallet();
         getBalanceOfCryptoDevTokens();
         getTotalTokenMinted();
         getTokensToBeClaimed();
       }
  
  
  },[walletConnected]);
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Dev</h1>
      
        <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>

          {
            walletConnected ? (
              <div>
              <div className= {styles.description}>
              {Number(BalanceOfCryptoDevToken) / 1000000000000000000}
                              </div>
              <div className= {styles.description}>
              Overall =
                  {Number(tokensMinted) / 1000000000000000000}
                  /10000 have been minted!!!
                            </div>
                {renderButton()}
                </div>

            ) : (
              <button className = {styles.button} onClick={connectWallet}>
                Connect your Wallet
              </button>
            )
          }
      </div>
    
      <div>
          <img className={styles.image} src="./0.svg" />
</div>


      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
      </div>
    </>
  )
}
