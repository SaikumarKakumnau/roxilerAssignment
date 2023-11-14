const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'ProductTransaction.db');
let db = null

const initializeDbAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        app.listen(3001, () => {
            console.log('server running at http://localhost:3001');
        });
        createTable();
    }

    catch (e) {
        console.log(`Db Error: ${e.message}`);
        process.exit(1);
    }
}

initializeDbAndServer();

const createTable = async () => {
    const createQuery = `
    CREATE TABLE IF NOT EXISTS ProductData(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        price REAL,
        description TEXT,
        category TEXT,
        image TEXT,
        sold BOOLEAN,
        dateOfSale DATETIME
    );`;

    await db.run(createQuery);
};

app.get('/initialize-database', async (req, res) => {
    const url = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
    const response = await axios.get(url);
    const transactionData = await response.data;
    for (const productData of transactionData) {
        const insertQuery = `INSERT OR IGNORE INTO ProductData(id,title,price,description,category,image,sold,dateOfSale)
        VALUES(?,?,?,?,?,?,?,?);`;

        await db.run(insertQuery, [
            productData.id,
            productData.title,
            productData.price,
            productData.description,
            productData.category,
            productData.image,
            productData.sold,
            productData.dateOfSale,
        ]);
    }

    res.send({ msg: 'Initialize database successfuly' })
});

app.get('/transactions', async (req, res) => {
    const { month = "", s_query = "", limit = 10, offset = 0 } = req.query;
    const searchQuery = `
    SELECT * FROM ProductData
    WHERE
    (title LIKE ? OR description LIKE ? OR price LIKE ?)
    AND strftime('%m', dateOfSale) LIKE ?
    LIMIT ? OFFSET ?;`;

    const params = [
        `%${s_query}`,
        `%${s_query}`,
        `%${s_query}`,
        `%${month}`,
        limit,
        offset,
    ];

    const totalItemQuery = `SELECT COUNT(id) AS total
    FROM ProductData
    WHERE
    (title LIKE ? OR description LIKE ? OR price LIKE ?)
    AND strftime('%m', dateOfSale) LIKE ?;`;

    const totalparams = [
        `%${s_query}`,
        `%${s_query}`,
        `%${s_query}`,
        `%${month}`,
    ];

    const data = await db.all(searchQuery, params);
    const total = await db.get(totalItemQuery, totalparams);
    res.json({ transactionsData: data, total })
});

app.get('/statistics', async (req, res) => {
    const { month = "" } = req.query;
    const totalAmount = await db.get(
        `SELECT SUM(price) as total FROM ProductData WHERE strftime('%m', dateOfSale) LIKE '%${month}';`
    )

    const soldItems = await db.get(
        `SELECT COUNT(id) as sold FROM ProductData WHERE strftime('%m', dateOfSale) LIKE '%${month}' AND sold=1;`
    )

    const notSoldItems = await db.get(
        `SELECT COUNT(id) as notSold FROM ProductData WHERE strftime('%m', dateOfSale) LIKE '%${month}' AND sold=0;`
    )

    res.json({ totalAmount, soldItems, notSoldItems })

});

app.get('/bar-chart', async (req, res) => {
    const { month = '' } = req.query;
    const priceRange = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: 10000 },
    ];

    const barChartData = [];

    for (const range of priceRange) {
        const data = await db.get(
            `SELECT COUNT(id) as count FROM ProductData
            WHERE strftime('%m', dateOfSale) LIKE '%${month}%' AND price  >= ${range.min} AND price <=${range.max}; `
        );

        barChartData.push({
            range: `${range.min} - ${range.max}`,
            count: data.count,
        });
    }

    res.json({ barChartData });
});

app.get('/pie-chart', async (req, res) => {
    const { month = '' } = req.query;
    const piechartData = await db.all(
        `SELECT category, COUNT(id) as count FROM ProductData
        WHERE strftime('%m', dateOfSale) Like '%${month}'
        GROUP BY category;`
    );

    res.json({ piechartData })
});


app.get("/combined-response", async (req, res) => {
    const { month = "", s_query = "", limit = 10, offset = 0 } = req.query;

    const initializeDatabase = await axios.get(
        `https://roxiler-systems-assignment.onrender.com/initialize-database`
    );
    const initializeResponse = await initializeDatabase.data;
    const TransactionsData = await axios.get(
        `https://roxiler-systems-assignment.onrender.com/transactions?month=${month}&s_query=${s_query}&limit=${limit}&offset=${offset}`
    );
    const TransactionsResponse = await TransactionsData.data;
    const statisticsData = await axios.get(
        `https://roxiler-systems-assignment.onrender.com/statistics?month=${month}`
    );
    const statisticsResponse = await statisticsData.data;
    const barChartResponse = await axios.get(
        `https://roxiler-systems-assignment.onrender.com/bar-chart?month=${month}`
    );
    const barChartData = await barChartResponse.data;
    const pieChartResponse = await axios.get(
        `https://roxiler-systems-assignment.onrender.com/pie-chart?month=${month}`
    );
    const pieChartData = await pieChartResponse.data;

    const combinedResponse = {
        initialize: initializeResponse,
        listTransactions: TransactionsResponse,
        statistics: statisticsResponse,
        barChart: barChartData,
        pieChart: pieChartData,
    };

    res.json(combinedResponse);
});
