var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var itemsStore = process.env.MONGO_CONNECTION_URL ? new MongoStore(process.env.MONGO_CONNECTION_URL) :
      process.env.REDIS_CONNECTION_URL ? new RedisStore(process.env.REDIS_CONNECTION_URL, process.env.REDIS_CONNECTION_PORT) :
      new InMemoryStore();

function RedisStore(connectionUrl, connectionPort) {
  var store = this;
  var redis = require('redis');
  client = redis.createClient(connectionPort, connectionUrl, {});

  store.getItems = function (callback) {
    client.hgetall("items", function(error, replies) {
      callback(error ? error : replies)
    }
  }
  store.add = function (item, callback) {
    var id = Math.random().toString(36).substring(7);
    client.hset("items", id, item, redis.print);
  }
}

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
      console.log(error ? error : data);
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
    callback(item);
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
