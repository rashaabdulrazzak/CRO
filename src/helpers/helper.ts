  export const getSeverity = (status: string) => {
    switch (status) {
      case "On Hold":
        return "danger";

      case "Completed":
        return "success";

      case "To do":
        return "info";

      case "in Progress":
        return "warning";

      case "renewal":
        return null;
    }
  };

  export const getTagClass = (status: string) => {
    switch (status) {
      case "On Hold":
        return "danger-tag";
      case "Completed":
        return "success-tag";
      case "to do":
        return "info-tag";
      case "in Progress":
        return "warning-tag";
      case "renewal":
        return "renewal-tag";
      default:
        return "";
    }
  };
// ---- Form trial cases ---- 
export const referralOptions = [
  { label: "Self-referred", value: "Self-referred" },
  { label: "Physician-referred", value: "Physician-referred" },
  { label: "Clinic-referred", value: "Clinic-referred" },
  { label: "Other", value: "Other" },
];

// USG Device/Probe options
export const usgDeviceOptions = [
  { label: "Device A - Probe X", value: "Device A - Probe X" },
  { label: "Device B - Probe Y", value: "Device B - Probe Y" },
  { label: "Device C - Probe Z", value: "Device C - Probe Z" },
  { label: "Other", value: "Other" },
];

// Function to generate a unique Volunteer ID
export const generateVolunteerId = (existingIds: Set<string>): string => {
  let id: string;
  do {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
    id = `TR${randomNum}`;
  } while (existingIds.has(id)); // Ensure the ID is unique
  return id;
};

// Function to normalize and validate Volunteer ID format
export const normalizeVolunteerCode = (code: string): string => {
  const trimmedCode = code.trim().toUpperCase();
  const regex = /^TR\d{5}$/;
  if (regex.test(trimmedCode)) {
    return trimmedCode;
  }
  return ""; // Return empty string if format is invalid
};

// Function to calculate Body Mass Index (BMI)
export const calculateBMI = (weightKg: number, heightCm: number): string => {
  if (weightKg > 0 && heightCm > 0) {
    const heightM = heightCm / 100; // Convert height to meters
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(2); // Return BMI rounded to 2 decimal places
  }
  return "";
};

// Function to get age from birth date
export const getAgeFromBirthDate = (birthDate: Date | null): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Function to get formatted date string
export const formatDate = (date: Date | null): string => {
  if (!date) return "";
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

// Function to validate weight input (in kg)
export const validateWeight = (weight: string): boolean => {
  const weightNum = parseFloat(weight);
  return !isNaN(weightNum) && weightNum > 0 && weightNum < 500; // Assuming max weight limit
};

// Function to validate height input (in cm)
export const validateHeight = (height: string): boolean => {
  const heightNum = parseFloat(height);
  return !isNaN(heightNum) && heightNum > 0 && heightNum < 300; // Assuming max height limit
};

// Function to validate protocol number format (e.g., DSTR-2023)
export const validateProtocolNo = (protocolNo: string): boolean => {
  const regex = /^DSTR-\d{4}$/;
  return regex.test(protocolNo.trim().toUpperCase());
};

// Function to validate that a date is not in the future
export const validatePastDate = (date: Date | null): boolean => {
  if (!date) return false;
  const today = new Date();
  return date <= today;
};

// Function to validate that a date is not before another date
export const validateDateOrder = (startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate || !endDate) return false;
  return startDate <= endDate;
};

// Function to validate USG Device/Probe input
export const validateUsgDevice = (device: string): boolean => {
  return device.trim().length > 0; // Ensure it's not empty
};

// Function to validate Referred From input
export const validateReferredFrom = (referredFrom: string): boolean => {
  return referredFrom.trim().length > 0; // Ensure it's not empty
};

// Function to validate name input
export const validateName = (name: string): boolean => {
  return name.trim().length > 0; // Ensure it's not empty
};

// Function to validate gender input
export const validateGender = (gender: string): boolean => {
  const validGenders = ["male", "female", "not-specify", ""];
  return validGenders.includes(gender);
};

// Function to validate birth date input
export const validateBirthDate = (birthDate: Date | null): boolean => {
  return birthDate === null || validatePastDate(birthDate);
};

// Function to validate visit date input
export const validateVisitDate = (visitDate: Date | null): boolean => {
  return visitDate !== null && validatePastDate(visitDate);
};

// Function to validate second visit date input
export const validateSecondVisitDate = (visitDate: Date | null, secondVisitDate: Date | null): boolean => {
  return secondVisitDate === null || (visitDate !== null && validateDateOrder(visitDate, secondVisitDate));
};

// Function to validate quick yes/no questions
export const validateYesNo = (answer: string | null): boolean => {
  const validAnswers = ["yes", "no", null];
  return validAnswers.includes(answer);
};

