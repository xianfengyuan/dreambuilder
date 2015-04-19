var React = require('react'),
    TabPane = require('react-bootstrap/lib/TabPane'),
    TabbedArea = require('react-bootstrap/lib/TabbedArea');

var Page = React.createClass({
  render: function() {
    return (
      <TabbedArea defaultActiveKey={2}>
        <TabPane eventKey={1} tab='Tab 1'>TabPane 1 content</TabPane>
        <TabPane eventKey={2} tab='Tab 2'>TabPane 2 content</TabPane>
      </TabbedArea>
    );
  }
});

// Export the TweetsApp component
module.exports = Story = React.createClass({
  render: function() {

    return (
      <div className='story-app' ref='storyApp'>
        <Page />
      </div>
    )

  }

});
