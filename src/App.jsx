import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import './styles/global.css';
import './styles/components.css';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
