module.exports = {
  index: function(req, res) {
    res.render('shareyourstory', {
      layout: 'shareyourstory'
    });
  },
  events: function(req, res) {
    res.render('events', {
      layout: 'events'
    });
  },
  donate: function(req, res) {
    res.render('donate', {
      layout: 'donate'
    });
  },
  welcome: function(req, res) {
    res.render('welcome', {
      layout: 'welcome'
    });
  },
  physics: function(req, res) {
    res.json({message: 'dreambuilder is ready.'});
  }
}
