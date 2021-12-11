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
  return (
    <>
      <div style={{display: "flex", justifyContent: "center"}}>
        <input type="text" className={"search-bar"} name="search" value={search} onChange={handleSearch} placeholder={"Search..."}/>
        <button className={"search-btn"}><FontAwesomeIcon icon={faSearch} /></button>
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
      
    </>
  )
}

function App() {
  return (
    <div className={"main-container"}>
      {/*In case the screen is too small */}
      <h3 className={"small-screen-warning"}>The app cannot work on this device.</h3>
      <header>
        <div className={"header-container"}>
          <h2>Paper Trader</h2>
          <h4><em>We make buying stocks as easy as it should be.</em></h4>
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
