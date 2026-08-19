// Machine Learning-based Crop Yield Prediction and Fertilizer Recommendations

/**
 * Simulates a Random Forest model's prediction for yield based on inputs.
 * The output is scaled to a realistic metric (units per acre/hectare).
 */
function simulateRandomForestYield(N, P, K, pH, rainfall, soilType) {
  const BASE_YIELD = 40; // Base yield in ideal conditions (units/acre)
  let yieldScore = BASE_YIELD;
  
  // 1. Soil Type Modifier
  const soilModifiers = {
    'Loamy': 1.15,
    'Silty': 1.05,
    'Clay': 0.9,
    'Sandy': 0.8
  };
  yieldScore *= (soilModifiers[soilType] || 1.0);

  // 2. NPK Scoring (Optimal Ranges)
  const N_OPT = { min: 80, max: 120, penalty: 0.15 };
  const P_OPT = { min: 40, max: 60, penalty: 0.12 };
  const K_OPT = { min: 40, max: 60, penalty: 0.10 };

  // Calculate NPK Penalties
  [
    { val: N, opt: N_OPT, weight: 3 }, 
    { val: P, opt: P_OPT, weight: 2 }, 
    { val: K, opt: K_OPT, weight: 1 }
  ].forEach(({ val, opt, weight }) => {
    let penalty = 0;
    if (val < opt.min) {
      // Heavy penalty for deficiency
      penalty = (opt.min - val) * opt.penalty * weight; 
    } else if (val > opt.max) {
      // Moderate penalty for excess
      penalty = (val - opt.max) * opt.penalty * weight * 0.5;
    }
    yieldScore -= penalty;
  });
  
  // 3. pH Scoring (Optimal pH 6.0 - 7.5)
  const pH_OPTIMAL = 6.75;
  const pH_DEVIATION = Math.abs(pH - pH_OPTIMAL);
  // pH penalty increases exponentially with deviation
  const pH_penalty = pH_DEVIATION * pH_DEVIATION * 1.5; 
  yieldScore -= pH_penalty;

  // 4. Rainfall Scoring (Optimal Range 800mm - 1100mm)
  const RAIN_OPT = 950;
  const RAIN_DEVIATION = Math.abs(rainfall - RAIN_OPT);
  // Penalty based on deviation from the optimum
  const rain_penalty = Math.min(RAIN_DEVIATION / 50, 10) * 0.5; 
  yieldScore -= rain_penalty;

  // Ensure yield is not negative and apply smoothing
  const finalYield = Math.max(1, yieldScore + (Math.random() * 5 - 2.5)); // Add minor random noise
  
  return Math.round(finalYield * 10) / 10; // Round to 1 decimal place
}

/**
 * Generates fertilizer and soil amendment recommendations based on input parameters.
 */
