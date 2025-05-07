conditions = ["Covid-19", "Pneumonia"]
# Prior probabilities (base rates in general population)
priors = {
    "Covid-19": 0.05,  # Base rate of COVID-19 in population
    "Pneumonia": 0.03,  # Base rate of pneumonia in population
}

# Conditional probabilities P(symptom|disease)
likelihood = {
    "Covid-19": {
        "cough": 0.65,           # P(cough|covid)
        "headache": 0.60,        # P(headache|covid)
        "loss_of_smell": 0.70,   # P(loss_of_smell|covid)
        "fever": 0.75,           # P(fever|covid)
        "high_heart_rate": 0.40, # P(high_heart_rate|covid)
        "high_bp": 0.30,         # P(high_bp|covid)
    },
    "Pneumonia": {
        "cough": 0.80,           # P(cough|pneumonia)
        "headache": 0.35,        # P(headache|pneumonia)
        "loss_of_smell": 0.10,   # P(loss_of_smell|pneumonia)
        "fever": 0.80,           # P(fever|pneumonia)
        "high_heart_rate": 0.60, # P(high_heart_rate|pneumonia)
        "high_bp": 0.25,         # P(high_bp|pneumonia)
    }
}

# Probability of symptoms in general population
base_rates = {
    "cough": 0.15,
    "headache": 0.25,
    "loss_of_smell": 0.10,
    "fever": 0.05,
    "high_heart_rate": 0.10,
    "high_bp": 0.20,
}

def calculate(systolic_pressure: int, diastolic_pressure: int, temperature: float, heart_rate: int, 
              has_cough: bool, has_headache: bool, can_smell: bool, age: float, gender: str, 
              has_pneumonia: bool) -> dict:
    """
    Calculate probability of COVID-19 and Pneumonia based on Bayesian probability.
    
    Args:
        systolic_pressure: Upper blood pressure value (mmHg)
        diastolic_pressure: Lower blood pressure value (mmHg)
        temperature: Body temperature in Celsius
        heart_rate: Heart rate in beats per minute
        has_cough: Whether patient has cough
        has_headache: Whether patient has headache
        can_smell: Whether patient can smell (false means loss of smell)
        age: Patient age in years
        gender: Patient gender ('M' or 'F')
        has_pneumonia: Whether patient already has pneumonia diagnosis
        
    Returns:
        Dictionary with probabilities for each condition
    """
    # Define thresholds for vital signs
    FEVER_THRESHOLD = 37.8  # Celsius
    ELEVATED_HR_THRESHOLD = 90  # bpm
    HIGH_SYSTOLIC_BP_THRESHOLD = 130  # mmHg
    HIGH_DIASTOLIC_BP_THRESHOLD = 80  # mmHg
    
    # Determine observed symptoms/states based on parameters
    observed_symptoms = {
        "cough": has_cough,
        "headache": has_headache,
        "loss_of_smell": not can_smell,
        "fever": temperature > FEVER_THRESHOLD,
        "high_heart_rate": heart_rate > ELEVATED_HR_THRESHOLD,
        "high_bp": systolic_pressure > HIGH_SYSTOLIC_BP_THRESHOLD or diastolic_pressure > HIGH_DIASTOLIC_BP_THRESHOLD
    }
    
    # Start with prior probabilities
    posteriors = {
        "Covid-19": priors["Covid-19"],
        "Pneumonia": priors["Pneumonia"]
    }
    
    # Apply Bayes' theorem for each observed symptom/state
    for disease in conditions:
        for symptom, is_present in observed_symptoms.items():
            if is_present:
                # P(Disease|Symptom) = P(Symptom|Disease) * P(Disease) / P(Symptom)
                posteriors[disease] = (likelihood[disease][symptom] * posteriors[disease]) / base_rates[symptom]
            else:
                # P(Disease|Not Symptom) = (1-P(Symptom|Disease)) * P(Disease) / (1-P(Symptom))
                posteriors[disease] = ((1 - likelihood[disease][symptom]) * posteriors[disease]) / (1 - base_rates[symptom])
    
    # Age adjustment (Bayesian update with age factor)
    age_factor = min(1.0, age / 80)
    for disease in conditions:
        age_likelihood = 0.3 + (0.5 * age_factor)  # Higher likelihood with age
        posteriors[disease] = posteriors[disease] * age_likelihood / (
            posteriors[disease] * age_likelihood + (1 - posteriors[disease]) * (1 - age_likelihood)
        )
    
    # Gender adjustment (men have higher risk)
    if gender.upper() == 'MALE':
        for disease in conditions:
            gender_factor = 1.2  # Likelihood ratio for male
            posteriors[disease] = posteriors[disease] * gender_factor / (
                posteriors[disease] * gender_factor + (1 - posteriors[disease])
            )
    
    # If pneumonia is confirmed, adjust probabilities
    if has_pneumonia:
        posteriors["Pneumonia"] = 0.95
        # COVID-19 more likely if pneumonia present (conditional probability)
        covid_given_pneumonia = 0.30  # P(Covid|Pneumonia)
        posteriors["Covid-19"] = max(posteriors["Covid-19"], covid_given_pneumonia)
    
   
    # Normalize probabilities to percentages and cap at 95%
    covid_probability = min(0.95, posteriors["Covid-19"]) * 100
    pneumonia_probability = min(0.95, posteriors["Pneumonia"]) * 100
    
    return {
        "Covid-19": round(covid_probability, 2),
        "Pneumonia": round(pneumonia_probability, 2),
    }

