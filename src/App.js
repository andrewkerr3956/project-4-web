import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';


const ApiComponent = (props) => {
  const [search, setSearch] = useState("");
  const [stockData, setStockData] = useState({});
  const [quantity, setQuantity] = useState(0);

  const handleSearch = (event) => {
    let newSearch = event.target.value;
    setSearch(newSearch)
  }

  const handleQuantity = (event) => {
    setQuantity(event.target.value);
  }

  const handleBuy = () => {
    console.log("Activated handle buy!")
    if (sessionStorage.length > 0 && quantity > 0) {
      let newWallet = parseFloat(props.wallet - (stockData.value * quantity)).toFixed(2);
      let oldPortfolio = props.portfolio.map((item, idx) => {
        // Check to see if the symbol is already inside of the user's porfolio.
        if (item.includes(stockData.symbol)) {
          return true;
        }
        else {
          return false;
        }
      });
      if (newWallet >= 0) {
        if (oldPortfolio.includes(true)) {
          setQuantity(0)
          return alert("This stock already exists in your portfolio! Buy more shares from your portfolio.");
        }
        else {
          props.setWallet(newWallet);
          props.setPortfolio([...props.portfolio, [stockData.symbol, quantity, parseFloat(stockData.value).toFixed(2)]]);
          setQuantity(0)
          setStockData({});
        }

      }
    }
  }

  const fetchSearch = async () => {
    let symbol = search;
    let data = await fetch(`http://localhost:3000/api/search/${symbol}`);
    data = await data.json();
    if (data.error) {
      return alert("Data for this symbol could not be found.");
    }
    else {
      setStockData({ symbol: symbol, value: data.data.price.toFixed(2) });
      console.log("history: ", data.history);
      fetchChart(symbol);
    }
  }

  const fetchChart = async (symbol) => {
    let chart = await fetch(`http://localhost:3000/api/chart/${symbol}`);
    chart = await chart.json();
    // The server responds with a url for an image, we are taking the url and concatenating it onto the src of an img element that exists on the page.
    document.getElementById("chart-img").setAttribute('src', chart.img);
    
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <input type="text" className={"search-bar"} name="search" value={search} onChange={handleSearch} placeholder={"Search..."} />
        <button className={"search-btn"} onClick={fetchSearch}><FontAwesomeIcon icon={faSearch} /></button>
      </div>
      <section name="stocks-section">
        <div className={"stocks-container"}>
          <div id="yahoo-info">
          </div>
          {stockData.symbol && stockData.value && (
            <div style={{ textAlign: "center" }}>
              <strong>
                <span>{stockData.symbol}</span>
                <span style={{ marginLeft: "10px" }}>${stockData.value}</span>
              </strong>
              <div id="chart-container">
                <img id="chart-img" alt="Stock Chart" />
              </div>
              <br />
              <div>Quantity</div> <br />
              <input type="number" min={0} max={5} value={quantity} onChange={handleQuantity} /> <p />
              <button style={{marginBottom: "15px"}} onClick={handleBuy}>Buy</button>
            </div>
          )}
        </div>
      </section>

    </>
  )
}

