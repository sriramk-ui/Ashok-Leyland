import pandas as pd
import os

def generate_master_dataset():
    data = {
        "Site": ["Ennore Plant (TN)", "Hosur Hub (TN)", "Bhandara Estate (MH)", "Alwar Unit (RJ)", "Pantnagar Hub (UK)"],
        "Latitude": [13.216, 12.731, 21.176, 27.553, 29.030],
        "Longitude": [80.329, 77.831, 79.658, 76.634, 79.467],
        "Vendor Base": [0.95, 0.90, 0.70, 0.75, 0.80],
        "Manpower/Skill": [0.90, 0.85, 0.75, 0.80, 0.85],
        "Capex": [450, 520, 380, 410, 600],
        "Govt Norms/Tax SOPs": ["Standard", "High-Tech Subsidy", "Basic SOP", "Tax-Free Zone", "Extensive Incentives"],
        "Logistics Cost": [0.92, 0.88, 0.85, 0.75, 0.78],
        "Economies of Scale": [9, 8, 6, 7, 8],
        "Risk": ["Low", "Low", "Medium", "High", "Low"]
    }
    
    df = pd.DataFrame(data)
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    output_path = os.path.join(data_dir, "master_sample.csv")
    df.to_csv(output_path, index=False)
    print(f"Successfully generated master sample at {output_path}")

if __name__ == "__main__":
    generate_master_dataset()
