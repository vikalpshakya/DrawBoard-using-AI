import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Landing from '@/screens/landing';
import Home from '@/screens/home';
import '@/index.css';

const router = createBrowserRouter([
    { path: '/', element: <Landing /> },
    { path: '/draw', element: <Home /> },
]);

export default function App() {
    return (
        <MantineProvider>
            <RouterProvider router={router} />
        </MantineProvider>
    );
}
