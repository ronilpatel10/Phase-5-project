import { useState, useEffect } from "react";
import Card from "./components/Card";
import Header from "./components/Header";

const App = () => {
  const [deals, setDeals] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");  

  const getDeals = async (searchTerm = "deals of the day") => { 
    try {
      const response = await fetch(`http://localhost:8000/deals?search=${searchTerm}`, { method: "GET" });
      const data = await response.json();
      setDeals(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSearch = async () => {
    getDeals(searchTerm);
  };

  useEffect(() => {
    getDeals();
  }, []);

  console.log(deals);

  return (
    <div className="App">
      <Header />
     
      <nav>
        <button className="primary">Amazon</button>
        <button className="primary">Google Shopping</button>
        <button className="primary">eBay</button>
        <button className="primary">Etsy</button>
      </nav>
      <div>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          placeholder="Search for products..." 
        />
        <button onClick={handleSearch}>Search</button>
        <h2>Best Deals!</h2>
        <div className="feed">
          {deals?.map(deal => <Card key={deal.pos} item={deal} />)}
        </div>
      </div>
    </div>
  );
}

export default App;
