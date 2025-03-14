import React from "react";
import { useFetchAllSyllabi } from "~/app/api/syllabi";

/**
 * Simple component that displays the first 5 syllabi from the API
 * This is for debugging purposes for now to see if the syllabi are being fetched correctly
 * Will be changed to syllabi list view in the future once the syllabi are fetched correctly
 */
const SyllabiSearchList: React.FC = () => {
  const { data, isLoading, error } = useFetchAllSyllabi();
  
  if (isLoading) {
    return <div className="p-4 bg-blue-100 rounded">Loading syllabi data...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 rounded">
        <p className="font-bold">Error loading syllabi:</p>
        <p>{String(error)}</p>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 rounded">
        <p className="font-bold">No syllabi found!</p>
        <p>The API returned no syllabi data.</p>
      </div>
    );
  }
  
  // Display just the first 5 syllabi
  const firstFive = data.slice(0, 5);
  
  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold text-lg mb-2">First 5 Syllabi (Debug View)</h2>
      <p className="mb-2">Total syllabi available: {data.length}</p>
      
      <div className="space-y-2">
        {firstFive.map((syllabus, index) => (
          <div key={index} className="p-2 bg-gray-100 rounded">
            <div><strong>Course:</strong> {syllabus.number}</div>
            <div>
              <strong>Link:</strong>{" "}
              <a 
                href={syllabus.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Syllabus
              </a>
            </div>
            <pre className="text-xs mt-2 overflow-x-auto">
              {JSON.stringify(syllabus, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabiSearchList;