import React, { useState, useEffect, useContext } from "react";
import { noop } from "lodash";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardText,
} from "reactstrap";
import { KYC } from "../../config/constants";
import SDK from '@theapis/sdk/src/compoundSDK';
import {NavContext} from '../../context/NavContext';
import {SDKContext, SupportedTokensContext, TokenBalanceContext} from '../../context/SDKContext';

const InvestLayout = ()=>{

  const sdk = useContext(SDKContext);
  const tokens = useContext(SupportedTokensContext);
  const [tokenName, settokenName] = useState("ETH");
  const [tokenAmount, settokenAmount] = useState(0);
  const [loader, setloader] = useState(false)
  const [counter, setcounter] = useState(0)
  const [loaderText, setloaderText] = useState("")

  const { route, setRoute } = useContext(NavContext)

  async function handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    if(name === "tokenName"){
      settokenName(value);
    }
    else{
      settokenAmount(value);
    }
  }

  function toggleLoader(){
    setloader(!loader);
    setloaderText(loader ? '' : 'Loading...');
  }

  async function handleSubmit(){
    setloader(true);
     sdk.invest(tokenName,(tokenAmount*1e18).toString())
    .on('error', function(error){ 
      console.log("error: ")
      console.log(error.message); })
    .on('transactionHash', function(transactionHash){console.log("transaction hash: " +transactionHash); })
    .on('receipt', function(receipt){
        console.log("reciept");
        console.log(receipt); 
    })
    .on('confirmation', function(confirmationNumber, receipt){ 
      console.log("confirmed: "+ confirmationNumber);
      console.log(receipt);
      setcounter(counter+1);
      if(counter===3){
      toggleLoader(); 
      console.log("counter is 3")}});
  }
  return(
      <div>
      <h2>Invest Crypto</h2>
      <label htmlFor="tokenName">Choose a crypto:</label>
      <select name="tokenName" id="tokenName" onChange={handleInputChange}>
        <option value="ETH" selected>ETH</option>
       {tokens.map((token) => (
          <option value={token.name} key={token.name}>{token.name}</option>
        ))}
      </select><br></br>
      <label>Amount</label><input type="text" name="tokenInvestAmount" onChange={handleInputChange}></input>
      <br></br>
      <button type="button" onClick={handleSubmit}>Invest</button><br/>
      <label value={loaderText}>{loaderText}</label>
      </div>
  );
}

const WithdrawLayout = ()=>{
  return(<p>withdraw</p>);
}

