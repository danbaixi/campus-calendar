import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from '../../src'
import calendarConfig from './calendar-config.json'
import calendarData from './calendar-data.json'

const App = () => {
    return <Calendar config={calendarConfig} data={calendarData} />
}
ReactDOM.render(
    <App />,
    document.getElementById('root')
);