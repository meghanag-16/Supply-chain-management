import useAuth from '../hooks/useAuth'; 

const GenericTable = ({ data, onEdit, onDelete, onCustomAction, customActionLabel, entityName }) => {
  const { checkPermission, user } = useAuth();

  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  const headers = Object.keys(data[0]);
  
  // Permissions Check
  const canEdit = entityName && checkPermission(entityName, 'can_edit');
  const canDelete = entityName && checkPermission(entityName, 'can_delete');
  
  // Specific restriction: Suppliers usually can't delete products (based on your requirements)
  // but we'll let the 'can_delete' permission from backend handle it.

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header.replace(/_/g, ' ').toUpperCase()}</th>
            ))}
            {(canEdit || canDelete || onCustomAction) && <th>ACTIONS</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{String(row[header])}</td>
              ))}
              
              {(canEdit || canDelete || onCustomAction) && (
                <td className="actions">
                  {/* Standard Edit Button */}
                  {canEdit && (
                     <button className="btn btn-secondary" onClick={() => onEdit(row)}>Edit</button>
                  )}

                  {/* SPECIAL ACTION BUTTON (For Procedures) */}
                  {onCustomAction && (
                    <button className="btn btn-warning" style={{marginLeft: '5px'}} onClick={() => onCustomAction(row)}>
                      {customActionLabel}
                    </button>
                  )}

                  {/* Standard Delete Button */}
                  {canDelete && (
                    <button className="btn btn-danger" style={{marginLeft: '5px'}} onClick={() => onDelete(row)}>Delete</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;