const HomeLayout = ()=>{
  const supportedTokens = useContext(SupportedTokensContext);
  const tokenBalance = useContext(TokenBalanceContext);
  const nav = useContext(NavContext);

  return(
    <>
    {/****** My Wallet ******/}
    <CardText
    style={{
      fontWeight: "bold",
      marginTop: "-10px",
      marginBottom: "5px",
    }}
  >
    My Wallet
  </CardText>
  
  {supportedTokens.map((token) => {

    let Bal = tokenBalance.find((object) => {return object.name === token.name});
      if(Bal!==undefined){
        if(Bal.balance!=="0")
        {
          return(
            <Card
            style={{
              marginLeft: -15,
              marginRight: -15,
              padding: "5px 15px",
            }}
            >
              <CardText
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <div>
                  <img
                    src={"https://rates.titans.finance/static/images/"+token.name+".png"}
                    height="18px"
                    style={{
                      marginBottom: "3px",
                      marginRight: "5px",
                    }}
                    alt=""
                  />
                  {token.name}
                </div>
                <div><b>{Bal.balance/ 1e18}</b></div>
              </CardText>
            </Card>
          )
        }
      }
      return (<></>)
    })}
  

  {/****** My Savings ******/}
  <CardText
    style={{
      fontWeight: "bold",
      marginTop: "15px",
      marginBottom: "5px",
    }}
  >
    Savings
  </CardText>

  
  {
    supportedTokens.map((token) => 
      (
        
          <Card
            style={{
              marginLeft: -15,
              marginRight: -15,
              padding: "5px 15px",
            }}
          >
            <CardText
              style={{
                display: "flex",
                justifyItems: "center",
                justifyContent: "space-between",
                fontSize: "14px",
              }}
            >
              <div>
                <img
                  src={"https://rates.titans.finance/static/images/"+token.name+".png"}
                  height="18px"
                  style={{
                    marginBottom: "3px",
                    marginRight: "5px",
                  }}
                  alt=""
                />
                {token.name}
                <span
                  style={{
                    marginLeft: "5px",
                    background: "#e0e0e0",
                    fontSize: "10px",
                    padding: "2px 5px",
                  }}
                >
                  APY: 6.4%
                </span>
              </div>
              <div>
                <b>100.14</b>
                {" "}
                <span
                  style={{
                    fontSize: "12px",
                    color: "#23A632",
                  }}
                >
                  +2.13
                </span>
              </div>
            </CardText>
            <CardText
              style={{
                marginTop: -15,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  marginRight: "10px",
                  background: "#e0e0e0",
                  fontSize: "12px",
                  padding: "2px 5px",
                }} onClick={ ()=> nav.Provider.value.route = 'invest'}
              >
                Buy
              </div>
              <div
                style={{
                  background: "#e0e0e0",
                  fontSize: "12px",
                  padding: "2px 5px",
                }} onClick={ ()=> nav.Provider.value.route = 'withdraw'}
              >
                Sell
              </div>
            </CardText>
          </Card>)
          )
        } 
        </>
  );
}

const ConnectWallet = ({ handleClick = noop, buttonLabel }) => {
  return (
    <Button
      onClick={handleClick}
      className="shadow-none"
      color="primary"
      style={{
        width: "100%",
        borderRadius: "12px",
        marginTop: "120px",
        background: "#4482D0",
      }}
    >
      {buttonLabel}
    </Button>
  );
};


