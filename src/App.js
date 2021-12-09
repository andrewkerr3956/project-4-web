import './App.css';

const ApiComponent = () => {
  return (
    <div style={{textAlign: "center"}}>
      Test
    </div>
  )
}

const DbComponent = () => {
  return (
    <div style={{textAlign: "center"}}>
      Test
    </div>
  )
}

function App() {
  return (
    <div className={"main-container"}>
      <header>
        <div className={"header-container"}>
          <h2>Paper Trader</h2>
          <h4><em>We make buying shares as easy as it should be.</em></h4>
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
