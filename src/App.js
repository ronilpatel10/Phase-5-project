import { useState, useEffect } from "react";
import Card from "./components/Card";
import Header from "./components/Header";

const App = () => {
  const [deals, setDeals] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(null); 
  const [sortOption, setSortOption] = useState(null); 

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

  const filterByPrice = (deals) => {
    if (!priceRange) return deals;

    const [min, max] = priceRange.split('-').map(Number);
    return deals.filter(deal => deal.price >= min && deal.price <= max);
  };

  const sortByOption = (deals) => {
    if (!sortOption) return deals;

    if (sortOption === "lowestPrice") {
      return deals.sort((a, b) => a.price - b.price);
    } else if (sortOption === "highestPercentageOff") {
      return deals.sort((a, b) => {
        const aPercentageDrop = ((a.price_strikethrough - a.price) / a.price_strikethrough) * 100;
        const bPercentageDrop = ((b.price_strikethrough - b.price) / b.price_strikethrough) * 100;
        return bPercentageDrop - aPercentageDrop;
      });
    }

    return deals;
  };

  const getFilteredAndSortedDeals = () => {
    let filteredDeals = filterByPrice(deals);
    return sortByOption(filteredDeals);
  };

  useEffect(() => {
    getDeals();
  }, []);

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
        <label>
          Price Range:
          <select value={priceRange} onChange={e => setPriceRange(e.target.value)}>
            <option value={null}>All</option>
            <option value="10-100">10 - 100</option>
            <option value="100-250">100 - 250</option>
            <option value="250-500">250 - 500</option>
            <option value="500-1000">500 - 1000</option>
          </select>
        </label>

        <label>
          Sort By:
          <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
            <option value={null}>None</option>
            <option value="lowestPrice">Lowest Price</option>
            <option value="highestPercentageOff">Highest Percentage Off</option>
          </select>
        </label>

        <input 
          type="text" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          placeholder="Search for products..." 
        />
        <button onClick={handleSearch}>Search</button>
        <h2>Best Deals!</h2>
        <div className="feed">
  {deals && getFilteredAndSortedDeals().map(deal => <Card key={deal.pos} item={deal} />)}
</div>

      </div>
    </div>
  );
}

export default App;
