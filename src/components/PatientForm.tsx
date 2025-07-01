import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Heart, Clipboard, Pill } from "lucide-react";

export default function PatientForm() {
  const [formData, setFormData] = useState({
    // Personal Information
    patientId: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    phoneNumber: "",
    email: "",
    nationalId: "",
    address: "",
    maritalStatus: "",
    emergencyContactName: "",
    emergencyContactNumber: "",

    // Medical History
    allergies: "",
    pastIllnesses: "",
    chronicConditions: "",
    familyHistory: "",
    vaccinationStatus: "",
    currentMedications: "",

    // Clinical Information
    chiefComplaint: "",
    presentIllness: "",
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    height: "",
    weight: "",
    bmi: "",

    // Diagnosis & Treatment
    diagnosis: "",
    doctorNotes: "",
    labRecommendations: "",
    testResults: "",
    prescriptions: "",
    followUpDate: "",
    referredTo: "",
  });

  // Auto-calculate BMI
  useEffect(() => {
    if (formData.height && formData.weight) {
      const heightInMeters = parseFloat(formData.height) / 100;
      const weightInKg = parseFloat(formData.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData((prev) => ({ ...prev, bmi }));
      }
    }
  }, [formData.height, formData.weight]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Patient Data:", formData);
    // Handle form submission here
    alert("Patient data saved successfully!");
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Patient Registration Form
          </h1>
          <p className="text-gray-600">
            Complete patient information and medical records
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 px-6 py-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Basic patient demographics and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patientId" className="text-gray-700">
                    Patient ID / Record Number *
                  </Label>
                  <Input
                    id="patientId"
                    value={formData.patientId}
                    onChange={(e) =>
                      handleInputChange("patientId", e.target.value)
                    }
                    placeholder="Enter patient ID"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter full name"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-700">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-700">
                    Gender *
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="text-gray-700">
                    Blood Group
                  </Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value) =>
                      handleInputChange("bloodGroup", value)
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="Enter phone number"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="text-gray-700">
                    National ID / Insurance Number
                  </Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) =>
                      handleInputChange("nationalId", e.target.value)
                    }
                    placeholder="Enter ID number"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus" className="text-gray-700">
                    Marital Status
                  </Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) =>
                      handleInputChange("maritalStatus", value)
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={2}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactName"
                    className="text-gray-700"
                  >
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      handleInputChange("emergencyContactName", e.target.value)
                    }
                    placeholder="Enter emergency contact name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactNumber"
                    className="text-gray-700"
                  >
                    Emergency Contact Number
                  </Label>
                  <Input
                    id="emergencyContactNumber"
                    value={formData.emergencyContactNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContactNumber",
                        e.target.value
                      )
                    }
                    placeholder="Enter emergency contact number"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 px-6 py-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Heart className="h-5 w-5 text-red-600" />
                Medical History
              </CardTitle>
              <CardDescription className="text-gray-600">
                Patient's medical background and health information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-gray-700">
                  Allergies (drugs, food, environmental)
                </Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) =>
                    handleInputChange("allergies", e.target.value)
                  }
                  placeholder="List any known allergies"
                  rows={2}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pastIllnesses" className="text-gray-700">
                  Past Illnesses / Surgeries
                </Label>
                <Textarea
                  id="pastIllnesses"
                  value={formData.pastIllnesses}
                  onChange={(e) =>
                    handleInputChange("pastIllnesses", e.target.value)
                  }
                  placeholder="List previous illnesses, surgeries, and hospitalizations"
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronicConditions" className="text-gray-700">
                  Chronic Conditions
                </Label>
                <Textarea
                  id="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={(e) =>
                    handleInputChange("chronicConditions", e.target.value)
                  }
                  placeholder="e.g., diabetes, hypertension, asthma, heart disease"
                  rows={2}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyHistory" className="text-gray-700">
                  Family History of Illness
                </Label>
                <Textarea
                  id="familyHistory"
                  value={formData.familyHistory}
                  onChange={(e) =>
                    handleInputChange("familyHistory", e.target.value)
                  }
                  placeholder="Family medical history (parents, siblings, grandparents)"
                  rows={2}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vaccinationStatus" className="text-gray-700">
                    Vaccination Status
                  </Label>
                  <Textarea
                    id="vaccinationStatus"
                    value={formData.vaccinationStatus}
                    onChange={(e) =>
                      handleInputChange("vaccinationStatus", e.target.value)
                    }
                    placeholder="Recent vaccinations and immunization status"
                    rows={2}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMedications" className="text-gray-700">
                    Current Medications
                  </Label>
                  <Textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) =>
                      handleInputChange("currentMedications", e.target.value)
                    }
                    placeholder="List current medications with dosages"
                    rows={2}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 px-6 py-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Clipboard className="h-5 w-5 text-green-600" />
                Clinical Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Current visit details and vital signs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint" className="text-gray-700">
                  Reason for Visit / Chief Complaint *
                </Label>
                <Textarea
                  id="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={(e) =>
                    handleInputChange("chiefComplaint", e.target.value)
                  }
                  placeholder="Main reason for today's visit"
                  rows={2}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentIllness" className="text-gray-700">
                  Present Illness Details
                </Label>
                <Textarea
                  id="presentIllness"
                  value={formData.presentIllness}
                  onChange={(e) =>
                    handleInputChange("presentIllness", e.target.value)
                  }
                  placeholder="Detailed description of current symptoms and their progression"
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Separator className="my-4" />
              <h4 className="font-semibold text-lg text-gray-800 mb-3">
                Vital Signs
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-gray-700">
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) =>
                      handleInputChange("temperature", e.target.value)
                    }
                    placeholder="36.5"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure" className="text-gray-700">
                    Blood Pressure
                  </Label>
                  <Input
                    id="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={(e) =>
                      handleInputChange("bloodPressure", e.target.value)
                    }
                    placeholder="120/80"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heartRate" className="text-gray-700">
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) =>
                      handleInputChange("heartRate", e.target.value)
                    }
                    placeholder="72"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate" className="text-gray-700">
                    Respiratory Rate
                  </Label>
                  <Input
                    id="respiratoryRate"
                    type="number"
                    value={formData.respiratoryRate}
                    onChange={(e) =>
                      handleInputChange("respiratoryRate", e.target.value)
                    }
                    placeholder="16"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygenSaturation" className="text-gray-700">
                    O2 Saturation (%)
                  </Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    value={formData.oxygenSaturation}
                    onChange={(e) =>
                      handleInputChange("oxygenSaturation", e.target.value)
                    }
                    placeholder="98"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Separator className="my-4" />
              <h4 className="font-semibold text-lg text-gray-800 mb-3">
                Physical Measurements
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-gray-700">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    placeholder="170"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-700">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    placeholder="70"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi" className="text-gray-700">
                    BMI (auto-calculated)
                  </Label>
                  <Input
                    id="bmi"
                    value={formData.bmi}
                    readOnly
                    placeholder="Auto-calculated"
                    className="bg-gray-50 border-gray-300"
                  />
                  {formData.bmi && (
                    <div className="mt-1">
                      <Badge
                        variant={
                          parseFloat(formData.bmi) < 18.5
                            ? "destructive"
                            : parseFloat(formData.bmi) > 24.9
                            ? "destructive"
                            : "default"
                        }
                        className="text-xs"
                      >
                        {parseFloat(formData.bmi) < 18.5
                          ? "Underweight"
                          : parseFloat(formData.bmi) <= 24.9
                          ? "Normal"
                          : parseFloat(formData.bmi) <= 29.9
                          ? "Overweight"
                          : "Obese"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis & Treatment */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 px-6 py-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Pill className="h-5 w-5 text-purple-600" />
                Diagnosis & Treatment
              </CardTitle>
              <CardDescription className="text-gray-600">
                Medical assessment and treatment plan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-gray-700">
                  Provisional / Final Diagnosis
                </Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) =>
                    handleInputChange("diagnosis", e.target.value)
                  }
                  placeholder="Enter diagnosis"
                  rows={2}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorNotes" className="text-gray-700">
                  Doctor's Notes
                </Label>
                <Textarea
                  id="doctorNotes"
                  value={formData.doctorNotes}
                  onChange={(e) =>
                    handleInputChange("doctorNotes", e.target.value)
                  }
                  placeholder="Clinical observations and notes"
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="labRecommendations" className="text-gray-700">
                    Lab Test Recommendations
                  </Label>
                  <Textarea
                    id="labRecommendations"
                    value={formData.labRecommendations}
                    onChange={(e) =>
                      handleInputChange("labRecommendations", e.target.value)
                    }
                    placeholder="Recommended laboratory tests"
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testResults" className="text-gray-700">
                    Test Results
                  </Label>
                  <Textarea
                    id="testResults"
                    value={formData.testResults}
                    onChange={(e) =>
                      handleInputChange("testResults", e.target.value)
                    }
                    placeholder="Available test results"
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescriptions" className="text-gray-700">
                  Prescriptions
                </Label>
                <Textarea
                  id="prescriptions"
                  value={formData.prescriptions}
                  onChange={(e) =>
                    handleInputChange("prescriptions", e.target.value)
                  }
                  placeholder="Medicine name, dosage, frequency, and duration"
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="followUpDate" className="text-gray-700">
                    Follow-up Date
                  </Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) =>
                      handleInputChange("followUpDate", e.target.value)
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referredTo" className="text-gray-700">
                    Referred To (Specialist)
                  </Label>
                  <Input
                    id="referredTo"
                    value={formData.referredTo}
                    onChange={(e) =>
                      handleInputChange("referredTo", e.target.value)
                    }
                    placeholder="Enter specialist or department"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700"
            >
              Save Patient Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
