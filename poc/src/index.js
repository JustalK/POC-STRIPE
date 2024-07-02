import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Experience0001 from './experiences/Experience_0001';
import Experience0002 from './experiences/Experience_0002';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Experience0001 />,
  },
  {
    path: "/0002",
    element: <Experience0002 />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
