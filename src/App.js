import './App.css';
import React, { useState } from 'react';
import { ethers } from 'ethers'
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import Token from './artifacts/contracts/Token.sol/Token.json'
import MetaMaskAuth from "./metamask-auth.js";

const greeterAddress = "0x96727c1D7F1Caf02C8F5a1a80DFd3087fb65Eb4C"
const tokenAddress = "0xaC14861D6CFc58E766fD497308AD5bD5F2B722Ac"

class App extends React.Component {

	constructor(props) {
		super(props);
    this.greeting = props;
    this.setGreetingValue = props;
    this.userAccount = props;
    this.setUserAccount = props;
    this.amount = props;
    this.setAmount = props;
		this.state = {
			apiResponse: "",
			DataisLoaded: false,
		};
	}


	componentDidMount() {
		fetch("http://localhost:9000/testAPI")
			.then((res) => res.text())
			.then((text) => {
				this.setState({
					apiResponse: text,
					DataisLoaded: true
				});
			})
	}

  async requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      console.log({ provider })
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider)
      const balance = await contract.balanceOf(account);
      console.log("Balance: ", balance.toString());
    }
  }

  async setGreeting() {
    if (!this.greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await this.requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log({ provider })
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(this.greeting)
      await transaction.wait()
      this.fetchGreeting()
    }
  }

  async sendCoins() {
    if (typeof window.ethereum !== 'undefined') {
      await this.requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transation = await contract.transfer(this.userAccount, this.amount);
      await transation.wait();
      console.log(`${this.amount} Coins successfully sent to ${this.userAccount}`);
    }
  }

	render() {
		const { DataisLoaded, apiResponse } = this.state;
		if (!DataisLoaded) return <div>
			<h1> Pleses wait some time.... </h1> </div> ;

		return (
    <div className="App">
      <header className="App-header">
        <button onClick={this.fetchGreeting}>Fetch Greeting</button>
        <button onClick={this.setGreeting}>Set Greeting</button>
        <input onChange={e => this.setGreetingValue(e.target.value)} placeholder="Set greeting" />
        <br />
        <p>{apiResponse}</p>
        <br />
        <button onClick={this.getBalance}>Get Balance</button>
        <button onClick={this.sendCoins}>Send Coins</button>
        <input onChange={e => this.setUserAccount(e.target.value)} placeholder="Account ID" />
        <input onChange={e => this.setAmount(e.target.value)} placeholder="Amount" />
        <br />

        <MetaMaskAuth onAddressChanged={address => {}}/>
      </header>
    </div>
	);
}
}

export default App;