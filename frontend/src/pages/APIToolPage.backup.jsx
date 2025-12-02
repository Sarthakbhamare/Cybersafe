import React, { useState } from "react";

// Card component for styling containers
const Card = ({ children, className = "" }) => (
  <div
    className={`p-6 bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

// Button component with variants for different actions
const Button = ({
  children,
  variant = "default",
  className = "",
  onClick,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} px-4 py-2 text-base ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Main App component for the webpage
const APIToolPage = () => {
  // State for text input and API results
  const [inputText, setInputText] = useState("");
  const [scamPrediction, setScamPrediction] = useState(null);
  const [contactPrediction, setContactPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // API endpoint (env override with localhost fallback for dev)
  // const API_BASE_URL = import.meta.env.VITE_MODEL_API_BASE_URL || "http://127.0.0.1:8000";

  // Function to handle API calls
  const callApi = async (endpoint, payload) => {
    console.warn(`API call to ${endpoint} skipped while backend is disabled.`, payload);
    const text = payload.text || "";
    if (endpoint === "/predict-scam") {
      const flaggedTerms = ["lottery", "prize", "winner", "urgent", "otp", "claim", "transfer"];
      const isScam = flaggedTerms.some((term) => text.toLowerCase().includes(term));
      return { prediction: isScam ? "scam" : "safe" };
    }
    if (endpoint === "/predict-contact-number") {
      const match = text.match(/\+?\d[\d\s-]{7,}\d/);
      return { prediction: match ? match[0].replace(/\s+/g, "") : "" };
    }
    return { prediction: "" };
    /*
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.detail?.[0]?.msg || "API call failed");
      }

      return response.json();
    } catch (err) {
      console.error("Fetch Error:", err);
      throw new Error("Failed to connect to the API. Please try again later.");
    }
    */
  };

  // Function to handle the main check button
  const handleCheck = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }

    setError("🚧 Model Training in Progress - This feature will be available soon. Our AI models are currently being trained to provide accurate scam detection.");
    setScamPrediction(null);
    setContactPrediction(null);
  };

  // A helper function to render the contact number result
  const getContactNumberDisplay = (prediction) => {
    if (!prediction || prediction.trim() === "") {
      return (
        <span className="text-gray-500 font-normal">
          No contact number found.
        </span>
      );
    }
    return (
      <span className="font-bold text-lg text-indigo-600 break-words">
        {prediction}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
          Dual Model API
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Analyze text for potential scams and extract contact numbers.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        <Card>
          <div className="space-y-4">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              rows="6"
              placeholder="Enter text here to analyze. For example: 'Congratulations! You've won a lottery. Call +919876543210 to claim your prize!'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              onClick={handleCheck}
              className="w-full py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Analyze Text"
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {(scamPrediction || contactPrediction) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scamPrediction && (
              <Card className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Scam Prediction
                </h2>
                <div className="bg-gray-100 p-4 rounded-lg flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Result:</span>
                    <span
                      className={`font-bold text-lg ${
                        scamPrediction.prediction === "scam"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {scamPrediction.prediction === "scam"
                        ? "SCAM ⚠️"
                        : "SAFE ✅"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This model analyzes the text for fraudulent language
                    patterns.
                  </p>
                </div>
              </Card>
            )}

            {contactPrediction && (
              <Card className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Number Prediction
                </h2>
                <div className="bg-gray-100 p-4 rounded-lg flex-grow">
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">
                      Contact Number Found:
                    </span>
                  </div>
                  {getContactNumberDisplay(contactPrediction.prediction)}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default APIToolPage;
