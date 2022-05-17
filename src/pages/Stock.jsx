import Nav from "../components/Nav";
import { useEffect, useState } from "react"
import { useParams } from 'react-router-dom'

const Stock = (props) => {

  console.log(props + " props on Stock Page")

  const { stockId } = useParams()
  console.log(stockId)
  const [stock, setStock] = useState(null);

  const getStocks = async () => {
    try {
      const apiKey = process.env.REACT_APP_API;
      const URL = `https://api.stockdata.org/v1/data/quote?symbols=${stockId}&api_token=${apiKey}`;
      const response = await fetch(URL);
      const data = await response.json();
      console.log(data)
      setStock(data.data[0])
      console.log(stock);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStocks();
  }, [stockId]);

  const loaded = () => {
    return (
      <>
        <Nav />
        <div className="stock-page">
          <div className="stock-info">
            <h1>{stock.ticker}</h1>
            <h2>{stock.name}</h2>
            <h3>${stock.price} per share</h3>
            <p>Market Cap: ${stock.market_cap}</p>
            <p>Day high: ${stock.day_high}</p>
            <p>Day low: ${stock.day_low}</p>
          </div>
        </div>
      </>
    );
  };

  const loading = () => {
    return (
      <div className="fetching">
        <h3>FETCHING DATA...</h3>
      </div>
    );
  };

  return stock ? loaded() : loading();
};

export default Stock;
