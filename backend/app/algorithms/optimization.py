from pulp import LpMinimize, LpProblem, LpStatus, lpSum, LpVariable

def optimize_allocation(sites, demands, costs, capacities):
    """
    Mixed Integer Programming for plant allocation optimization.
    sites: List of candidate sites
    demands: Dictionary of demand points and their requirements
    costs: 2D dictionary {site: {demand_point: cost}}
    capacities: Dictionary of site capacities
    """
    # Create the model
    model = LpProblem(name="Plant_Location_Optimization", sense=LpMinimize)
    
    # Decision variables: x[i][j] is the amount shipped from site i to demand point j
    # y[i] is a binary variable: 1 if plant is built at site i, 0 otherwise
    x = {(i, j): LpVariable(name=f"x_{i}_{j}", lowBound=0) for i in sites for j in demands}
    y = {i: LpVariable(name=f"y_{i}", cat="Binary") for i in sites}
    
    # Objective function: Minimize total shipping cost + fixed cost (simplified capex)
    # For now, let's assume a fixed cost of building a plant at site i is 1,000,000 (just for the model)
    fixed_costs = {i: 1000000 for i in sites} 
    
    model += (
        lpSum(x[i, j] * costs[i][j] for i in sites for j in demands) +
        lpSum(y[i] * fixed_costs[i] for i in sites)
    )
    
    # Constraints
    # 1. Demand must be met for each demand point
    for j in demands:
        model += (lpSum(x[i, j] for i in sites) >= demands[j], f"Demand_{j}")
        
    # 2. Capacity constraint for each site
    for i in sites:
        model += (lpSum(x[i, j] for j in demands) <= capacities[i] * y[i], f"Capacity_{i}")
        
    # Solve the model
    status = model.solve()
    
    results = {
        "status": LpStatus[status],
        "total_cost": model.objective.value(),
        "allocations": {f"{i}->{j}": x[i, j].value() for i in sites for j in demands if x[i, j].value() > 0},
        "built_plants": [i for i in sites if y[i].value() > 0.5]
    }
    
    return results

if __name__ == "__main__":
    sites = ["Chennai", "Pune", "Hoseur"]
    demands = {"North": 500, "South": 800, "West": 400}
    costs = {
        "Chennai": {"North": 50, "South": 10, "West": 40},
        "Pune": {"North": 30, "South": 40, "West": 15},
        "Hoseur": {"North": 45, "South": 15, "West": 35}
    }
    capacities = {"Chennai": 1000, "Pune": 1000, "Hoseur": 1000}
    
    print(optimize_allocation(sites, demands, costs, capacities))
