var React = require('react');
var Story = require('../components/Story.rc');

// Render the components, picking up where react left off on the server
React.render(
  <Story/>,
  document.getElementById('story')
);
