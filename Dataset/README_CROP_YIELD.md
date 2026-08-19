# Crop Yield Prediction Dataset Guide

This guide explains how to use the dataset upload functionality for crop yield prediction in AgroSense.

## Sample Dataset

A sample dataset `crop_yield_sample.csv` is provided in this directory. This dataset contains the following columns:

- **N**: Nitrogen content in soil (ppm)
- **P**: Phosphorus content in soil (ppm)
- **K**: Potassium content in soil (ppm)
- **pH**: Soil pH level
- **rainfall**: Average annual rainfall (mm)
- **temperature**: Average temperature (°C)
- **humidity**: Average humidity (%)
- **soil_type**: Type of soil (Loamy, Sandy, Clay, Silty)
- **yield**: Crop yield (units/acre)

## Required Columns

For the machine learning model to work, your dataset must include at least these columns:
- N
- P
- K
- pH
- rainfall
- yield

Other columns are optional and will be ignored by the model.

## Dataset Format

- CSV format (comma-separated values)
- First row must contain column headers
- Numeric values should use period (.) as decimal separator
- No missing values in required columns

## How to Use

1. Go to the Prediction page
2. Scroll to the "Dataset Upload for Crop Yield Prediction" section
3. Click on the upload area or drag and drop your CSV file
4. Review the dataset preview
5. Click "Train Model with Dataset" to train the ML model
6. Once trained, the model will automatically be used for predictions

## Creating Your Own Dataset

You can create your own dataset with real data from your farm or region. Make sure to:
- Include all required columns
- Use consistent units of measurement
- Have at least 10 data points for reliable predictions
- Clean the data to remove outliers or errors

## Example Row

```
N,P,K,pH,rainfall,yield
100,50,45,6.5,950,42.5
```

This represents soil with:
- 100 ppm Nitrogen
- 50 ppm Phosphorus
- 45 ppm Potassium
- pH level of 6.5
- 950 mm annual rainfall
- Resulting in a yield of 42.5 units/acre

## Notes

- The model uses a Random Forest Regressor algorithm
- Data is automatically split into training (80%) and testing (20%) sets
- Features are standardized before training
- Model performance metrics are displayed after training
- The trained model is stored in memory and will be lost when the server restarts
