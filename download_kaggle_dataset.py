"""
Script to download Kaggle Crop Yield Prediction Dataset
Requires Kaggle API credentials set up

SETUP INSTRUCTIONS:
1. Go to https://www.kaggle.com/settings
2. Scroll to 'API' section and click 'Create New API Token'
3. This will download a 'kaggle.json' file
4. Place this file in: C:\\Users\\YOUR_USERNAME\\.kaggle\\kaggle.json
5. Or set KAGGLE_USERNAME and KAGGLE_KEY environment variables
"""

import os
import sys
from pathlib import Path

# Check for credentials before importing kaggle
def check_kaggle_credentials():
    """Check if Kaggle credentials are available"""
    username = os.environ.get('KAGGLE_USERNAME')
    key = os.environ.get('KAGGLE_KEY')
    
    if username and key:
        return True
    
    kaggle_dir = Path.home() / '.kaggle'
    kaggle_json = kaggle_dir / 'kaggle.json'
    
    if kaggle_json.exists():
        return True
    
    return False

def download_dataset():
    """Download the crop yield prediction dataset from Kaggle"""
    
    # Check credentials first
    if not check_kaggle_credentials():
        print("\n" + "="*60)
        print("❌ KAGGLE CREDENTIALS NOT FOUND")
        print("="*60)
        print("\nTo download Kaggle datasets, you need to set up Kaggle API credentials:\n")
        print("OPTION 1 - Using kaggle.json file:")
        print("  1. Go to https://www.kaggle.com/settings")
        print("  2. Scroll to 'API' section and click 'Create New API Token'")
        print("  3. This will download a 'kaggle.json' file")
        print(f"  4. Create directory: {Path.home() / '.kaggle'}")
        print(f"  5. Place kaggle.json in: {Path.home() / '.kaggle' / 'kaggle.json'}")
        print("\nOPTION 2 - Using environment variables:")
        print("  Set KAGGLE_USERNAME and KAGGLE_KEY environment variables")
        print("\nOPTION 3 - Manual download:")
        print("  Visit: https://www.kaggle.com/datasets/patelris/crop-yield-prediction-dataset")
        print("  Click 'Download' and extract to: Dataset/crop-yield/")
        print("\n" + "="*60)
        return False
    
    # Now import kaggle (it should work if credentials exist)
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
    except ImportError:
        print("Installing kaggle package...")
        os.system("python -m pip install kaggle")
        from kaggle.api.kaggle_api_extended import KaggleApi
    
    # Dataset information
    dataset = "patelris/crop-yield-prediction-dataset"
    download_path = Path("Dataset/crop-yield")
    
    # Create directory if it doesn't exist
    download_path.mkdir(parents=True, exist_ok=True)
    
    try:
        print("\n" + "="*60)
        print("📥 DOWNLOADING KAGGLE DATASET")
        print("="*60)
        print(f"Dataset: {dataset}")
        print(f"Destination: {download_path.absolute()}\n")
        
        # Initialize and authenticate
        api = KaggleApi()
        api.authenticate()
        
        # Download dataset
        print("Downloading... This may take a few minutes.")
        api.dataset_download_files(
            dataset, 
            path=str(download_path), 
            unzip=True
        )
        
        print("\n" + "="*60)
        print("✅ DATASET DOWNLOADED SUCCESSFULLY!")
        print("="*60)
        print(f"\nFiles saved to: {download_path.absolute()}\n")
        
        # List downloaded files
        files = [f for f in download_path.iterdir() if f.is_file()]
        if files:
            print("Downloaded files:")
            for file in files:
                size = file.stat().st_size / 1024  # Size in KB
                print(f"  📄 {file.name} ({size:.2f} KB)")
        else:
            print("Note: No files found. Check if dataset contains subdirectories.")
            
        return True
                
    except OSError as e:
        print("\n" + "="*60)
        print("❌ AUTHENTICATION ERROR")
        print("="*60)
        print("\nKaggle API credentials are not properly configured.")
        print("Please follow the setup instructions above.")
        print(f"\nError: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error downloading dataset: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = download_dataset()
    sys.exit(0 if success else 1)
