import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllPatients, Patient } from "@/services/patientService";

interface MedicineRow {
  id: string;
  name: string;
  dose: string; // e.g., 500 mg
  frequency: string; // e.g., 1-0-1
  duration: string; // e.g., 7 days
  notes: string; // e.g., After meals
}

type Gender = "Male" | "Female" | "Other";

type DoctorTemplateKey = "dental_pride" | "generic_clinic";

interface DoctorTemplate {
  key: DoctorTemplateKey;
  clinicName: string;
  // Use explicit Tailwind classes (avoid dynamic class strings being purged)
  brandTextClass: string; // e.g., 'text-indigo-600'
  brandBgClass: string; // e.g., 'bg-indigo-600'
  doctorName: string;
  credentials: string;
  phones?: string[];
  chambers: Array<{
    title: string;
    days: string;
    time: string;
    address: string;
  }>;
}

const DOCTOR_TEMPLATES: Record<DoctorTemplateKey, DoctorTemplate> = {
  dental_pride: {
    key: "dental_pride",
    clinicName: "DENTAL CARE PRIDE",
    brandTextClass: "text-indigo-600",
    brandBgClass: "bg-indigo-600",
    doctorName: "DR. S.M. GOLAM MORSHED",
    credentials:
      "BDS, PGT, Mphil, PhD (Fellow) – PGT (Oral & Maxillofacial Surgery) | PGT (Conservative Dentistry & Endodontics)",
    phones: ["01717086177", "01814947664", "01711947664"],
    chambers: [
      {
        title: "Chamber-1",
        days: "Sat–Thursday",
        time: "5:00 pm – 10:00 pm",
        address:
          "Prime Dental Care, 13/16 Block - F, Joint Quarter Madrasa Road, Mohammadpur, Dhaka-1207",
      },
      {
        title: "Chamber-2",
        days: "Sat–Tues & Thursday",
        time: "10:00 am – 1:00 pm",
        address:
          "Ibn Sina Diagnostic & Consultation Center, House#52, Garib-E-Newaz Avenue, Uttara-13, Dhaka-1230",
      },
    ],
  },
  generic_clinic: {
    key: "generic_clinic",
    clinicName: "City Health Clinic",
    brandTextClass: "text-sky-600",
    brandBgClass: "bg-sky-600",
    doctorName: "DR. JOHN DOE",
    credentials: "MBBS, FCPS (Medicine)",
    phones: ["01234567890"],
    chambers: [
      {
        title: "Chamber-1",
        days: "Mon–Fri",
        time: "4:00 pm – 9:00 pm",
        address: "123 Medical Road, City Center, Dhaka",
      },
    ],
  },
};

const EmptyMedicine: () => MedicineRow = () => ({
  id: crypto.randomUUID(),
  name: "",
  dose: "",
  frequency: "",
  duration: "",
  notes: "",
});

const labelCls = "text-xs font-semibold text-gray-700";

const fieldBorder = "border border-gray-300";

const sectionTitle = "text-sm font-bold tracking-wide text-gray-700";

const A4_WIDTH = 794; // px @ 96dpi

