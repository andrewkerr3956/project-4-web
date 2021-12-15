import './App.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const ApiComponent = () => {
  const [search, setSearch] = useState("");
  const handleSearch = (event) => {
    let newSearch = event.target.value;
    setSearch(newSearch)
  }
  const fetchSearch = async() => {
    let symbol = search;
    console.log(`http://localhost:3000/api/search/${symbol}`)
    let data = await fetch(`http://localhost:3000/api/search/${symbol}`);
    data = await data.json();
    console.log(data);
  }
  return (
    <>
      <div style={{display: "flex", justifyContent: "center"}}>
        <input type="text" className={"search-bar"} name="search" value={search} onChange={handleSearch} placeholder={"Search..."}/>
        <button className={"search-btn"} onClick={fetchSearch}><FontAwesomeIcon icon={faSearch} /></button>
      </div>
      <section name="stocks-section">
        <div className={"stocks-container"}>
          
        </div>
      </section>

    </>
  )
}

const DbComponent = () => {
  return (
    <>
      <h3>Portfolio</h3>
      <div className={'grid-container'}>
            <div className={'grid-header'}><strong>Stock</strong></div>
            <div className={'grid-header'}><strong>Quantity</strong></div>
            <div className={'grid-header'}><strong>Value</strong></div>
            <div className={'grid-header'}><strong>Buy/Sell</strong></div>
      </div>
    </>
  )
}

function App() {
  const [loginDisplay, setLoginDisplay] = useState(false);
  const [registerDisplay, setRegisterDisplay] = useState(false);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const loginBox = () => { 
    if(registerDisplay) {
      setRegisterDisplay(false);
    }
    let newDisplay = !loginDisplay;
    setLoginDisplay(newDisplay);
  }

  const registerBox = () => {
    if(loginDisplay) {
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

  const handleLogin = async() => {
    let success = await fetch('http://localhost:3000/api/portfolio/', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: username, password: password})
      })
    success = await success.json();
    console.log(success);
  }


  const handleRegister = async() => {
    let success = await fetch('http://localhost:3000/api/portfolio/', { 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: username, password: password})
      })
    success = await success.json();
    console.log(success);
  }

  return (
    <div className={"main-container"}>
      {/*In case the screen is too small */}
      <h3 className={"small-screen-warning"}>The app cannot work on this device.</h3>
      <header>
        <div className={"header-container"}>
          {sessionStorage.username && ((sessionStorage) => {
            const userName = sessionStorage.username;
            const id = sessionStorage.userid;
            return (
              <div key={id}>Welcome, {userName}!</div>
            )
          })}
          <h2>Paper Trader</h2>
          <h4><em>We make buying stocks as easy as it should be.</em></h4>
          <div className={'login-container'}>
            <button onClick={loginBox} style={{backgroundColor: "blue"}}>Login</button>
            <button onClick={registerBox} style={{backgroundColor: "green"}}>Register</button>
            {loginDisplay && (
                <div className={"login-box"}>
                  <form>
                    <input type="text" value={username} onChange={handleUsername} placeholder={"Enter username..."} required />
                    <input type="password" value={password} onChange={handlePassword} placeholder={"Enter password..."} required />
                    <button onClick={handleLogin}>Login</button>
                  </form>
                </div>
            )}
            {registerDisplay && (
                <div className={"login-box"}>
                  <form>
                    <input type="text" value={username} onChange={handleUsername} placeholder={"Enter username..."} required />
                    <input type="password" value={password} onChange={handlePassword} placeholder={"Enter password..."} required />
                    <button onClick={handleRegister} style={{backgroundColor: 'lightseagreen'}}>Register</button>
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
