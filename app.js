import express from "express";
import fetch from "cross-fetch";
const app = express();
const PORT = 3000 || process.env.PORT;
app.use(express.json());

const cashDelivery = [
  400001, 400002, 400003, 400004, 400005, 400006, 400007, 400008, 400009,
  400010, 400011, 400012, 400013, 400014, 400015, 400016, 400017, 400018,
  400019, 400020, 400021, 400022, 400024, 400025, 400026, 400027, 400028,
  400029, 400030, 400031, 400032, 400033, 400034, 400035, 400037, 400043,
  400049, 400050, 400051, 400052, 400053, 400054, 400055, 400056, 400057,
  400058, 400059, 400063, 400066, 400067, 400069, 400070, 400071, 400074,
  400075, 400077, 400080, 400084, 400085, 400086, 400088, 400089, 400093,
  400094, 400098, 400099, 400101, 400102, 400104,
];
const mainDelivery = [
  400001, 400002, 400003, 400004, 400005, 400006, 400007, 400008, 400009,
  400010, 400011, 400012, 400013, 400014, 400015, 400016, 400017, 400018,
  400019, 400020, 400021, 400022, 400024, 400025, 400026, 400027, 400028,
  400029, 400030, 400031, 400032, 400033, 400034, 400035, 400037, 400043,
  400049, 400050, 400051, 400052, 400053, 400054, 400055, 400056, 400057,
  400058, 400059, 400063, 400066, 400067, 400069, 400070, 400071, 400074,
  400075, 400077, 400080, 400084, 400085, 400086, 400088, 400089, 400093,
  400094, 400098, 400099, 400101, 400102, 400104,
];

app.post("/profile-handler", (req, res) => {
  var isSell = false;
  var isCash = false;
  if (mainDelivery.includes(parseInt(req.pin))) {
    isSell = true;
  }
  if (cashDelivery.includes(parseInt(req.pin))) {
    isCash = true;
  }
  var req_body = JSON.stringify({
    op: "upsert",
    find: {
      uid: req.body.uid,
    },
    update: {
      $set: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        line1: req.body.line1,
        line2: req.body.line2,
        line3: req.body.line3,
        pin: req.body.pin,
        uid: req.body.uid,
        is_sell: isSell,
        is_cash: isCash,
      },
    },
  });
  fetch(
    "https://tradebooksapp.com/v1/api/tradebooks/crud/postgres/users/update",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + req.body.token,
        "Content-Type": "application/json",
      },
      body: req_body,
    }
  )
    .then((r) => {
      if (r.status == 200) {
        return res.send(
          JSON.stringify({
            status: "success",
            message: "Profile Updated Successfully",
          })
        );
      } else {
        return res.json(
          JSON.stringify({
            status: "error",
            message: `An error occurred ${r.status}`,
          })
        );
      }
    })
    .catch((e) => {
      return res.send(
        JSON.stringify({
          status: "error",
          message: `An error occurred ${e.toString()}`,
        })
      );
    });
});

app.get("/", (req, res) => {
  return res.send("All up and running");
});

app.post("/add-game-quote", async (req, res) => {
  var body = req.body;
  var gameId = body.game_id;
  var userId = body.user_id;
  var price = body.price;
  var quantity = body.quantity;
  var method = body.method;
  var token = body.token;
  fetch(
    "https://tradebooksapp.com/v1/api/tradebooks/crud/postgres/users/read",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + req.body.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ op: "one", find: { uid: userId } }),
    }
  ).then(async function (r) {
    if(r.status!=200){
      throw r.status.toString();
    }
    var detailBody = await r.json();
    if (method == "sell" && detailBody.result.is_sell == false) {
      return res.send(
        JSON.stringify({
          status: "error",
          message: "Selling not supported from your location yet",
        })
      );
    } else {
      var addQuoteBody = JSON.stringify({
        op: "one",
        doc: {
          game_id: gameId,
          user_id: userId,
          price: price,
          quantity: quantity,
          name: detailBody.result.name,
          method: detailBody.result.method,
          line1: detailBody.result.line1,
          line2: detailBody.result.line2,
          line3: detailBody.result.line3,
          pin: detailBody.result.pin,
          phone: detailBody.result.phone,
          is_cash: detailBody.result.is_cash,
          is_sell: detailBody.result.is_sell,
          email: detailBody.result.email,
        },
      });
      var quoteResponse=await fetch("https://tradebooksapp.com/v1/api/tradebooks/crud/postgres/game_quotes/create",{
        method: "POST",
        headers: {
          Authorization: "Bearer " + req.body.token,
          "Content-Type": "application/json",
        },
        body: addQuoteBody
      })
      if(quoteResponse.status!=200){
        throw "Error in adding quote"
      }else{
        return res.send(
          JSON.stringify({
            status:"success",
            message:"Successfully added quote"
          })
        )
      }
    }
  }).catch(e=>{
    return res.send(
      JSON.stringify(
        {
          status:"error",
          message:`An error occurred ${e.toString()}`
        }
      )
    )
  });
});

app.post("/handle-book-quote", (req, res) => {
  return res.json({ status: "Received the event" });
});

app.post("/handle-game-quote", (req, res) => {
  return res.json({ status: "Received the event" });
});

app.listen(PORT, (e) => {
  if (e) {
    console.log(e);
  } else {
    console.log(`App running on port ${PORT}`);
  }
});
