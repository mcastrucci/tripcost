const express = require ("express");
const { ObjectID } = require("mongodb");
const app = express();

const mongo = require("mongodb").MongoClient;
const url = 'mongodb://localhost:27017'
let db, trips, expenses

app.use(express.json()) //we add this middleware to accept json on request

app.post('/trip', (req, res) => {
    const name = req.body.name
    trips.insertOne({ name: name }, (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).json({ err: err })
        return
      }
      console.log(result)
      res.status(200).json({ ok: true })
    })
  })

app.get('/trips', (req, res) => {
    trips.find().toArray((err, items) => {
        if(err){
            console.log("something happend while getting items from collection -", "\n", err);
            res.status(500).json({err: err});
            return;
        }
        console.log("requested trips from db", '\n', items);
        res.status(200).json({trips: items});
    })
})


app.post('/expense', (req, res) => {
    let { trip, date, amount, category, description } = req.body;

    console.log("requested to add an expense", 
    `
        trip: ${trip} 
        date: ${date} 
        amount: ${amount} 
        category:${category} 
        description: ${description}`);

    if(!trip || !date || !amount || !category || !description){
        res.status(400).json({err: "bad request, parameters missing"});
        console.log("received a bad request, paramaters missing");
        return;
    }

    //we should first check if the id of the trip does exist.
    trips.find({"_id": ObjectID(trip)}).toArray((err, result) =>{
        if (err || !result || result.length === 0){
            console.log("trip id does not exist", "\n", err);
            if(err)
                res.status(400).json({err: err});
            else
                res.status(400).json({err: "ivalid ID"});
            return;
        }
        //if everything is ok, we insert the record into the trip

        expenses.insertOne(
            {
              trip: trip,
              date: date,
              amount: amount,
              category: category,
              description: description
            },
            (err, result) => {
              if (err) {
                console.error("something went wrong while adding a new expense", "\n", err)
                res.status(500).json({ err: err })
                return
              }
              res.status(200).json({ ok: true })
            }
            )
    })
})


app.get('/expenses', (req, res) => {
    let { trip } = req.body;

    if (!trip){ //if there is no id, we do not continue
        res.status(400).json({err: "you need to provide a trip id"});
        return;
    } 
    expenses.find({trip: req.body.trip}).toArray((err, items) => {
        if (err) {
            console.error(err);
            res.status(500).json({ err: err });
            return;
        }
        res.status(200).json({ trips: items });
    })
})



mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) {
      console.error(err)
      return
    }
    console.log("mongo is now connected");
    db = client.db('tripcost')
    trips = db.collection('trips')
    expenses = db.collection('expenses')
  }
)

app.listen(3000, ()=> console.log("server running"));