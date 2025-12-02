
import os
import joblib
import re
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

# --- Initialize Flask App ---
app = Flask(__name__)
# Enable CORS to allow requests from your local HTML file
CORS(app)

# --- Load the trained model and vectorizer ---
# Use relative paths based on current file location
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, 'scam_detector_model', 'scam_detector_model.joblib')
VECTORIZER_PATH = os.path.join(CURRENT_DIR, 'scam_detector_model', 'tfidf_vectorizer.joblib')

try:
    print("Loading model and vectorizer...")
    print(f"Model path: {MODEL_PATH}")
    print(f"Vectorizer path: {VECTORIZER_PATH}")
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("Model and vectorizer loaded successfully!")
except FileNotFoundError as e:
    print(f"Error: Model files not found at {MODEL_PATH}")
    print("Please ensure model files are in the 'scam_detector_model' folder")
    print("or train a new model using: python src/train_model.py")
    exit(1)
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)

# --- Helper function for text cleaning ---
def clean_text_for_prediction(text: str) -> str:
    """
    Cleans a single input string for prediction.
    This function must be identical to the one used during training.
    """
    text = str(text).lower()
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# --- Define API Routes ---

@app.route('/')
def home():
    """
    Renders the main HTML page for the scam detector.
    This assumes your HTML file is in a folder named 'templates'.
    """
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """
    Receives JSON data containing a 'message' and an optional 'url'
    and returns a scam prediction.
    """
    try:
        data = request.get_json()
        
        # Get the message and URL from the JSON data
        message = data.get('message', '')
        url = data.get('url', '')
        
        # Combine the message and URL into a single string
        combined_text = message + ' ' + url
        
        # Preprocess the combined text using the same function from training
        preprocessed_text = clean_text_for_prediction(combined_text)
        
        # Transform the preprocessed text into a numerical feature vector
        text_vector = vectorizer.transform([preprocessed_text])
        
        # Make a prediction using the loaded model
        prediction = model.predict(text_vector)
        
        # Convert the prediction to a human-readable format
        # Assuming 0 is not a scam and 1 is a scam
        prediction_label = "Scam" if prediction[0] == 1 else "Not Scam"
        
        return jsonify({
            'message': message,
            'url': url,
            'prediction': prediction_label
        })
        
    except Exception as e:
        # Return an error message if something goes wrong
        return jsonify({'error': str(e)}), 400

# --- Run the Flask App ---
if __name__ == '__main__':
    # Run the Flask app
    # Set debug=False for production, debug=True for development only
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, port=5000)

