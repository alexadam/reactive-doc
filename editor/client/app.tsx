import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Editor from './editor';
import './app.scss'

ReactDOM.render(
    <Editor  />,
    document.getElementById('app') as HTMLElement
  );