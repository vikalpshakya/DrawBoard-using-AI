import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

import Home from '@/screens/home';

import '@/index.css';

const paths = [
    {
        path: '/',
        element: (
          <Home/>
        ),
    },
];

const BrowserRouter = createBrowserRouter(paths);

const App = () => {
    return (
    <MantineProvider> // Wraps the app, provides global theme, styles, and context.
      <RouterProvider router={BrowserRouter}/>  // Injects React Router into your component tree, enabling navigation. It looks at the current URL and renders the correct route.
    </MantineProvider>
    )
};

export default App;
