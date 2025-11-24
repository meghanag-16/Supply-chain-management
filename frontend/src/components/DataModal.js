// /src/components/DataModal.js
import GenericTable from './GenericTable';

const DataModal = ({ entityName, data, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{entityName} - Full Data ({data.length} records)</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <GenericTable data={data} />
        </div>
      </div>
    </div>
  );
};

export default DataModal;