function getRecommendation(N, P, K, pH, rainfall, soilType) {
  const recommendations = [];
  
  // NPK Deficiencies (Thresholds for critical action)
  if (N < 70) {
    recommendations.push(`<strong>Nitrogen Deficiency (N=${N} ppm):</strong> Apply Urea or Ammonium Nitrate to boost early growth and leaf development. Target N level: 100-120 ppm.`);
  } else if (N > 150) {
    recommendations.push(`<strong>High Nitrogen (N=${N} ppm):</strong> Monitor closely. Excessive N can lead to leafy growth (lodging) and poor fruit/grain setting. Do not apply more N.`);
  }

  if (P < 35) {
    recommendations.push(`<strong>Phosphorus Deficiency (P=${P} ppm):</strong> Incorporate Diammonium Phosphate (DAP) or Single Superphosphate (SSP) before planting for strong root establishment. Target P level: 40-60 ppm.`);
  }

  if (K < 35) {
    recommendations.push(`<strong>Potassium Deficiency (K=${K} ppm):</strong> Apply Muriate of Potash (MOP) to improve plant health, disease resistance, and grain filling. Target K level: 40-60 ppm.`);
  }
  
  // pH Management
  if (pH < 6.0) {
    recommendations.push(`<strong>Low pH (Acidic Soil):</strong> Apply agricultural lime (Calcium Carbonate or Dolomite) to raise the pH. This improves nutrient availability, especially Phosphorus.`);
  } else if (pH > 7.8) {
    recommendations.push(`<strong>High pH (Alkaline Soil):</strong> Apply elemental Sulfur or Gypsum to lower the pH and help release essential micronutrients like Iron and Zinc.`);
  }

  // Other Environmental/Soil Advice
  if (rainfall < 700) {
    recommendations.push(`<strong>Low Rainfall Region:</strong> Consider drought-resistant varieties or efficient irrigation techniques (e.g., drip irrigation).`);
  } else if (rainfall > 1200) {
    recommendations.push(`<strong>High Rainfall Region:</strong> Ensure proper drainage to prevent waterlogging and soil compaction, especially if the soil is ${soilType}.`);
  }

  if (soilType === 'Clay') {
    recommendations.push(`<strong>Clay Soil Management:</strong> Implement deep tillage or add organic matter to improve aeration and water infiltration.`);
  } else if (soilType === 'Sandy') {
    recommendations.push(`<strong>Sandy Soil Management:</strong> Incorporate organic matter to increase water retention and nutrient holding capacity.`);
  }

  if (recommendations.length === 0) {
    recommendations.push(`<strong>Optimal Conditions:</strong> Current soil conditions are highly favorable! Maintain current nutrient levels and continue best management practices.`);
  }

  return recommendations;
}

/**
 * Main controller function to handle form submission and display results.
 */
