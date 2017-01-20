var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var itemsStore = process.env.MONGO_CONNECTION_URL ?
      new MongoStore(process.env.MONGO_CONNECTION_URL) : new InMemoryStore();

function MongoStore(connectionUrl) {
  var store = this;
  var mongoose = require('mongoose');
  mongoose.connect(connectionUrl);

  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectID;

  var Item = new Schema({
    name: {type: String, required: true, trim: true},
    description: {type: String, required: true, trim: true}
  });

  var ProductCatalog = mongoose.model('Item', Item);
  store.getItems = function (callback) {
    ProductCatalog.find().lean().exec(function(error, data){
      callback(error ? error : data);
    });
  }

  store.add = function (item, callback) {
    new ProductCatalog(item).save(function(error, data){
      callback(error ? error : data);
    });
  }
}

function InMemoryStore() {
  var store = this;
  var items = [{name: "test1", description: "test1 description"}];

  store.getItems = function (callback) {
    callback(items);
  }
  store.add = function (item, callback) {
    items.push(item);
    callback(items);
  }
}

app.get('/get-items', function (req, res) {
  itemsStore.getItems(function (result) {
    res.json(result);
  });
})


app.post('/add-item', function(req, res){
  itemsStore.add(req.body, function (result) {
    res.json(result);
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