const DbComponent = (props) => {
  /* selectedShare will have an inital state of -1, so it fails the conditional 
  check since we don't want quantity displayed unless something is selected. */
  const [selectedShare, setSelectedShare] = useState(-1);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    // Only fetch portfolio if a user is actually logged in and no collection OR wallet item exists.
    if (sessionStorage.getItem("userid") && (!sessionStorage.getItem("collection") || !sessionStorage.getItem("wallet"))) {
      fetchPortfolio();
    }
  });

  useEffect(() => {
    if (selectedShare === -1) {
      let resetRadio = document.getElementsByName("buy-sell-portfolio");
      // The for loop will go through each element in the buy-sell-portfolio list and uncheck all radio buttons.
      for(let i = 0; i < resetRadio.length; i++) {
        resetRadio[i].checked = false;
      }
    }
  }, [selectedShare])

  const fetchPortfolio = async () => {
    let fetchPortfolio = await fetch(`http://localhost:3000/api/portfolio/${sessionStorage.getItem("userid")}`);
    fetchPortfolio = await fetchPortfolio.json();
    // Only if the sessionStorage for the collection and wallet items don't exist, then we use the portfolio from the database.
    if (!sessionStorage.getItem("collection")) {
      if (fetchPortfolio.results[0].collection == null) {
        props.setPortfolio([]);
      }
      else {
        props.setPortfolio(fetchPortfolio.results[0].collection)
      }
    }
    if (!sessionStorage.getItem("wallet")) {
      if (fetchPortfolio.results[0].wallet == null) {
        props.setWallet(3000);
      }
      else {
        props.setWallet(fetchPortfolio.results[0].wallet)
      }
    }
  }

  const resetPortfolio = () => {
    props.setPortfolio([]);
    props.setWallet(3000);
  }

  const savePortfolio = async () => {
    let portfolioid = sessionStorage.getItem("portfolioid")
    let saveNewPortfolio = await fetch("http://localhost:3000/api/portfolio/save", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ portfolioId: portfolioid, portfolioData: props.portfolio, currentWallet: props.wallet })

    });
    saveNewPortfolio = await saveNewPortfolio.json();
    if (saveNewPortfolio.error) {
      return alert("Your portfolio failed to save. Nothing changed.");
    }
    else {
      return alert("Your portfolio was successfully saved!");
    }
  }

  const handleSelectedShare = (event) => {
    setSelectedShare(event.target.id);
  }

  const handleQuantity = (event) => {
    setQuantity(event.target.value);
  }

  const handleBuy = () => {
    // newWallet is being set to the user's balance - the third item of the selected share in the user's portfolio 
    // (the third item is the value of the share).
    let newWallet = parseFloat(props.wallet) - parseFloat(props.portfolio[selectedShare][2] * quantity);
    // User can buy more shares as long as their wallet balance would not go below 0.
    if (newWallet > 0) {
      let oldPortfolio = [];
      props.portfolio.map((item, idx) => {
        return oldPortfolio.push(item);
      });
      oldPortfolio[selectedShare][1] = parseInt(oldPortfolio[selectedShare][1]) + parseInt(quantity);
      props.setPortfolio(oldPortfolio);
      props.setWallet(newWallet.toFixed(2));
      setSelectedShare(-1);
      setQuantity(0);
    }
    else {
      console.log("The balance would go below 0, so it's not allowed.");
    }
  }



  const handleSell = () => {
    let oldPortfolio = [];
    console.log("portfolio: ", props.portfolio)
    props.portfolio.map((item, idx) => {
      return oldPortfolio.push(item);
    });
    console.log(oldPortfolio);
    // Checking to make sure that you can only sell what you have
    let newWallet = parseFloat(props.wallet) + parseFloat(props.portfolio[selectedShare][2] * quantity);
    if (props.portfolio[selectedShare][1] >= quantity) {
      // If the quantity of the share would go to 0, it will be removed from the portfolio.
      if (parseInt(oldPortfolio[selectedShare][1]) === 1) {
        oldPortfolio.splice(selectedShare, 1);
        props.setPortfolio(oldPortfolio);
        props.setWallet(newWallet.toFixed(2));
        setSelectedShare(-1);
        setQuantity(0);
      }
      else {
        oldPortfolio[selectedShare][1] = parseInt(oldPortfolio[selectedShare][1]) - parseInt(quantity);
        props.setPortfolio(oldPortfolio);
        props.setWallet(newWallet.toFixed(2));
        setSelectedShare(-1);
        setQuantity(0);
      }
    }
    else {
      console.log("You're trying to sell more than you have!");
    }
  }

  return (
    <>
      {sessionStorage.length > 0 && (
        <h4>Remaining Balance: ${props.wallet}</h4>
      )}
      <h3>Portfolio</h3>
      {sessionStorage.getItem("userid") && props.portfolio != null && (
        <>
          <button onClick={resetPortfolio}>Reset Portfolio</button>
          <button onClick={savePortfolio}>Save Portfolio</button>
        </>
      )}
      <div className={'grid-container'}>
        <div className={'grid-header'}><strong>Stock</strong></div>
        <div className={'grid-header'}><strong>Quantity</strong></div>
        <div className={'grid-header'}><strong>Value</strong></div>
        <div className={'grid-header'}><strong>Buy/Sell</strong></div>
        {props.portfolio != null && props.portfolio !== [] && props.portfolio.length > 0 && props.portfolio.map((item, idx) => {
          return (
            <>
              <div className={'grid-item'}>{item[0]}</div>
              <div className={'grid-item'}>{item[1]}</div>
              <div className={'grid-item'}>${item[2]}</div>
              <div className={'grid-item'}>
                <input name="buy-sell-portfolio" key={idx} id={idx} type="radio" value={selectedShare} onChange={handleSelectedShare} />
              </div>
            </>
          )
        })}
      </div>
      {selectedShare >= 0 && (
        <div>
          <label for={"quantity"}>
            <strong>Quantity</strong> <br />
            <div></div>
            <input name="quantity" type="number" min={0} max={5} value={quantity} onChange={handleQuantity} />
          </label> <br />
          <button onClick={handleBuy}>Buy</button>
          <button onClick={handleSell}>Sell</button>
        </div>
      )}

    </>
  )
}
function App() {
  const [loginDisplay, setLoginDisplay] = useState(false);
  const [registerDisplay, setRegisterDisplay] = useState(false);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  // Portfolio initializes at [] if nothing is in the sessionStorage.
  const [portfolio, setPortfolio] = useState(JSON.parse(sessionStorage.getItem("collection")) || []);
  // Wallet state intializes at 3000 if nothing is in the sessionStorage since that is the default set in the database.
  const [wallet, setWallet] = useState(sessionStorage.getItem("wallet") || 3000);

  useEffect(() => {
    if (sessionStorage.getItem("userid")) {
      console.log("PORTFOLIO EFFECT CALLED")
      sessionStorage.setItem("collection", [JSON.stringify(portfolio)]);
    }
  }, [portfolio]);

  useEffect(() => {
    if (sessionStorage.getItem("userid")) {
      console.log("WALLET EFFECT CALLED")
      sessionStorage.setItem("wallet", wallet);
    }
  }, [wallet]);

  const loginBox = () => {
    if (registerDisplay) {
      setRegisterDisplay(false);
    }
    let newDisplay = !loginDisplay;
    setLoginDisplay(newDisplay); // Set the login display to the opposite of the current value, or if register display is active, hide the login display.
  }

  const registerBox = () => {
    if (loginDisplay) {
      setLoginDisplay(false);
    }
    let newDisplay = !registerDisplay;
    setRegisterDisplay(newDisplay);
  }

  const handleUsername = (event) => {
    let newUsername = event.target.value;
    setUserName(newUsername);
  }

  const handlePassword = (event) => {
    let newPassword = event.target.value;
    setPassword(newPassword);
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    let login = await fetch('http://localhost:3000/api/portfolio/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password })
    });
    login = await login.json();
    console.log(login);
    if (login.error) {
      return alert("Invalid login, please try again.");
    }
    else {
      console.log(login.results[0]);
      sessionStorage.setItem("userid", login.results[0].userid);
      sessionStorage.setItem("user", login.results[0].username);
      sessionStorage.setItem("portfolioid", login.results[0].portfolioid);
      // Check if collection is null
      if (login.results[0].collection == null) {
        setPortfolio([]);
      }
      else {
        setPortfolio(login.results[0].collection);
      }
      setWallet(login.results[0].wallet);
      window.location.reload();
    }
  }

  const handleLogout = async (event) => {
    sessionStorage.clear();
    setPortfolio([]);
    setWallet(0);
    window.location.reload();
  }


  const handleRegister = async (event) => {
    event.preventDefault();
    let register = await fetch('http://localhost:3000/api/portfolio/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password })
    });
    register = await register.json();
    if (register.error) {
      return alert("Username already exists!");
    }
    else {
      setUserName("");
      setPassword("");
    }
  }

  return (
    <div className={"main-container"}>
      {/*In case the screen is too small */}
      <h3 className={"small-screen-warning"}>The app cannot work on this device.</h3>
      <header>
        <div className={"header-container"}>
          <h2 style={{ margin: "0 auto" }}>Paper Trader</h2>
          <h4><em>We make buying stocks as easy as it should be.</em></h4>
          <div className={'login-container'}>
            {sessionStorage.length > 0 && (
              <div key={sessionStorage.getItem("userid")} style={{ fontWeight: "bold" }}>Welcome, {sessionStorage.getItem("user")}!
                <button onClick={handleLogout} style={{ backgroundColor: "crimson", color: "white", marginLeft: "10px" }}>Logout</button>
              </div>
            )}
            {sessionStorage.length === 0 && (
              <>
                <button onClick={loginBox} style={{ backgroundColor: "blue" }}>Login</button>
                <button onClick={registerBox} style={{ backgroundColor: "green" }}>Register</button>
              </>
            )}
            {loginDisplay && (
              <div className={"login-box"}>
                <form>
                  <input type="text" value={username} onChange={handleUsername} placeholder={"Enter username..."} required maxLength={50} />
                  <input type="password" value={password} onChange={handlePassword} placeholder={"Enter password..."} required />
                  <button onClick={handleLogin}>Login</button>
                </form>
              </div>
            )}
            {registerDisplay && (
              <div className={"login-box"}>
                <form>
                  <input type="text" value={username} onChange={handleUsername} placeholder={"Enter username..."} required maxLength={50} />
                  <input type="password" value={password} onChange={handlePassword} placeholder={"Enter password..."} required />
                  <button onClick={handleRegister} style={{ backgroundColor: 'lightseagreen' }}>Register</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>
      <main>
        <div className={"flex-container"}>
          <div className={"api-container"}>
            <ApiComponent portfolio={portfolio} setPortfolio={setPortfolio} wallet={wallet} setWallet={setWallet} />
          </div>
          <div className={"database-container"}>
            <DbComponent portfolio={portfolio} setPortfolio={setPortfolio} wallet={wallet} setWallet={setWallet} />
          </div>
        </div>
      </main>
      <footer>

      </footer>
    </div>
  );
}

export default App;