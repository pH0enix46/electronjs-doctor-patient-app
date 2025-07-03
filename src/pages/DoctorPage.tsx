import React, { useEffect, useState } from 'react';
import DoctorForm from '../components/DoctorForm';
import { Patient, getAllPatients, deletePatient } from '../services/patientService';
import { Trash2, Edit } from 'lucide-react';

const DoctorPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = async () => {
    try {
      const results = await getAllPatients();
      setPatients(results);
      setError(null);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadPatients();
    };
    loadData();
  }, []);

  const handlePatientAdded = async () => {
    await loadPatients();
    setShowForm(false);
  };

  const handleDeletePatient = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await deletePatient(id);
        // Remove the deleted patient from the local state
        setPatients(patients.filter(patient => patient.id !== id));
      } catch (error) {
        console.error('Error deleting patient:', error);
        setError('Failed to delete patient. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Doctor's Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'View Patients' : 'Add New Patient'}
        </button>
      </div>

      {showForm ? (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Patient</h2>
          <DoctorForm onPatientAdded={handlePatientAdded} />
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Patient Records</h2>
            </div>
            
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading patients...</div>
            ) : error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : patients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No patients found. Add your first patient!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {patient.image_url ? (
                              <div className="flex-shrink-0 h-10 w-10 relative">
                                <img 
                                  className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                  src={patient.image_url} 
                                  alt={patient.name}
                                  onLoad={(e) => {
                                    console.log('Image loaded successfully:', patient.image_url);
                                    // Hide any error indicators if they exist
                                    const errorIndicator = e.currentTarget.parentElement?.querySelector('.image-error');
                                    if (errorIndicator) {
                                      errorIndicator.classList.add('hidden');
                                    }
                                  }}
                                  onError={(e) => {
                                    console.error('Error loading image:', {
                                      url: patient.image_url,
                                      path: patient.image_path,
                                      error: e
                                    });
                                    
                                    // Show error indicator
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'image-error absolute inset-0 flex items-center justify-center bg-red-100 rounded-full text-red-600 text-xs';
                                    errorDiv.title = `Failed to load image: ${patient.image_url}`;
                                    errorDiv.textContent = '!';
                                    
                                    // Add error indicator if not already present
                                    if (!e.currentTarget.parentElement?.querySelector('.image-error')) {
                                      e.currentTarget.parentElement?.appendChild(errorDiv);
                                    }
                                    
                                    // Show fallback with first letter
                                    const fallback = document.createElement('div');
                                    fallback.className = 'absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full';
                                    fallback.textContent = patient.name.charAt(0).toUpperCase();
                                    
                                    // Add fallback if not already present
                                    if (!e.currentTarget.parentElement?.querySelector('.fallback-initial')) {
                                      fallback.classList.add('fallback-initial');
                                      e.currentTarget.parentElement?.appendChild(fallback);
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full">
                                <span className="text-gray-500">{patient.name.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                              <div className="text-sm text-gray-500">{patient.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeletePatient(patient.id as number)}
                            className="text-red-600 hover:text-red-900 mr-4"
                            title="Delete Patient"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorPage;
