# Crop Recommendation Dataset Guide

This guide explains how to use the Crop_recommendation.csv dataset for crop prediction in AgroSense.

## Dataset Information

The `Crop_recommendation.csv` dataset contains soil and environmental parameters that can be used to determine the most suitable crop for a particular field. This dataset is used to train a machine learning model for crop recommendations.

## Dataset Columns

- **N**: Nitrogen content in soil (kg/ha)
- **P**: Phosphorus content in soil (kg/ha)
- **K**: Potassium content in soil (kg/ha)
- **temperature**: Temperature in degrees Celsius
- **humidity**: Relative humidity in percentage
- **ph**: pH value of the soil
- **rainfall**: Rainfall in mm
- **label**: The crop that is suitable for the specified conditions

## Crops in the Dataset

The dataset includes recommendations for 22 different crops:
- rice
- maize
- chickpea
- kidneybeans
- pigeonpeas
- mothbeans
- mungbean
- blackgram
- lentil
- pomegranate
- banana
- mango
- grapes
- watermelon
- muskmelon
- apple
- orange
- papaya
- coconut
- cotton
- jute
- coffee

## How to Use

1. Go to the Prediction page
2. Enter your soil and environmental data:
   - Nitrogen (N)
   - Phosphorus (P)
   - Potassium (K)
   - Temperature
   - Humidity
   - pH
   - Rainfall
3. Click "Analyze & Predict" to get crop recommendations

## Training the Model

You can also train the model using this dataset:

1. Go to the Prediction page
2. Scroll to the "Dataset Upload for Crop Yield Prediction" section
3. Upload the `Crop_recommendation.csv` file
4. Click "Train Model with Dataset"

After training, the model will be used for all future predictions until the server is restarted.

## Model Details

- The model uses a Random Forest Classifier algorithm
- Features are standardized before training
- The dataset is split into training (80%) and testing (20%) sets
- Accuracy and other metrics are displayed after training

## Notes

- The model is stored in memory and will be lost when the server restarts
- For best results, ensure your input values are within the ranges found in the dataset
- The model will provide both the recommended crop and alternative options with confidence scores
