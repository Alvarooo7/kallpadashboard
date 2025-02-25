import './App.css';
import Dashboard from "./Dashboard";
import MenuBar from './MenuBar';
import Principal from './Principal';
import TransactionsDashboard from './Transaction';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
          <MenuBar />
          <Routes>
              <Route path="/principal" element={<Principal />} />
              <Route path="/transactions-report" element={<TransactionsDashboard />} />
              <Route path="/balance-report" element={<Dashboard />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;