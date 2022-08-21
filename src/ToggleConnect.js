import React from 'react'
import { useROS } from 'react-ros'

function ToggleConnect() {
  const { isConnected, topics, url, changeUrl, toggleConnection } = useROS();
  return (
    <div>
      <p>
        {/* <b>Simple connect:  </b><button onClick={ toggleConnection }>Toggle Connect</button>  <br /> */}
        {/* Below should be set by admin, not user */}
        {/* <b>ROS url input:  </b><input name="urlInput" defaultValue={ url } onChange={event => changeUrl(event.target.value)} />  <br />  */}
        {/* <b>ROS url to connect to:  </b> {url}  <br /> */}
        <b>Status of ROS:</b> { isConnected ? "connected" : "not connected" }   <br />
        {/* Send command as a message */}
        <b>Topics detected:</b><br />
        { topics.map((topic, i) => <li key={i}>    {topic.path}</li> )}
      </p>
    </div>
  );
}
export default ToggleConnect;