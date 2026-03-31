from pydantic import BaseModel
from typing import List, Dict, Optional

class AHPInput(BaseModel):
    matrix: List[List[float]]

class TOPSISInput(BaseModel):
    data: List[List[float]]
    weights: List[float]
    is_benefit: List[bool]

class VIKORInput(BaseModel):
    data: List[List[float]]
    weights: List[float]
    is_benefit: List[bool]
    v: Optional[float] = 0.5

class OptimizationInput(BaseModel):
    sites: List[str]
    demands: Dict[str, float]
    costs: Dict[str, Dict[str, float]]
    capacities: Dict[str, float]

class ExportInput(BaseModel):
    data: List[Dict]
