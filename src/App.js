import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';


const ApiComponent = () => {
  const [search, setSearch] = useState("");
  const [stockData, setStockData] = useState({});
  const [newPortfolio, setNewPortfolio] = useState([]);
  const [newWallet, setNewWallet] = useState(0);

  useEffect(() => {
    sessionStorage.setItem("collection", [JSON.stringify(newPortfolio)]);
    sessionStorage.setItem("wallet", newWallet);
  }, [newPortfolio, newWallet]);

  const handleSearch = (event) => {
    let newSearch = event.target.value;
    setSearch(newSearch)
  }

  const handleBuy = () => {
    console.log("Activated handle buy!")
    if (sessionStorage.length > 0) {
      let portfolio = JSON.parse(sessionStorage.getItem("collection"));
      console.log("portfolioCollection ", portfolio);
      portfolio.push([stockData.symbol, 1, parseFloat(stockData.value)]);
      setNewPortfolio(portfolio);
      let wallet = parseFloat(sessionStorage.getItem("wallet")).toFixed(2) - parseFloat(stockData.value);
      setNewWallet(wallet);
      setStockData({});
    }
  }

  const fetchSearch = async () => {
    let symbol = search;
    console.log(`http://localhost:3000/api/search/${symbol}`)
    let data = await fetch(`http://localhost:3000/api/search/${symbol}`);
    data = await data.json();
    if (data.error) {
      return alert("Data for this symbol could not be found.");
    }
    else {
      setStockData({ symbol: symbol, value: data.data.price.toFixed(2) });
    }
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
            <div style={{textAlign: "center"}}>
              <strong>
                <span>{stockData.symbol}</span>
                <span style={{marginLeft: "10px"}}>${stockData.value}</span>
              </strong>
              <br />
              <button onClick={handleBuy}>Buy</button>
            </div>
          )}
        </div>
      </section>

    </>
  )
}

const DbComponent = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [selectedShare, setSelectedShare] = useState(0);

  useEffect(() => {
    if (sessionStorage.length > 0) {
      fetchPortfolio();
    }
  }, []);

  useEffect(() => {
    if(sessionStorage.getItem("collection").length > portfolio.length) {
      setPortfolio(JSON.parse(sessionStorage.getItem("collection")));
    }
    else {
      console.log("This is useless")
    }
  }, []);

  const fetchPortfolio = async () => {
    let fetchPortfolio = await fetch(`http://localhost:3000/api/portfolio/${sessionStorage.getItem("userid")}`);
    fetchPortfolio = await fetchPortfolio.json();
    let newPortfolio = [];
    if(fetchPortfolio.results[0].collection != null) {
    if(fetchPortfolio.results[0].collection.length > sessionStorage.getItem("collection").length) {
      fetchPortfolio.results[0].collection.map((item) => {
        return newPortfolio.push(item);
      });
      console.log("newPortfolio", newPortfolio)
      setPortfolio(newPortfolio);
      setWallet(fetchPortfolio.results[0].wallet);
    }
    else {
      let savedSessionPortfolio = JSON.parse(sessionStorage.getItem("collection"));
      savedSessionPortfolio.map((item) => {
        return newPortfolio.push(item);
      });
    }
    console.log("newPortfolio", newPortfolio)
    setPortfolio(newPortfolio);
    setWallet(fetchPortfolio.results[0].wallet);
  }
  else {
    setWallet(fetchPortfolio.results[0].wallet);
    console.log("No portfolio data fetched");
  }
  
  }

  const savePortfolio = async () => {
    let portfolioid = sessionStorage.getItem("portfolioid")
    let saveNewPortfolio = await fetch("http://localhost:3000/api/portfolio/save", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ portfolioId: portfolioid, portfolioData: portfolio })

    });
    saveNewPortfolio = await saveNewPortfolio.json();
    if (saveNewPortfolio.error) {
      return alert("Your portfolio failed to save. Nothing changed.");
    }
    else {
      return alert("Your portfolio was successfully saved!");
    }
  }

  return (
    <>
      {sessionStorage.length > 0 && (
        <h4>Remaining Balance: ${wallet}</h4>
      )}
      <h3>Portfolio</h3>
      {portfolio[0] != null && (
        <button onClick={savePortfolio}>Save Portfolio</button>
      )}
      <div className={'grid-container'}>
        <div className={'grid-header'}><strong>Stock</strong></div>
        <div className={'grid-header'}><strong>Quantity</strong></div>
        <div className={'grid-header'}><strong>Value</strong></div>
        <div className={'grid-header'}><strong>Buy/Sell</strong></div>
        {portfolio[0] != null && portfolio.length > 0 && portfolio.map((item, idx) => {
          return (
            <>
              <div className={'grid-item'}>{item[0]}</div>
              <div className={'grid-item'}>{item[1]}</div>
              <div className={'grid-item'}>${item[2]}</div>
              <div className={'grid-item'}>
                <input name="buy-sell-stock" key={idx} type="radio"></input>
              </div>
            </>
          )
        })}
      </div>
      {selectedShare !== 0 && (
        <div>
          <strong>Quantity</strong>
          {/* Quantity will need to be built into here */}
          <input type="number" min={0} max={0}></input>
          <button>Buy</button>
          <button>Sell</button>
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

  const loginBox = () => {
    if (registerDisplay) {
      setRegisterDisplay(false);
    }
    let newDisplay = !loginDisplay;
    setLoginDisplay(newDisplay);
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
      // Iterate over the portfolio collection
      let storedCollection = [];
      login.results[0].collection.map((item) => {
        return storedCollection.push(item);
      })
      sessionStorage.setItem("collection", JSON.stringify(storedCollection));
      sessionStorage.setItem("wallet", login.results[0].wallet);
      window.location.reload();
    }
  }

  const handleLogout = async (event) => {
    sessionStorage.clear();
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
            <ApiComponent />
          </div>
          <div className={"database-container"}>
            <DbComponent />
          </div>
        </div>
      </main>
      <footer>

      </footer>
    </div>
  );
}

export default App;
