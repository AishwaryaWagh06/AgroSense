# Crop Yield Prediction Dataset Download Guide

This guide will help you download the Crop Yield Prediction dataset from Kaggle.

## Dataset Information
- **Dataset Name**: Crop Yield Prediction Dataset
- **Author**: patelris
- **Kaggle URL**: https://www.kaggle.com/datasets/patelris/crop-yield-prediction-dataset

## Download Methods

### Method 1: Using Python Script (Recommended)

1. **Set up Kaggle API credentials:**

   **Option A - Using kaggle.json file:**
   - Go to [Kaggle Settings](https://www.kaggle.com/settings)
   - Scroll to the 'API' section
   - Click 'Create New API Token'
   - This will download a `kaggle.json` file
   - Create the directory: `C:\Users\YOUR_USERNAME\.kaggle`
   - Place `kaggle.json` in: `C:\Users\YOUR_USERNAME\.kaggle\kaggle.json`

   **Option B - Using environment variables:**
   ```powershell
   # Set environment variables (PowerShell)
   $env:KAGGLE_USERNAME = "your_username"
   $env:KAGGLE_KEY = "your_api_key"
   ```

2. **Run the download script:**
   ```bash
   python download_kaggle_dataset.py
   ```

   The dataset will be downloaded to: `Dataset/crop-yield/`

### Method 2: Manual Download

1. Visit the dataset page: https://www.kaggle.com/datasets/patelris/crop-yield-prediction-dataset
2. Click the "Download" button (you'll need to be logged in to Kaggle)
3. Extract the downloaded ZIP file to: `Dataset/crop-yield/`

### Method 3: Using Kaggle CLI

If you have the Kaggle CLI installed:

```bash
kaggle datasets download -d patelris/crop-yield-prediction-dataset -p Dataset/crop-yield --unzip
```

## Required Package

Make sure you have the Kaggle package installed:

```bash
pip install kaggle
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

## Dataset Location

After downloading, the dataset will be located at:
- `Dataset/crop-yield/`

## Troubleshooting

### Authentication Error
If you get an authentication error:
1. Verify that `kaggle.json` is in the correct location
2. Check that the file contains valid JSON with `username` and `key` fields
3. Make sure the `.kaggle` directory has correct permissions (read-only for others)

### Import Error
If you get import errors:
```bash
pip install --upgrade kaggle
```

### Download Fails
- Check your internet connection
- Verify you're logged into Kaggle and the dataset is accessible
- Try manual download as an alternative

## Next Steps

After downloading the dataset:
1. Explore the dataset files in `Dataset/crop-yield/`
2. Use the dataset for your crop yield prediction model
3. Refer to the dataset documentation on Kaggle for column descriptions

