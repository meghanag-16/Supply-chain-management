import { useState, useEffect } from 'react';
import api from '../services/api';
import GenericTable from './GenericTable';

// NEW: Now accepts onCardClick prop
const TablePreviewCard = ({ entityName, apiPath, onCardClick }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(apiPath)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error(`Error fetching ${entityName}:`, err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [entityName, apiPath]);

  // NEW: Handle the click event
  const handleClick = () => {
    if (data.length > 0) {
      onCardClick(data);
    }
  };

  return (
    // NEW: Added onClick handler
    <div className="table-preview-card" onClick={handleClick}>
      <h3 className="table-preview-title">{entityName}</h3>
      {loading ? (
        <p>Loading preview...</p>
      ) : data.length > 0 ? (
        <div className="preview-content">
          <p>{data.length} total records. Showing first 3.</p>
          <GenericTable data={data.slice(0, 3)} />
        </div>
      ) : (
        <p>No data to display.</p>
      )}

      {/* REMOVED the old table-hover-popup div */}
    </div>
  );
};

export default TablePreviewCard;