async function predictYieldAndRecommend() {
  // Get DOM elements
  const yieldValueEl = document.getElementById('yieldValue');
  const recommendationListEl = document.getElementById('recommendationList');
  const loadingEl = document.getElementById('loading');
  const yieldResultEl = document.getElementById('yieldResult');
  const recommendationResultEl = document.getElementById('recommendationResult');
  const initialMessageEl = document.getElementById('initialMessage');

  // Hide previous results and show loading
  yieldResultEl.style.display = 'none';
  recommendationResultEl.style.display = 'none';
  initialMessageEl.style.display = 'none';
  loadingEl.style.display = 'block';

  // Collect inputs
  const N = parseFloat(document.getElementById('N').value);
  const P = parseFloat(document.getElementById('P').value);
  const K = parseFloat(document.getElementById('K').value);
  const pH = parseFloat(document.getElementById('pH').value);
  const rainfall = parseFloat(document.getElementById('rainfall').value);
  const soilType = document.getElementById('soilType').value;
  const selectedCrop = document.getElementById('cropType').value;

  // Simple input validation
  if (isNaN(N) || isNaN(P) || isNaN(K) || isNaN(pH) || isNaN(rainfall)) {
    loadingEl.style.display = 'none';
    initialMessageEl.style.display = 'block';
    alert("Please ensure all nutrient and environmental fields are filled out with valid numbers.");
    return;
  }

  try {
    // Get temperature and humidity values (default if not provided)
    const temperature = parseFloat(document.getElementById('temperature')?.value || '25');
    const humidity = parseFloat(document.getElementById('humidity')?.value || '70');
    
    // If user selected a specific crop, skip the prediction and show that crop
    if (selectedCrop) {
      // Generate recommendations
      const recommendations = getRecommendation(N, P, K, pH, rainfall, soilType);
      
      // Add user-selected crop at the top
      recommendations.unshift(`<strong>Selected Crop:</strong> You've selected to grow <span style="color: var(--accent); font-size: 1.1em; font-weight: 600;">${selectedCrop}</span>. Here are recommendations for optimal growth.`);
      
      // Hide loading and show results
      loadingEl.style.display = 'none';
      yieldResultEl.style.display = 'block';
      recommendationResultEl.style.display = 'block';
      
      // Update the yield result section to show selected crop
      const yieldValueContainer = document.querySelector('#yieldResult p');
      if (yieldValueContainer) {
        yieldValueContainer.textContent = 'Selected Crop';
      }
      
      // Update the value display with the crop name
      if (yieldValueEl) {
        yieldValueEl.textContent = selectedCrop;
      }
      
      // Update the unit label
      const yieldUnitEl = document.querySelector('.yield-unit');
      if (yieldUnitEl) {
        yieldUnitEl.textContent = '(user selected)';
      }
      
      // Update Recommendations Display
      recommendationListEl.innerHTML = ''; // Clear previous
      recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.innerHTML = rec;
        recommendationListEl.appendChild(li);
      });
      
      return; // Exit function since we've handled the user selection
    }
    
    // Try to use trained model if available
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        N, 
        P, 
        K, 
        temperature, 
        humidity, 
        ph: pH, // Note: backend expects 'ph' not 'pH'
        rainfall 
      })
    });

    if (response.ok) {
      // Use trained model result
      const result = await response.json();
      
      if (result.success && result.predicted_crop) {
        // Use the trained model prediction for crop
        const predictedCrop = result.predicted_crop;
        const cropProbabilities = result.crop_probabilities || [];
        
        // Generate recommendations
        const recommendations = getRecommendation(N, P, K, pH, rainfall, soilType);
        
        // Add model-based recommendations
        if (result.feature_importance && result.feature_importance.length > 0) {
          const topFeature = result.feature_importance[0];
          recommendations.unshift(`<strong>ML Model Insight:</strong> ${topFeature.feature} has the highest impact on crop selection for your conditions. Current value: ${topFeature.value}.`);
        }
        
        // Add crop recommendation at the top
        recommendations.unshift(`<strong>Recommended Crop:</strong> Based on your soil and environmental conditions, the ideal crop to grow is <span style="color: var(--accent); font-size: 1.1em; font-weight: 600;">${predictedCrop}</span>.`);
        
        // Add alternative crops if available
        if (cropProbabilities.length > 1) {
          const alternatives = cropProbabilities
            .slice(1, 4)  // Get next 3 best options
            .map(cp => `${cp.crop} (${Math.round(cp.probability * 100)}% confidence)`)
            .join(', ');
          
          recommendations.splice(1, 0, `<strong>Alternative Crops:</strong> ${alternatives}`);
        }
        
        // Hide loading and show results
        loadingEl.style.display = 'none';
        yieldResultEl.style.display = 'block';
        recommendationResultEl.style.display = 'block';
        
        // Update the yield result section to show crop prediction instead
        const yieldValueContainer = document.querySelector('#yieldResult p');
        if (yieldValueContainer) {
          yieldValueContainer.textContent = 'Recommended Crop';
        }
        
        // Update the value display with the crop name
        if (yieldValueEl) {
          yieldValueEl.textContent = predictedCrop;
        }
        
        // Update the unit label
        const yieldUnitEl = document.querySelector('.yield-unit');
        if (yieldUnitEl) {
          yieldUnitEl.textContent = cropProbabilities.length > 0 
            ? `${Math.round(cropProbabilities[0].probability * 100)}% confidence` 
            : '';
        }
        
        // Update Recommendations Display
        recommendationListEl.innerHTML = ''; // Clear previous
        recommendations.forEach(rec => {
          const li = document.createElement('li');
          li.innerHTML = rec;
          recommendationListEl.appendChild(li);
        });
        
        return; // Exit function since we've handled the prediction
      }
    }
    
    // If we get here, either the API call failed or no model is trained
    // Fall back to the simulation model
    console.log("Using simulation model (trained model not available)");
    
  } catch (error) {
    console.error("Error using trained model:", error);
    // Continue with simulation model as fallback
  }

  // Simulate network/model processing delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  // 1. Run Simulated ML Model for Yield Prediction (fallback)
  const predictedYield = simulateRandomForestYield(N, P, K, pH, rainfall, soilType);

  // 2. Generate Recommendations
  const recommendations = getRecommendation(N, P, K, pH, rainfall, soilType);

  // Hide loading and show results
  loadingEl.style.display = 'none';
  yieldResultEl.style.display = 'block';
  recommendationResultEl.style.display = 'block';

  // Update Yield Display with animation
  const animateValue = (element, start, end, duration) => {
    let startTime = null;
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const current = start + (end - start) * progress;
      element.textContent = current.toFixed(1);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };
  animateValue(yieldValueEl, 0, predictedYield, 1000);

  // Update Recommendations Display
  recommendationListEl.innerHTML = ''; // Clear previous
  recommendations.forEach(rec => {
    const li = document.createElement('li');
    li.innerHTML = rec;
    recommendationListEl.appendChild(li);
  });
}

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('predictionForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      predictYieldAndRecommend();
    });
  }

  // Handle crop type selection
  const cropTypeSelect = document.getElementById('cropType');
  const clearCropTypeBtn = document.getElementById('clearCropType');
  
  if (clearCropTypeBtn) {
    clearCropTypeBtn.addEventListener('click', () => {
      if (cropTypeSelect) {
        cropTypeSelect.value = '';
      }
    });
  }

  // Initialize photo upload functionality
  initializePhotoUpload();
});

