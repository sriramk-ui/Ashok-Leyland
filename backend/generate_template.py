import pandas as pd

def generate_template():
    data = {
        "Site": ["Delhi Cluster", "Bangalore Hub", "Gujarat Estate", "Kolkata Port"],
        "Vendor Base": [0.85, 0.90, 0.88, 0.70],
        "Manpower/Skill": [0.80, 0.95, 0.75, 0.85],
        "Capex": [550, 620, 480, 410],
        "Govt Norms/Tax SOPs": ["High", "Medium", "SOP-1", "SOP-2"],
        "Logistics Cost": [0.85, 0.78, 0.95, 0.80],
        "Economies of Scale": [9, 8, 9, 6],
        "Risk": ["Low", "Low", "Medium", "High"]
    }
    
    df = pd.DataFrame(data)
    
    output_path = "c:/Users/Saravanan.P/OneDrive/Documents/ANTI_GRAVITY/ASHOK_LEYLAND/example_plant_data.xlsx"
    df.to_excel(output_path, index=False)
    print(f"Successfully generated template at {output_path}")

if __name__ == "__main__":
    generate_template()
