import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GenericTable from '../components/GenericTable';
import useAuth from '../hooks/useAuth';

const ReportsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('aggregate');
  const [results, setResults] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [resultMsg, setResultMsg] = useState('');
  const [error, setError] = useState('');

  // Inputs State
  const [inputs, setInputs] = useState({});

  // Redirect if not Admin
  if (user?.role !== 'Admin') {
    return <div className="page-container"><h3>Access Denied. Admin Privileges Required.</h3></div>;
  }

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const resetDisplay = () => {
    setResults([]); setTableData([]); setResultMsg(''); setError('');
  };

  // --- HANDLERS ---

  // 1. Aggregations & Queries
  const runQuery = async (endpoint, payload) => {
    resetDisplay();
    try {
      const res = await api.post(endpoint, payload);
      setResults(res.data);
    } catch (err) { setError('Query Failed'); }
  };

  // 2. Functions (Single Value)
  const runFunction = async (endpoint, payload) => {
    resetDisplay();
    try {
      const res = await api.post(endpoint, payload);
      setResultMsg(`Result: ${res.data.result}`);
    } catch (err) { setError(err.response?.data?.error || 'Function Failed'); }
  };

  // 3. Procedures (Table or Message)
  const runProcedure = async (endpoint, payload) => {
    resetDisplay();
    try {
      const res = await api.post(endpoint, payload);
      if (res.data.message) setResultMsg(res.data.message);
      else setTableData(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setError(err.response?.data?.error || 'Procedure Failed'); }
  };

  // 4. Logs
  const fetchLogs = async (endpoint) => {
    resetDisplay();
    try { const res = await api.get(endpoint); setTableData(res.data); } catch (err) { setError('Logs Failed'); }
  };

  return (
    <div className="page-container">
      <h1>Admin Reports & Database Operations</h1>

      {/* TABS */}
      <div className="tabs" style={{borderBottom: '1px solid #ccc', marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '10px'}}>
        <button className={`btn ${activeTab==='aggregate'?'btn-primary':'btn-secondary'}`} onClick={()=>{setActiveTab('aggregate'); resetDisplay()}}>1. Aggregations</button>
        <button className={`btn ${activeTab==='join'?'btn-primary':'btn-secondary'}`} style={{marginLeft:'5px'}} onClick={()=>{setActiveTab('join'); resetDisplay()}}>2. Search (Join)</button>
        <button className={`btn ${activeTab==='nested'?'btn-primary':'btn-secondary'}`} style={{marginLeft:'5px'}} onClick={()=>{setActiveTab('nested'); resetDisplay()}}>3. Nested Query</button>
        <button className={`btn ${activeTab==='functions'?'btn-primary':'btn-secondary'}`} style={{marginLeft:'5px'}} onClick={()=>{setActiveTab('functions'); resetDisplay()}}>4. SQL Functions</button>
        <button className={`btn ${activeTab==='procedures'?'btn-primary':'btn-secondary'}`} style={{marginLeft:'5px'}} onClick={()=>{setActiveTab('procedures'); resetDisplay()}}>5. Procedures</button>
        <button className={`btn ${activeTab==='logs'?'btn-primary':'btn-secondary'}`} style={{marginLeft:'5px'}} onClick={()=>{setActiveTab('logs'); resetDisplay()}}>6. Trigger Logs</button>
      </div>

      {/* FEEDBACK AREA */}
      {error && <p className="form-message error">{error}</p>}
      {resultMsg && <div className="alert-box success" style={{padding:'15px', background:'#d4edda', marginBottom:'20px'}}><strong>{resultMsg}</strong></div>}

      {/* --- TAB CONTENT --- */}

      {activeTab === 'aggregate' && (
        <div style={{display:'flex', gap:'20px', flexWrap:'wrap'}}>
          <div className="card" style={{flex:1, minWidth:'300px'}}>
            <h4>Revenue by Status</h4>
            <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
              <input name="status" className="form-input" placeholder="e.g. Completed" onChange={handleInputChange} />
              <button className="btn btn-primary" onClick={() => runQuery('/reports/agg-sales-by-status', { status: inputs.status })}>Run</button>
            </div>
          </div>
          <div className="card" style={{flex:1, minWidth:'300px'}}>
            <h4>Avg Price by Category</h4>
            <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
              <input name="category" className="form-input" placeholder="e.g. Smartphone" onChange={handleInputChange} />
              <button className="btn btn-primary" onClick={() => runQuery('/reports/agg-avg-price-category', { category: inputs.category })}>Run</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'join' && (
        <div className="card">
          <h4>Find Orders by Customer City (Join)</h4>
          <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
            <input name="city" className="form-input" placeholder="e.g. Mumbai" onChange={handleInputChange} />
            <button className="btn btn-primary" onClick={() => runQuery('/reports/complex-search', { city: inputs.city })}>Search</button>
          </div>
        </div>
      )}

      {activeTab === 'nested' && (
        <div className="card">
          <h4>High Value Suppliers (Nested)</h4>
          <p>Find suppliers selling products costing more than:</p>
          <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
            <input name="min_price" type="number" className="form-input" placeholder="e.g. 50000" onChange={handleInputChange} />
            <button className="btn btn-primary" onClick={() => runQuery('/reports/nested', { min_price: inputs.min_price })}>Query</button>
          </div>
        </div>
      )}

      {activeTab === 'functions' && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'20px'}}>
          <div className="card">
            <h4>Utilization %</h4>
            <input name="w_id" className="form-input" placeholder="Warehouse ID" onChange={handleInputChange} />
            <button className="btn btn-primary" style={{marginTop:'10px'}} onClick={() => runFunction('/functions/utilization', { warehouse_id: inputs.w_id })}>Calculate</button>
          </div>
          <div className="card">
            <h4>Order Tax (18%)</h4>
            <input name="amount" type="number" className="form-input" placeholder="Amount" onChange={handleInputChange} />
            <button className="btn btn-primary" style={{marginTop:'10px'}} onClick={() => runFunction('/functions/tax', { amount: inputs.amount })}>Calculate</button>
          </div>
          <div className="card">
            <h4>Product Availability</h4>
            <input name="p_id" className="form-input" placeholder="Product ID" onChange={handleInputChange} />
            <button className="btn btn-primary" style={{marginTop:'10px'}} onClick={() => runFunction('/functions/product-availability', { product_id: inputs.p_id })}>Check</button>
          </div>
        </div>
      )}

      {activeTab === 'procedures' && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'20px'}}>
          <div className="card">
            <h4>Low Stock Products (SP)</h4>
            <input name="threshold" type="number" className="form-input" placeholder="Threshold (e.g. 5000)" onChange={handleInputChange} />
            <button className="btn btn-primary" style={{marginTop:'10px'}} onClick={() => runProcedure('/procedures/low-stock', { threshold: inputs.threshold })}>View List</button>
          </div>
          <div className="card" style={{borderColor: '#ffc107'}}>
            <h4>Add Stock to Warehouse (SP)</h4>
            <div style={{display:'flex', gap:'10px'}}>
               <input name="wh_id_add" className="form-input" placeholder="Wh ID" onChange={handleInputChange} />
               <input name="stock_add" type="number" className="form-input" placeholder="Amount" onChange={handleInputChange} />
            </div>
            <button className="btn btn-warning" style={{marginTop:'10px'}} onClick={() => runProcedure('/procedures/add-stock', { warehouse_id: inputs.wh_id_add, amount: inputs.stock_add })}>Execute</button>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{display:'flex', gap:'10px'}}>
          <button className="btn btn-secondary" onClick={() => fetchLogs('/logs/price')}>Product Price Logs</button>
          <button className="btn btn-secondary" onClick={() => fetchLogs('/logs/shipment')}>Shipment Status Logs</button>
        </div>
      )}

      {/* RESULTS TABLE */}
      <div style={{marginTop: '20px'}}>
        {(results.length > 0 || tableData.length > 0) && (
          <GenericTable data={results.length > 0 ? results : tableData} />
        )}
      </div>

    </div>
  );
};

export default ReportsPage;