def print_test_result(test_name, params, result):
    """Helper to print test results in a structured way"""
    print(f"\n=== {test_name} ===")
    print(f"Parameters: {params}")
    print(f"Results: {result}")
    
def run_tests():
    """Run various test scenarios for the calculate function"""
    
    # Test Case 1: Healthy individual with normal vitals
    params = {
        "systolic_pressure": 120, 
        "diastolic_pressure": 75,
        "temperature": 36.8, 
        "heart_rate": 72,
        "has_cough": False, 
        "has_headache": False, 
        "can_smell": True,
        "age": 35, 
        "gender": "F", 
        "has_pneumonia": False
    }
    result = calculate(**params)
    print_test_result("Healthy Individual", params, result)
    
    # Test Case 2: COVID-19 typical presentation
    params = {
        "systolic_pressure": 135, 
        "diastolic_pressure": 85,
        "temperature": 38.5, 
        "heart_rate": 95,
        "has_cough": True, 
        "has_headache": True, 
        "can_smell": False,
        "age": 45, 
        "gender": "M", 
        "has_pneumonia": False
    }
    result = calculate(**params)
    print_test_result("COVID-19 Typical Presentation", params, result)
    
    # Test Case 3: Pneumonia typical presentation
    params = {
        "systolic_pressure": 125, 
        "diastolic_pressure": 78,
        "temperature": 39.0, 
        "heart_rate": 110,
        "has_cough": True, 
        "has_headache": False, 
        "can_smell": True,
        "age": 68, 
        "gender": "M", 
        "has_pneumonia": True
    }
    result = calculate(**params)
    print_test_result("Pneumonia Confirmed", params, result)
    
    # Test Case 4: Older patient with borderline vitals
    params = {
        "systolic_pressure": 145, 
        "diastolic_pressure": 90,
        "temperature": 37.9, 
        "heart_rate": 92,
        "has_cough": True, 
        "has_headache": True, 
        "can_smell": True,
        "age": 75, 
        "gender": "F", 
        "has_pneumonia": False
    }
    result = calculate(**params)
    print_test_result("Older Patient with Borderline Vitals", params, result)
    
    # Test Case 5: Both conditions likely
    params = {
        "systolic_pressure": 140, 
        "diastolic_pressure": 88,
        "temperature": 38.7, 
        "heart_rate": 105,
        "has_cough": True, 
        "has_headache": True, 
        "can_smell": False,
        "age": 62, 
        "gender": "M", 
        "has_pneumonia": True
    }
    result = calculate(**params)
    print_test_result("Likely Both Conditions", params, result)
    
# run_tests()