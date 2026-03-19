import React, { useState, useRef } from "react";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [search, setSearch] = useState("");
  const fileInputRef = useRef();

  // Normalize header names (e.g., "Student ID" -> "student_id")
  const normalize = (str) =>
    str
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").filter(Boolean);

      if (lines.length === 0) return;

      // Read header row dynamically
      const rawHeaders = lines[0].split(",");
      const normalizedHeaders = rawHeaders.map((h) => normalize(h));

      setHeaders(rawHeaders); // keep original for UI

      const rows = lines.slice(1);

      const parsed = rows.map((row) => {
        const cols = row.split(",");
        let obj = {};

        normalizedHeaders.forEach((key, index) => {
          obj[key] = cols[index]?.trim();
        });

        return obj;
      });

      setStudents(parsed);
    };

    reader.readAsText(file);
  };

  const handleDelete = (index) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleAddAll = () => {
    console.log("All students added:", students);
    alert("All students added successfully!");
  };

  // Try to find id & name fields dynamically
  const getId = (s) => s.student_id || s.id || s.registration_number || "";
  const getName = (s) => s.name || s.full_name || "";

  const filteredStudents = students.filter((s) => {
    const searchText = search.toLowerCase();

    // Search across all fields dynamically
    return Object.values(s).some((value) =>
      value?.toString().toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-[#ebf6ec] p-6 text-[#0f172a]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#13462D]">
          Student Management
        </h1>

        <button
          onClick={handleAddAll}
          className="bg-[#13462D] text-white px-6 py-2 rounded-xl shadow hover:opacity-90"
        >
          Add All Students
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-50 p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-xl font-semibold text-[#13462D] mb-4">
          Upload Student CSV
        </h2>

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-[#13462D] text-white px-5 py-2 rounded-xl shadow hover:opacity-90"
        >
          Browse CSV File
        </button>

        {fileName && (
          <p className="text-sm text-gray-600 mt-3">Uploaded: {fileName}</p>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-[#c1d8c5] shadow-sm rounded-xl bg-white text-[#0f172a] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#13462D] focus:border-[#13462D]"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-[#dae6dd]">
        <table className="w-full text-left">
          <thead className="bg-[#13462D] text-white">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-3 border-b border-[#2f6f45]">{h}</th>
              ))}
              <th className="p-3 border-b border-[#2f6f45]">Status</th>
              <th className="p-3 border-b border-[#2f6f45]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={index} className="border-b hover:bg-[#f4fbf5]" style={{ borderColor: '#d8e7d8' }}>
                {headers.map((h, i) => {
                  const key = normalize(h);
                  return (
                    <td key={i} className="p-3">
                      {student[key]}
                    </td>
                  );
                })}

                <td className="p-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#d1fae5] text-[#065f46] font-semibold">
                    <span className="text-xs">✔</span>
                    Verified
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => handleDelete(index)}
                    className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold px-3 py-1 rounded-lg shadow-sm transition"
                  >
                    <span className="text-base">✕</span>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <p className="text-center p-4 text-gray-500">
            No students found
          </p>
        )}
      </div>
    </div>
  );
}
