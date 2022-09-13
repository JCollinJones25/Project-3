import Nav from "../components/Nav";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Chart from "react-apexcharts";
// import Buttons from "../components/Buttons";

const Stock = () => {
  const [series, setSeries] = useState([
    {
      data: [],
    },
  ]);
  const { stockId } = useParams();
  const [stock, setStock] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [hour, setHour] = useState([])
  const [day, setDay] = useState([])
  const [week, setWeek] = useState([])
  const [timeRange, setTimeRange] = useState(null);



  const getStockInfo = async () => {
    const apiKey = process.env.REACT_APP_API;
    const URL = `https://api.stockdata.org/v1/data/quote?symbols=${stockId}&api_token=${apiKey}`;
    fetch(URL)
      .then((response) => response.json())
      .then((result) => {
        setStockInfo(result.data[0]);
      });
  };

  const getStocks = async () => {
    try {
      const apiKey = process.env.REACT_APP_API;
      const URL = `https://api.stockdata.org/v1/data/intraday?symbols=${stockId}&api_token=${apiKey}`;
      const response = await fetch(URL);
      const data = await response.json();
      setStock(data.data[0]);

      // week = a weeks worth of data
      setWeek(data.data);

      // defining hour as empty array to push first 100 timestamps into to get smaller range of times on x axis
      let hour = [];
      for (let i = 0; i < 50; i++) {
        hour.push(week[i]);
      }
      setHour(hour)

      // another time range option
      let day = [];
      for (let i = 0; i < 380; i++) {
        day.push(week[i]);
      }
      setDay(day)
      setTimeRange(hour)
      console.log(hour)
      console.log(timeRange)
      const price = timeRange.map((time, idx) => ({
        x: new Date(time.date),
        y: [
          week[idx].data.open,
          week[idx].data.high,
          week[idx].data.low,
          week[idx].data.close,
        ],
      }));
      setSeries([
        {
          data: price,
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStocks();
    getStockInfo();
  }, [stockId]);

  // chart data
  const chart = {
    series: [
      {
        data: [],
      },
    ],
    options: {
      chart: {
        type: "candlestick",
        height: 350,
      },
      title: {
        text: "CandleStick Chart",
        align: "left",
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
    },
  };

  // function for error message if stock is undefined
  function invalidTicker() {
    return (
      <div className="error">
        <h3>ERROR: INVALID STOCK TICKER ENTERED</h3>
      </div>
    );
  }

  // replacing letters in data with
  // empty string so date is more readable
  function changeDate() {
    const dateString = stock.date;
    const newDate = dateString.replace("T", " | ");
    const finalDate = newDate.replace(".000Z", "");
    return <h1>{finalDate}</h1>;
  }
  function laodingDate() {
    return <h1>Loading date...</h1>;
  }

  const loaded = () => {
    return (
      <>
        <Nav />
        <div className="stock-page">
          <div className="stock-info">
            <div className="stock-title">
                <h1>
                  {stock.ticker} {stockInfo.name}{" "}
                </h1>
              <div className="stock-price-change">
                <div className={[ "currentPrice", stockInfo.price > stockInfo.day_open ? "gains" : stockInfo.day_open > stockInfo.price ? "losses" : "", ].join(" ")}>
                <h2>${stockInfo.price}</h2>
                </div>
                <div className={["dayChange", stockInfo.day_change > 0 ? "gains" : stockInfo.day_change < 0 ? "losses" : ""].join(" ")}>
                  <h2>({stockInfo.day_change}%)</h2>
              </div>
              </div>
            </div>
            {stock.date ? changeDate() : laodingDate()}
            <p>Market Cap: ${stockInfo.market_cap}</p>
            <div className="OHLC">
              <p>Open: ${stockInfo.day_open}</p>
              <p>High: ${stockInfo.day_high}</p>
              <p>Low: ${stockInfo.day_low}</p>
              <p>Close: ${stock.data.close}</p>
            </div>
            <div className="chart">
              <Chart
                options={chart.options}
                series={series}
                type="candlestick"
                width="100%"
                height={320}
              />
            </div>
            {/* <Buttons hour={hour} day={day} week={week}/> */}
            <div className="buttons">
              <button onClick={setTimeRange(hour)}>HR</button>
              <button onClick={setTimeRange(day)}>D</button>
              <button onClick={setTimeRange(week)}>WK</button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const loading = () => {
    return (
      <>
        <Nav />
        <div className="fetching">
          {stock === undefined ? invalidTicker() :  <div className="spinner"></div>}
        </div>
      </>
    );
  };

  return stock ? loaded() : loading();
};

export default Stock;
