const express = require('express');
const app = express();

const PORT = 7777;

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.send(':) You shouldn\'t be seeing this');
});


app.listen(PORT,() => console.log('VAMO QUE VAMO!'));
