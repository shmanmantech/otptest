const express = require('express');
const app = express ();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("I'm listening in port:", PORT);
});

app.get("/checkstatus", (req, res) => {
   const status = {
      "Status": "Alive1"
   };
   
   res.send(status);
});
