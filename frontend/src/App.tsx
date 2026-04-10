import { Routes, Route } from 'react-router-dom';
import CustomerPage from './pages/Customer/index'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerPage />} />
    </Routes>
  );
}

export default App;