const Savings = ({ onClick = noop }) => {
  

  var [sdk, setsdk] = useState(new SDK());
  const [supportedTokens, setsupportedTokens] = useState([]);
  const [tokenBalance, settokenBalance] = useState([]);
  const [route, setRoute] = useState('home'); 

  async function fetchSDK() {
    try {
      var market = await sdk.init();
      market = sdk.getSupportedTokens();
      setsupportedTokens(market);
      market.map(async (object) => {
        const maxBalance = await sdk.getBalance(object.name);
        const name = object.name;
        settokenBalance(tokenBalance => [...tokenBalance, {name:object.name, balance:maxBalance}] );
      });
      const ethBalance = await sdk.getBalance("ETH");
      settokenBalance(tokenBalance => [...tokenBalance, {name:"ETH", balance:ethBalance}]);
      setsupportedTokens(supportedTokens => [...supportedTokens, {name:"ETH"}]);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }
  
  useEffect(() => {
    fetchSDK();
  }, [supportedTokens]);

  
  return (
    <>
    <div>
      <SDKContext.Provider value={sdk}>
        <SupportedTokensContext.Provider value={supportedTokens}>
          <NavContext.Provider value={{ route, setRoute }}>
            <TokenBalanceContext.Provider value={tokenBalance}>
              <div>
                <button onClick={ ()=> setRoute('invest')}>Invest</button>
                <button onClick={ ()=> setRoute('withdraw')}>Withdraw</button>
                <button onClick={ ()=> setRoute('home')}>Home</button>
              </div>
              <NavContext.Consumer>
                {({ route }) => {
                  switch(route) {
                    case 'invest': return <InvestLayout /> 
                    case 'withdraw': return <WithdrawLayout/>
                    default: return <HomeLayout /> 
                  }
                }}
              </NavContext.Consumer>
            </TokenBalanceContext.Provider>
          </NavContext.Provider>
        </SupportedTokensContext.Provider>
      </SDKContext.Provider>
    </div>
    {/****** My Wallet ******/}
    <CardText
    style={{
      fontWeight: "bold",
      marginTop: "-10px",
      marginBottom: "5px",
    }}
  >
    My Wallet
  </CardText>
  
  {supportedTokens.map((token) => {

    let Bal = tokenBalance.find((object) => {return object.name === token.name});
      if(Bal!==undefined){
        if(Bal.balance!=="0")
        {
          return(
            <Card
            style={{
              marginLeft: -15,
              marginRight: -15,
              padding: "5px 15px",
            }}
            >
              <CardText
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <div>
                  <img
                    src={"https://rates.titans.finance/static/images/"+token.name+".png"}
                    height="18px"
                    style={{
                      marginBottom: "3px",
                      marginRight: "5px",
                    }}
                    alt=""
                  />
                  {token.name}
                </div>
                <div><b>{Bal.balance/ 1e18}</b></div>
              </CardText>
            </Card>
          )
        }
      }
      return (<></>)
    })}
  

  {/****** My Savings ******/}
  <CardText
    style={{
      fontWeight: "bold",
      marginTop: "15px",
      marginBottom: "5px",
    }}
  >
    Savings
  </CardText>

  
  {
    supportedTokens.map((token) => 
      (
          <Card
            style={{
              marginLeft: -15,
              marginRight: -15,
              padding: "5px 15px",
            }}
          >
            <CardText
              style={{
                display: "flex",
                justifyItems: "center",
                justifyContent: "space-between",
                fontSize: "14px",
              }}
            >
              <div>
                <img
                  src={"https://rates.titans.finance/static/images/"+token.name+".png"}
                  height="18px"
                  style={{
                    marginBottom: "3px",
                    marginRight: "5px",
                  }}
                  alt=""
                />
                {token.name}
                <span
                  style={{
                    marginLeft: "5px",
                    background: "#e0e0e0",
                    fontSize: "10px",
                    padding: "2px 5px",
                  }}
                >
                  APY: 6.4%
                </span>
              </div>
              <div>
                <b>100.14</b>
                {" "}
                <span
                  style={{
                    fontSize: "12px",
                    color: "#23A632",
                  }}
                >
                  +2.13
                </span>
              </div>
            </CardText>
            <CardText
              style={{
                marginTop: -15,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  marginRight: "10px",
                  background: "#e0e0e0",
                  fontSize: "12px",
                  padding: "2px 5px",
                }} onClick={ ()=>setRoute('invest')}
              >
                Buy
              </div>
              <div
                style={{
                  background: "#e0e0e0",
                  fontSize: "12px",
                  padding: "2px 5px",
                }} onClick={ ()=>setRoute('withdraw')}
              >
                Sell
              </div>
            </CardText>
          </Card>)
      
    )
  }

  
</>
);
};

const EntryCard = ({
buttonLabel,
handleClick = noop,
wallet,
}) => {
const [kyc, setKyc] = useState(false);
console.log('zzz kyc:', kyc);
const onClick = () => {
window.open(`${KYC.url}`);
setKyc(true);
};
return (
<Card
  style={{
    minWidth: "320px",
    minHeight: "480px",
    borderRadius: "24px",
    filter: "drop-shadow(4px 8px 4px #ddd)",
    background: "#fafafa"
  }}
>
  <CardHeader
    style={{
      fontSize: "18px",
      textAlign: "center",
      borderTopLeftRadius: "24px",
      borderTopRightRadius: "24px",
      background: "linear-gradient(to right, #4482D0, #0E4B98)",
      color: "white",
    }}
  >
    <b>CRYPTO SAVINGS APP</b>
    <br />
    <span style={{fontSize: "12px"}}><em>powered by APIS</em></span>
  </CardHeader>
  <CardBody>
    {
      wallet
      ? <Savings onClick={onClick} />
      : <ConnectWallet handleClick={handleClick} buttonLabel={buttonLabel} />
    }
  </CardBody>
</Card>
);  
};

export default EntryCard;