// ============================================
// Photo Upload & AI Analysis Section
// ============================================

const PHOTO_API_KEY = 'AIzaSyB-6dmOzUxNF5yWXwCeyfHgF9aYV8I8uVA';
// Use the new model and fallbacks
const PHOTO_MODELS = ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision'];

let selectedImageFile = null;

/**
 * Initialize photo upload functionality
 */
function initializePhotoUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const photoInput = document.getElementById('photoInput');
  const previewContainer = document.getElementById('previewContainer');
  const previewImage = document.getElementById('previewImage');
  const removePhotoBtn = document.getElementById('removePhoto');
  const analyzePhotoBtn = document.getElementById('analyzePhotoBtn');
  const photoResult = document.getElementById('photoResult');
  const photoLoading = document.getElementById('photoLoading');

  if (!uploadArea || !photoInput) return;

  // Click to upload
  uploadArea.addEventListener('click', () => {
    photoInput.click();
  });

  // File input change
  photoInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      alert('Please upload a valid image file.');
    }
  });

  // Remove photo
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      resetPhotoUpload();
    });
  }

  // Analyze photo
  if (analyzePhotoBtn) {
    analyzePhotoBtn.addEventListener('click', () => {
      if (selectedImageFile) {
        analyzePhotoWithAI(selectedImageFile);
      }
    });
  }
}

/**
 * Handle file selection
 */
