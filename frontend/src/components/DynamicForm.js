import { useState, useEffect } from 'react';

const DynamicForm = ({ schema, initialData, onSubmit, onCancel, formTitle }) => {
  const [formData, setFormData] = useState({});

  // Populate form with initial data when it changes (for updates)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Set default empty state for creation
      const defaultState = {};
      Object.keys(schema).forEach(key => (defaultState[key] = ''));
      setFormData(defaultState);
    }
  }, [initialData, schema]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="dynamic-form" onSubmit={handleSubmit}>
      <h3 className="form-title">{formTitle}</h3>
      {Object.keys(schema).map((key) => {
        const type = schema[key];
        // Don't show ID field for creating new items
        if (key.endsWith('_id') && !initialData) {
          // You might want to let users enter IDs, if so, remove this if-block
          // For this example, we assume IDs are auto-increment or manually entered
        }

        return (
          <div className="input-group" key={key}>
            <label htmlFor={key}>{key.replace(/_/g, ' ')}</label>
            {type === 'textarea' ? (
              <textarea
                id={key}
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
              />
            ) : (
              <input
                type={type}
                id={key}
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                // Make ID field read-only when updating
                readOnly={key.endsWith('_id') && !!initialData}
              />
            )}
          </div>
        );
      })}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;