const Prescription: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.id) === selectedPatientId),
    [patients, selectedPatientId]
  );

  const [templateKey, setTemplateKey] =
    useState<DoctorTemplateKey>("dental_pride");
  const template = DOCTOR_TEMPLATES[templateKey];

  const [sex, setSex] = useState<Gender>("Male");
  const [age, setAge] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  const [diagnosis, setDiagnosis] = useState<string>("");
  const [advice, setAdvice] = useState<string>("");
  const [followUp, setFollowUp] = useState<string>("");

  const [medicines, setMedicines] = useState<MedicineRow[]>([EmptyMedicine()]);

  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await getAllPatients();
        setPatients(all);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    setDateStr(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setAge(selectedPatient.age ? String(selectedPatient.age) : "");
      const g = (selectedPatient.gender || "").toLowerCase();
      if (g.startsWith("m")) setSex("Male");
      else if (g.startsWith("f")) setSex("Female");
      else setSex("Other");
    }
  }, [selectedPatient]);

  const addMedicine = () => setMedicines((prev) => [...prev, EmptyMedicine()]);

  const removeMedicine = (id: string) =>
    setMedicines((prev) =>
      prev.length > 1 ? prev.filter((m) => m.id !== id) : prev
    );

  const updateMedicine = (id: string, patch: Partial<MedicineRow>) =>
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );

  const handlePrint = () => {
    // Give the browser a tick to apply print styles
    setTimeout(() => window.print(), 50);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Prescription</h1>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className={labelCls}>Select Patient</div>
          <Select
            value={selectedPatientId}
            onValueChange={setSelectedPatientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} {p.age ? `(${p.age}y)` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className={labelCls}>Template</div>
          <Select
            value={templateKey}
            onValueChange={(v) => setTemplateKey(v as DoctorTemplateKey)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dental_pride">Dental Care PRIDE</SelectItem>
              <SelectItem value="generic_clinic">Generic Clinic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            variant="secondary"
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 print:hidden"
            onClick={handlePrint}
          >
            Preview & Print (Save as PDF)
          </Button>
        </div>
      </div>

      {/* Patient Quick Fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className={labelCls}>Name</div>
          <Input
            value={selectedPatient?.name || ""}
            placeholder="Patient name"
            readOnly
            className="bg-gray-50"
          />
        </div>
        <div>
          <div className={labelCls}>Age</div>
          <Input value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div>
          <div className={labelCls}>Sex</div>
          <Select value={sex} onValueChange={(v) => setSex(v as Gender)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className={labelCls}>Date</div>
          <Input value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
        </div>
      </div>

      {/* Medicines builder */}
      <div className="space-y-3">
        <div className={sectionTitle}>Medicines</div>
        <div className="space-y-2">
          {medicines.map((m, idx) => (
            <div
              key={m.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-2 p-3 rounded-md ${fieldBorder}`}
            >
              <div className="md:col-span-4">
                <div className={labelCls}>Name</div>
                <Input
                  value={m.name}
                  onChange={(e) =>
                    updateMedicine(m.id, { name: e.target.value })
                  }
                  placeholder="e.g., Amoxicillin"
                />
              </div>
              <div className="md:col-span-2">
                <div className={labelCls}>Dose</div>
                <Input
                  value={m.dose}
                  onChange={(e) =>
                    updateMedicine(m.id, { dose: e.target.value })
                  }
                  placeholder="500 mg"
                />
              </div>
              <div className="md:col-span-2">
                <div className={labelCls}>Frequency</div>
                <Input
                  value={m.frequency}
                  onChange={(e) =>
                    updateMedicine(m.id, { frequency: e.target.value })
                  }
                  placeholder="1-0-1"
                />
              </div>
              <div className="md:col-span-2">
                <div className={labelCls}>Duration</div>
                <Input
                  value={m.duration}
                  onChange={(e) =>
                    updateMedicine(m.id, { duration: e.target.value })
                  }
                  placeholder="5 days"
                />
              </div>
              <div className="md:col-span-2">
                <div className={labelCls}>Notes</div>
                <Input
                  value={m.notes}
                  onChange={(e) =>
                    updateMedicine(m.id, { notes: e.target.value })
                  }
                  placeholder="After meals"
                />
              </div>
              <div className="md:col-span-12 flex justify-between pt-2">
                <div className="text-xs text-gray-500">#{idx + 1}</div>
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => removeMedicine(m.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={addMedicine}>
          + Add another medicine
        </Button>
      </div>

      {/* Diagnosis / Advice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className={sectionTitle}>Diagnosis</div>
          <Textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Summary of diagnosis / problems"
            rows={4}
          />
        </div>
        <div className="md:col-span-1">
          <div className={sectionTitle}>Follow Up</div>
          <Textarea
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="e.g., Review after 7 days"
            rows={4}
          />
        </div>
        <div className="md:col-span-3">
          <div className={sectionTitle}>Advice</div>
          <Textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder="General advice for the patient"
            rows={3}
          />
        </div>
      </div>

      {/* Printable area */}
      <div className="hidden print:block">
        {/* Spacer so the print version uses full width */}
      </div>

      <div
        ref={printRef}
        className="prescription-print bg-white mx-auto shadow border print:shadow-none print:border-0"
        style={{ width: A4_WIDTH, maxWidth: "100%" }}
      >
        {/* Header */}
        <div className="relative p-6">
          <div className="grid grid-cols-2 gap-4 items-start">
            <div>
              {template.chambers.map((c, idx) => (
                <div key={idx} className="mb-2 text-xs text-gray-700">
                  <div className="font-semibold">
                    {c.title} <span className="font-normal">({c.days})</span>
                  </div>
                  <div>{c.time}</div>
                  <div>{c.address}</div>
                </div>
              ))}
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-extrabold ${template.brandTextClass}`}
              >
                {template.clinicName}
              </div>
            </div>
          </div>

          <div className="mt-4 py-2 px-3 bg-gray-100 rounded text-sm flex gap-6">
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {selectedPatient?.name || ""}
            </div>
            <div>
              <span className="font-semibold">Age:</span> {age}
            </div>
            <div>
              <span className="font-semibold">Sex:</span> {sex}
            </div>
            <div className="ml-auto">
              <span className="font-semibold">Date:</span> {dateStr}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-24 min-h-[750px]">
          <div className="flex gap-6">
            <div className="w-10 text-4xl font-extrabold text-gray-600">℞</div>
            <div className="flex-1 space-y-4">
              {/* Medicines table for print: shows explicit column titles */}
              <div className="border rounded">
                <div className="grid grid-cols-12 text-xs font-semibold bg-gray-100 text-gray-700">
                  <div className="col-span-4 py-2 pl-3">Name</div>
                  <div className="col-span-2 py-2 pl-3">Dose</div>
                  <div className="col-span-2 py-2 pl-3">Frequency</div>
                  <div className="col-span-2 py-2 pl-3">Duration</div>
                  <div className="col-span-2 py-2 pl-3">Notes</div>
                </div>
                {medicines
                  .filter((m) => m.name.trim().length > 0)
                  .map((m, idx) => (
                    <div
                      key={m.id}
                      className="grid grid-cols-12 text-sm text-gray-800 border-t"
                    >
                      <div className="col-span-4 py-2 pl-3 font-semibold">
                        {idx + 1}. {m.name}
                      </div>
                      <div className="col-span-2 py-2 pl-3">{m.dose}</div>
                      <div className="col-span-2 py-2 pl-3">{m.frequency}</div>
                      <div className="col-span-2 py-2 pl-3">{m.duration}</div>
                      <div className="col-span-2 py-2 pl-3">{m.notes}</div>
                    </div>
                  ))}
              </div>

              {diagnosis.trim() && (
                <div className="mt-6">
                  <div className="font-semibold text-gray-700">
                    Provisional Diagnosis
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {diagnosis}
                  </div>
                </div>
              )}

              {advice.trim() && (
                <div className="mt-6">
                  <div className="font-semibold text-gray-700">Advice</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {advice}
                  </div>
                </div>
              )}

              {followUp.trim() && (
                <div className="mt-6">
                  <div className="font-semibold text-gray-700">Follow Up</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {followUp}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t bg-white`}>
          <div className="grid grid-cols-3 items-end">
            <div
              className={`h-1 ${template.brandBgClass} rounded-full col-span-2`}
            />
            <div className="text-right">
              <div className="font-bold text-gray-900">
                {template.doctorName}
              </div>
              <div className="text-xs text-gray-700">
                {template.credentials}
              </div>
              {template.phones && (
                <div className="text-xs text-gray-500 mt-1">
                  {template.phones.join(" · ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          @page { size: A4; margin: 10mm; }
          /* Isolate the prescription area when printing */
          body * { visibility: hidden !important; }
          .prescription-print, .prescription-print * { visibility: visible !important; }
          .prescription-print { position: absolute; left: 0; right: 0; top: 0; margin: 0 auto; }
          /* Utility helpers */
          .print\:block { display: block !important; }
          .print\:border-0 { border: 0 !important; }
          .print\:shadow-none { box-shadow: none !important; }
          .print\:hidden { display: none !important; }
          .print\:mx-auto { margin-left: auto !important; margin-right: auto !important; }
        }
      `}</style>
    </div>
  );
};

export default Prescription;
