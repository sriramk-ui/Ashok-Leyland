from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.algorithms import ahp, ranking, optimization
from app.schemas.models import AHPInput, TOPSISInput, VIKORInput, OptimizationInput, ExportInput
from app.services import export_service
import pandas as pd
import numpy as np
import io
import os

app = FastAPI(title="Smart Plant Location DSS API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Ashok Leyland Smart Plant Location DSS API"}

@app.post("/analyze/ahp")
def calculate_ahp(input_data: AHPInput):
    try:
        return ahp.calculate_ahp_weights(input_data.matrix)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/topsis")
def calculate_topsis(input_data: TOPSISInput):
    try:
        scores = ranking.topsis(input_data.data, input_data.weights, input_data.is_benefit)
        return {"scores": scores}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/vikor")
def calculate_vikor(input_data: VIKORInput):
    try:
        results = ranking.vikor(input_data.data, input_data.weights, input_data.is_benefit, input_data.v)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/optimize")
def run_optimization(input_data: OptimizationInput):
    try:
        results = optimization.optimize_allocation(
            input_data.sites, 
            input_data.demands, 
            input_data.costs, 
            input_data.capacities
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/sample-dataset")
async def get_sample_dataset():
    try:
        sample_path = os.path.join(os.path.dirname(__file__), "../data/master_sample.csv")
        if not os.path.exists(sample_path):
            import generate_master_dataset
            generate_master_dataset.generate_master_dataset()
            if not os.path.exists(sample_path):
                raise HTTPException(status_code=404, detail="Sample dataset not found")
        
        df = pd.read_csv(sample_path)
        
        required_cols = ["Site", "Vendor Base", "Manpower/Skill", "Capex", "Govt Norms/Tax SOPs", "Logistics Cost", "Economies of Scale"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            return {"error": f"Missing baseline columns in sample: {missing}"}
            
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        data = df.to_dict(orient="records")
        return {"data": data, "features": numeric_cols, "columns": df.columns.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/excel")
async def upload_excel(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Validation
        required_cols = ["Site", "Vendor Base", "Manpower/Skill", "Capex", "Govt Norms/Tax SOPs", "Logistics Cost", "Economies of Scale"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            return {"error": f"Missing baseline columns: {missing}"}
            
        # Dynamically grab all numeric features for algorithms
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        data = df.to_dict(orient="records")
        return {"data": data, "features": numeric_cols, "columns": df.columns.tolist()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/export/analytics")
def export_analytics(input_data: ExportInput):
    file_output = export_service.generate_dynamic_excel_report(input_data.data)
    return StreamingResponse(
        file_output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Ashok_Leyland_Dynamic_Analytics.xlsx"}
    )

@app.get("/download/template")
def download_template():
    return StreamingResponse(
        open("c:/Users/Saravanan.P/OneDrive/Documents/ANTI_GRAVITY/ASHOK_LEYLAND/example_plant_data.xlsx", "rb"), 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Ashok_Leyland_Template.xlsx"}
    )

@app.get("/export/pdf")
def export_pdf():
    summary_data = {
        "title": "Smart Plant Location DSS - Executive Summary",
        "description": "Comprehensive analysis of candidate sites for Ashok Leyland's plant expansion using AHP, TOPSIS, and VIKOR algorithms.",
        "top_recommendations": [
            {"name": "Oragadam, Tamil Nadu", "score": 0.942, "status": "Best Compromise"},
            {"name": "Pune Cluster, MH", "score": 0.892, "status": "Strong Alternative"},
            {"name": "Hosur Hub, TN", "score": 0.854, "status": "Expansion Ready"}
        ]
    }
    file_output = export_service.generate_pdf_summary(summary_data)
    return StreamingResponse(
        file_output, 
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Ashok_Leyland_DSS_Summary.pdf"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