function handleFileSelect(file) {
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, or JPEG).');
    return;
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size exceeds 10MB. Please select a smaller image.');
    return;
  }

  selectedImageFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('previewContainer');
    const uploadArea = document.getElementById('uploadArea');
    
    if (previewImage) {
      previewImage.src = e.target.result;
    }
    if (previewContainer) {
      previewContainer.style.display = 'block';
    }
    if (uploadArea) {
      uploadArea.style.display = 'none';
    }

    // Hide previous results
    const photoResult = document.getElementById('photoResult');
    if (photoResult) {
      photoResult.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Reset photo upload
 */
function resetPhotoUpload() {
  selectedImageFile = null;
  const photoInput = document.getElementById('photoInput');
  const previewContainer = document.getElementById('previewContainer');
  const uploadArea = document.getElementById('uploadArea');
  const photoResult = document.getElementById('photoResult');
  const photoLoading = document.getElementById('photoLoading');

  if (photoInput) photoInput.value = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (uploadArea) uploadArea.style.display = 'block';
  if (photoResult) photoResult.style.display = 'none';
  if (photoLoading) photoLoading.style.display = 'none';
}

/**
 * Analyze photo with Google Gemini API
 */
async function analyzePhotoWithAI(imageFile) {
  const photoLoading = document.getElementById('photoLoading');
  const photoResult = document.getElementById('photoResult');
  const photoResultContent = document.getElementById('photoResultContent');
  const analyzePhotoBtn = document.getElementById('analyzePhotoBtn');

  if (!photoLoading || !photoResult || !photoResultContent) return;

  // Show loading, hide result
  photoLoading.style.display = 'block';
  photoResult.style.display = 'none';
  if (analyzePhotoBtn) analyzePhotoBtn.disabled = true;

  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    // Determine MIME type
    const mimeType = imageFile.type || 'image/png';

    // Prepare prompt for crop identification and recommendations
    const prompt = `Analyze this agricultural image and provide the following information:
1. Identify the crop(s) visible in the image (if visible)
2. Assess the crop health and growth stage
3. Identify any visible issues (diseases, pests, nutrient deficiencies, water stress, etc.)
4. Provide specific, actionable recommendations for:
   - Fertilizer needs
   - Irrigation requirements
   - Pest/disease management (if applicable)
   - General care and best practices
5. Suggest optimal growing conditions for the identified crop(s)

Format the response in clear, structured paragraphs. If you cannot identify a specific crop, provide general agricultural recommendations based on what you observe.`;

    // Prepare request body
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048
      }
    };

    // Try different models and API versions
    const apiVersions = ['v1beta', 'v1'];
    let lastError = null;
    let data = null;

    for (const model of PHOTO_MODELS) {
      for (const apiVersion of apiVersions) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${encodeURIComponent(PHOTO_API_KEY)}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            data = await response.json();
            // Success! Break out of both loops
            break;
          } else {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            lastError = new Error(errorData.error?.message || `HTTP ${response.status}: Failed to get response`);
          }
        } catch (err) {
          lastError = err;
          continue; // Try next combination
        }
      }
      if (data) break; // If we got data, exit model loop too
    }

    // If we didn't get data, throw the last error
    if (!data) {
      throw lastError || new Error('Failed to connect to AI service. Please check your API key and try again.');
    }

    // Check for safety blocks
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    }

    // Extract response
    if (!data.candidates || !data.candidates.length) {
      throw new Error('No response from AI model');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error('Invalid response format');
    }

    // Get text from parts
    const textParts = candidate.content.parts
      .filter(part => part.text)
      .map(part => part.text);

    if (!textParts.length) {
      throw new Error('No text in response');
    }

    const aiResponse = textParts.join('\n').trim();

    // Display results
    photoLoading.style.display = 'none';
    photoResult.style.display = 'block';
    photoResultContent.innerHTML = formatAIResponse(aiResponse);

  } catch (error) {
    console.error('AI Analysis Error:', error);
    photoLoading.style.display = 'none';
    photoResult.style.display = 'block';
    photoResultContent.innerHTML = `
      <div style="color: #ef4444;">
        <strong>Error:</strong> ${error.message || 'Failed to analyze image. Please try again.'}
      </div>
    `;
  } finally {
    if (analyzePhotoBtn) analyzePhotoBtn.disabled = false;
  }
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format AI response for display
 */
function formatAIResponse(text) {
  // Convert plain text to formatted HTML
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  
  let html = '';
  paragraphs.forEach(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    // Check if it looks like a heading (short line, possibly with numbers)
    if (trimmed.length < 100 && /^\d+\./.test(trimmed)) {
      html += `<h5 style="margin: 16px 0 8px 0; color: var(--accent); font-size: 1.1rem;">${trimmed}</h5>`;
    } else {
      // Regular paragraph
      html += `<p style="margin-bottom: 12px;">${trimmed}</p>`;
    }
  });

  // If no formatting worked, just return the text as paragraphs
  if (!html) {
    html = `<p>${text.replace(/\n/g, '<br>')}</p>`;
  }

  return html;
}


