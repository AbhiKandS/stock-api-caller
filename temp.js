const API_KEY = 'KAZ6EYR0AKLZA8SM';
const API_TYPE = 'TIME_SERIES_DAILY';
const stockNames = {
    'reliance': 'RELIANCE.BSE',
    'tcs': 'TCS.BSE',
    'hdfc': 'HDFCBANK.BSE',
    'icici': 'ICICIBANK.BSE',
    'infosys': 'INFY.BSE',
}

class Stock {
    name ;
    displayName ;
    close ;
    percent ;
    high ;
    low ;
    API_SYMBOL ;
    API_URL;

    constructor(name, symbol) {
        this.API_SYMBOL = symbol;
        this.API_URL = `https://www.alphavantage.co/query?function=${API_TYPE}&symbol=${this.API_SYMBOL}&apikey=${API_KEY}`;

        try{
        this.name = document.querySelector(`.${name}`);
        if(!this.name) throw new Error("Element Not found");

        this.displayName = this.name.querySelector(`td:nth-of-type(1)`);
        this.close = this.name.querySelector(`td:nth-of-type(2)`);
        this.percent = this.name.querySelector(`td:nth-of-type(3)`);
        this.high = this.name.querySelector(`td:nth-of-type(4)`);
        this.low = this.name.querySelector(`td:nth-of-type(5)`);
        } catch(e) {
            console.error(e);
        }
    }
    setStockInfo(data) {
        if (parseFloat(data['5. percent']) < 0) {
            this.name.querySelectorAll('tr td.green').forEach((element) =>{
                element.className = 'red';
            })
        };
    
        this.close.innerHTML = data['4. close'];
        this.percent.innerHTML = data['5. percent'];
        this.high.innerHTML = data['2. high'];
        this.low.innerHTML = data['3. low'];
    }
}
class Stocks {
    #data;
    #numberOfStocks = 0;
    #stocks = {};
    constructor(list) {
        for (const company in list) {
            let symbol = list[company];
            this.#stocks[company] = new Stock(company, symbol);
        }
        this.#numberOfStocks = Object.keys(this.#stocks).length;
    }

    getStocks() {
        return this.#stocks;
    }
    getNumber() {return this.#numberOfStocks;}
}

let topTenStocks = new Stocks(stockNames);

async function fetchStockData(url) {
    try{
        const requestInfo = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }
        const response = await fetch(url, requestInfo);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        console.log(data);
        return data;
         
    } catch(e) { 
        console.error(e.message);
        return null;
    }
}

function cleanData(data) {
    let newdata = {};
    let today;
    data = data['Time Series (Daily)'];
    let count = 0;
    for (const date in data) {
        if (count === 0) {
            newdata = data[date]
            today = date;
            delete newdata['1. open'];
            delete newdata['5. volume'];
            newdata['1. data'] = today;
        }
        else if (count === 1) {
            let y = data[date]['4. close'];
            let t = newdata['4. close'];
            let percent = (t-y)*100/y;
            percent = percent.toFixed(4);
            newdata['5. percent'] = percent;
            break;
        }
        count++;
    }
    for (const price in newdata) {
        newdata[price] = parseFloat(newdata[price]).toFixed(2);
    }
    return newdata;
}

async function getAllData() {
    for (const company in topTenStocks.getStocks()) {
        let data = {};
        CompanyStock = topTenStocks.getStocks()[company];
        try {
        if (localStorage.getItem(company)) {
            data = JSON.parse(localStorage.getItem(company));
            if (!data) throw new Error("no Data");
        }
        else{
            data = await fetchStockData(CompanyStock.API_URL);
            if (!data) throw new Error("no Data");
            data = cleanData(data);
        }
            CompanyStock.setStockInfo(data);
            console.log(data);
            localStorage.setItem(company, JSON.stringify(data));
        } catch(e) {
            console.error(e);
        }
    }
}
getAllData();