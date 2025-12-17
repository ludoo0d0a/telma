
require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use('/v1', async (req, res) => {
  try {
    const url = `https://api.sncf.com/v1${req.path}`;
    const headers = {
        'Authorization': process.env.SNCF_API_KEY,
    };

    const response = await axios({
      method: req.method,
      url,
      params: req.query,
      data: req.body,
      headers,
      responseType: 'stream'
    });

    res.status(response.status);
    response.data.pipe(res);

  } catch (error) {
    if (error.response) {
        error.response.data.pipe(res.status(error.response.status));
    } else {
      res.status(500).send('Proxy error');
    }
  }
});

app.listen(port, () => {
  console.log(`Proxy server is running on http://localhost:${port}`);
});
