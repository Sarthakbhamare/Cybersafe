# CyberSafe ML Datasets

This directory contains the training and test datasets for the CyberSafe SMS/Email scam detection model.

## Available Datasets

### Included in Repository
- `unified_ml_dataset_test.csv` - Test dataset for model evaluation
- `unified_ml_dataset_val.csv` - Validation dataset
- `StealthPhisher2025.csv` - Phishing detection dataset
- `train_domain_stratified.csv` - Domain-stratified training data
- `test_domain_stratified.csv` - Domain-stratified test data

### Excluded (Large Files)
The following datasets are excluded from the repository due to GitHub's 100MB file size limit:

- `unified_ml_dataset_full.csv` (175.19 MB) - Complete unified dataset
- `unified_ml_dataset_train.csv` (118.86 MB) - Full training dataset
- `unified_ml_dataset_train_cleaned.csv` (105.81 MB) - Cleaned training data
- `unified_ml_dataset_train_balanced.csv` (59.89 MB) - Balanced training data

## Regenerating Large Datasets

If you need the full training datasets, you can regenerate them using:

```bash
cd Model
python generate_diverse_dataset.py
python clean_dataset.py
python balance_domains.py
```

## Model Training

The model can be trained using the smaller dataset files included in the repository:

```bash
cd Model
python train.py
```

For production deployment, the pre-trained model artifacts are used from the `Model/Deploy/` directory.

## Dataset Statistics

- **Total messages**: 20,000 (spam/ham balanced)
- **Features**: TF-IDF vectorization (5,000 features)
- **Split**: 80% train, 10% validation, 10% test
- **Classes**: Binary (Scam/Legitimate)

## Note for Contributors

These large CSV files are kept locally for development but not pushed to GitHub. The model artifacts (`.joblib` files) in `Model/Deploy/` are sufficient for running the deployed application.
