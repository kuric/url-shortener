const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const urlsSchema = new Schema({
  longUrl:  String,
  shortUrl: Number
});
const Url = mongoose.model('urls', urlsSchema);

exports.createNew = function(urlToAdd, done) {
  
  // check if collection is empty
  isCollEmpty(function(err, response) {
    if (err) return done(err);
    if (response) {
      // if empty, save new url document with shortUrl of 1
      const url = new Url({ longUrl: urlToAdd, shortUrl: 1 });
      url.save(function(err, data) {
        if (err) {          
          return done(err, null);
        } else {          
          return done(null, data.shortUrl);
        }
      });
    } else if (!response) {
      // if not empty, see if longUrl already exists in collection
      isUrlInDB(urlToAdd, function(err, response){
        if (err) return done(err);
        if (response) {
          // if it exists, return it without saving anything new        
          return done(null, response);
        } else {          
          // if not, find largest shortUrl, save new with +1 shorturl
          findLargestUrl(function(err, response) {
            const short = response + 1;
            const url = new Url({ longUrl: urlToAdd, shortUrl: short });
            url.save(function(err, data) {
              if (err) {
                return done(err, null);
              } else {
                return done(null, data.shortUrl);
              }
            });
          });
        }
      });
    }
  });
  
  // Check if collection is empty
  function isCollEmpty(done) {
    Url.count(function (err, count) {
      if (!err && count === 0) { 
        // is empty, return true
        return done(null, true);
      } else if (err) {
        // error, return error and null
        return done(err, null);
      } else {
        return done(null, false);
      }   
    });
  }
  
  // Check if url is already in collection
  function isUrlInDB(url, done) {
    Url.findOne({ longUrl: url}, function(err, data) {
      if (err) return done(err);
      if (data) {
        // url was already in database
        // get it, and return shorturl    
        return done(null, data.shortUrl);
      } else {
        // url was not in database, return null
        return done(null, null);
      }
    });
  }
  
  // Find shorturl of latest entry in collection
  function findLargestUrl(callback) {
    Url.find().sort({ shortUrl:-1 }).limit(1)
      .exec(function(err, data) {
      if (err) return callback(err, null); 
      return callback(null, data[0].shortUrl);
    });
  };
  
} // end createNew();
exports.findAll = function(req, res) {
  Url.find().lean().exec(function(err, data) {
    if(err) {
        res.render('error');
    }
    if(data) {
      if(Array.isArray(data)) {
        let jsonObj = {};
        data.forEach( el => jsonObj[el.shortUrl] = el.longUrl);
        res.json(jsonObj);
      } else {
        res.json(data);
      }
    } else {
        res.render('error');
    }
  })
};
exports.getLongUrl = function(shortUrl, callback) {
  Url.findOne({ shortUrl: shortUrl}, function(err, data) {
    if(data) {
      return callback(null, data.longUrl);
    } else {
      return callback(err, null);
    }
  });
}
