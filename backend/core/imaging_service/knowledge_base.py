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
        Dictionary with probabilities for each condition (values between 0 and 1)
    """
    # Define thresholds for vital signs
    FEVER_THRESHOLD = 37.8  # Celsius
    ELEVATED_HR_THRESHOLD = 90  # bpm
    HIGH_SYSTOLIC_BP_THRESHOLD = 130  # mmHg
    HIGH_DIASTOLIC_BP_THRESHOLD = 90  # mmHg
    
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
    
    covid_probability = min(0.95, posteriors["Covid-19"])
    pneumonia_probability = min(0.95, posteriors["Pneumonia"])
    
    return {
        "Covid-19": round(covid_probability, 2),
        "Pneumonia": round(pneumonia_probability, 2),
    }