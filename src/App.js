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
      let newWallet = parseFloat(props.wallet) - parseFloat(stockData.value * quantity).toFixed(2);
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
        console.log(`props.setTransactions([...props.transactions, ['Bought ${quantity} shares of ${stockData.symbol} - New balance: $${newWallet}', ${newWallet}]])`)
        props.setTransactions([...props.transactions, [`Bought ${quantity} shares of ${stockData.symbol} - New balance: $${newWallet.toFixed(2)}`, parseFloat(newWallet.toFixed(2))]]);
      }
    }
  }

  const fetchSearch = async () => {
    let symbol = search;
    let data = await fetch(`https://desolate-island-76676.herokuapp.com/api/search/${symbol}`); // http://localhost:3000
    data = await data.json();
    if (data.error) {
      setSearch("");
      return alert("Data for this symbol could not be found.");
    }
    else {
      setStockData({ symbol: symbol, value: data.data.price.toFixed(2) });
      fetchChart(symbol);
      setSearch("");
    }
  }

  const fetchChart = async (symbol) => {
    let chart = await fetch(`https://desolate-island-76676.herokuapp.com/api/chart/${symbol}`); // http://localhost:3000
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
              <button style={{ marginBottom: "15px" }} onClick={handleBuy}>Buy</button>
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
  const [historyView, setHistoryView] = useState("none"); // Manipulate div style to either hide or show the history view.

  useEffect(() => {
    // Only fetch portfolio if a user is actually logged in and no collection, wallet, OR transactions exist in the sessionStorage.
    if (sessionStorage.getItem("userid") && (!sessionStorage.getItem("collection") || !sessionStorage.getItem("wallet") || !sessionStorage.getItem("transactions"))) {
      fetchPortfolio();
    }
  });

  useEffect(() => {
    // Clear the div when the user clicks off of the history view
    if (historyView === "none") {
      document.getElementById('transaction-summary').innerHTML = "";
    }
  }, [historyView])

  useEffect(() => {
    if (selectedShare === -1) {
      let resetRadio = document.getElementsByName("buy-sell-portfolio");
      // The for loop will go through each element in the buy-sell-portfolio list and uncheck all radio buttons.
      for (let i = 0; i < resetRadio.length; i++) {
        resetRadio[i].checked = false;
      }
    }
  }, [selectedShare])

  const fetchPortfolio = async () => {
    let fetchPortfolio = await fetch(`https://desolate-island-76676.herokuapp.com/api/portfolio/${sessionStorage.getItem("userid")}`); //http://localhost:3000
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
    if (!sessionStorage.getItem("transactions")) {
      if (fetchPortfolio.results[0].transactions == null) {
        props.setTransactions([]);
      }
      else {
        props.setTransactions(fetchPortfolio.results[0].transactions);
      }
    }
  }

  const resetPortfolio = () => {
    props.setPortfolio([]);
    props.setWallet(3000);
    props.setTransactions([]);
  }

  const savePortfolio = async () => {
    let portfolioid = sessionStorage.getItem("portfolioid")
    let saveNewPortfolio = await fetch("https://desolate-island-76676.herokuapp.com/api/portfolio/save", { // http://localhost:3000
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ portfolioId: portfolioid, portfolioData: props.portfolio, currentWallet: props.wallet, transactions: props.transactions })

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

  const viewHistory = async () => {
    console.log(props.transactions);
    // Checks to make sure that transactions is an array, and there is at least 2 transactions inside of it.
    if (historyView === "none" && props.transactions.length && props.transactions.length > 1) {
      setSelectedShare(-1);
      setQuantity(0);
      setHistoryView("block");
      let transactionHistory = [];
      props.transactions.map((item, idx) => {
        return transactionHistory.push(item[0]);
      });
      let balanceHistory = [];
      props.transactions.map((item, idx) => {
        return balanceHistory.push(item[1]);
      });
      // Display the transaction history
      let chart = await fetch(`https://desolate-island-76676.herokuapp.com/api/portfolio/view/`, { // http://localhost:3000
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transactions: balanceHistory })
      });
      chart = await chart.json();
      document.getElementById('transaction-img').setAttribute('src', chart.img);
      transactionHistory.map((item) => {
        return document.getElementById('transaction-summary').innerHTML +=
          `<p>${item.toString()}</p>`;
      })

    }
    else {
      alert("You need to make transactions first!");
    }
  }

  const handleBuy = () => {
    // newWallet is being set to the user's balance - the third item of the selected share in the user's portfolio 
    // (the third item is the value of the share).
    let newWallet = parseFloat(props.wallet) - parseFloat(props.portfolio[selectedShare][2] * quantity);
    // User can buy more shares as long as their wallet balance would not go below 0.
    if (newWallet > 0) {
      if (quantity > 0) { // Only run if the quantity is greater than 0, we don't need to add a transaction saying "Bought 0 more shares of {symbol}"
        let oldPortfolio = [];
        props.portfolio.map((item, idx) => {
          return oldPortfolio.push(item);
        });
        oldPortfolio[selectedShare][1] = parseInt(oldPortfolio[selectedShare][1]) + parseInt(quantity);
        props.setPortfolio(oldPortfolio);
        props.setWallet(newWallet.toFixed(2));
        setSelectedShare(-1);
        setQuantity(0);
        props.setTransactions([...props.transactions, [`Bought ${quantity} more shares of ${props.portfolio[selectedShare][0]} - New balance: $${newWallet.toFixed(2)}`, parseFloat(newWallet.toFixed(2))]])
      }


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
      if (parseInt(oldPortfolio[selectedShare][1]) - quantity === 0) {
        oldPortfolio.splice(selectedShare, 1);
        props.setPortfolio(oldPortfolio);
        props.setWallet(newWallet.toFixed(2));
        setSelectedShare(-1);
        setQuantity(0);
        props.setTransactions([...props.transactions, [`Sold the remaining ${quantity} shares of ${props.portfolio[selectedShare][0]} - New balance: $${newWallet.toFixed(2)}`, parseFloat(newWallet.toFixed(2))]]);
      }
      else if (quantity === 0) {
        // This is supposed to be blank, to cover the case of if the user does not select a quantity to sell.
      }
      else {
        oldPortfolio[selectedShare][1] = parseInt(oldPortfolio[selectedShare][1]) - parseInt(quantity);
        props.setPortfolio(oldPortfolio);
        props.setWallet(newWallet.toFixed(2));
        setSelectedShare(-1);
        setQuantity(0);
        props.setTransactions([...props.transactions, [`Sold ${quantity} shares of ${props.portfolio[selectedShare][0]} - New balance: $${newWallet.toFixed(2)}`, parseFloat(newWallet.toFixed(2))]]);
      }
    }
    else {
      console.log("You're trying to sell more than you have!");
    }
  }

  return (
    <>
      <div id="transaction-container" style={{ display: historyView, textAlign: "center" }}>
        <button onClick={() => setHistoryView("none")}>Return to Portfolio</button>
        <img style={{ display: "inherit", margin: "0 auto", overflowX: "auto" }} id="transaction-img" alt="Transaction Chart" />
        <div id="transaction-summary"></div>
      </div>
      {sessionStorage.length > 0 && historyView === "none" && (
        <>
          <h4>Remaining Balance: ${parseFloat(props.wallet).toFixed(2)}</h4>
          
        </>
      )}
      <h3>Portfolio</h3>
      {sessionStorage.getItem("userid") && historyView === "none" && props.portfolio != null && (
        <>
          <button onClick={viewHistory}>History View</button> <br />
          <button onClick={resetPortfolio}>Reset Portfolio</button>
          <button onClick={savePortfolio}>Save Portfolio</button>
        </>
      )}
      {props.portfolio != null && props.portfolio !== [] && props.portfolio.length > 0 && historyView === "none" && (
        <div className={'grid-container'}>
          <div className={'grid-header'}><strong>Stock</strong></div>
          <div className={'grid-header'}><strong>Quantity</strong></div>
          <div className={'grid-header'}><strong>Value</strong></div>
          <div className={'grid-header'}><strong>Buy/Sell</strong></div>
          {props.portfolio.map((item, idx) => {
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
      )}
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
  // Transactions initializes at [] if nothing is in the sessionStorage.
  const [transactions, setTransactions] = useState(JSON.parse(sessionStorage.getItem("transactions")) || []);

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

  useEffect(() => {
    if (sessionStorage.getItem("userid")) {
      console.log("TRANSACTION EFFECT CALLED")
      sessionStorage.setItem("transactions", [JSON.stringify(transactions)]);
    }
  }, [transactions]);

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
    if (username !== "" && username !== null && password !== "" && password !== null) { // Double check on these fields
      let login = await fetch('https://desolate-island-76676.herokuapp.com/api/portfolio/', { // http://localhost:3000
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
      });
      login = await login.json();
      console.log(login);
      if (login.error) {
        alert("Invalid login, please try again.");
        setUserName("");
        setPassword("");
      }
      else {
        console.log(login.results[0]);
        setLoginDisplay(false);
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
        // Check if transactions is null
        if (login.results[0].transactions == null) {
          setTransactions([]);
        }
        else {
          setTransactions(login.results[0].transactions);
        }
        window.location.reload();
      }
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
    if (username !== "" && username !== null && password !== "" && password !== null) { // Double check on these fields
      let register = await fetch('https://desolate-island-76676.herokuapp.com/api/portfolio/', { // http://localhost:3000
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
      });
      register = await register.json();
      if (register.error) {
        alert("Username already exists!");
        setUserName("");
        setPassword("");
      }
      else {
        setRegisterDisplay(false);
        alert("Registered successfully!");
        setUserName("");
        setPassword("");
      }
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
            <ApiComponent portfolio={portfolio} setPortfolio={setPortfolio} wallet={wallet} setWallet={setWallet} transactions={transactions} setTransactions={setTransactions} />
          </div>
          <div className={"database-container"}>
            <DbComponent portfolio={portfolio} setPortfolio={setPortfolio} wallet={wallet} setWallet={setWallet} transactions={transactions} setTransactions={setTransactions} />
          </div>
        </div>
      </main>
      <footer>

      </footer>
    </div>
  );
}

export default App;