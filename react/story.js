var JSX = require('node-jsx').install(),
    config = require('../config'),
    React = require('react'),
    Story = require('../components/Story.rc');

module.exports = {
  index: function(req, res) {
    var markup = '<Story>';

    res.render('storybody', {
      markup: markup, // Pass rendered react markup
      layout: 'story'
    });
  },
  physics: function(req, res) {
    res.json({message: 'dreambuilder is ready.'});
  }
}
