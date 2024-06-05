// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  container.id = 'root';
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  document.body.removeChild(container);
  container = null;
});

test('renders without crashing', () => {
  render(<App />);
});