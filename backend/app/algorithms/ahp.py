import numpy as np

def calculate_ahp_weights(matrix):
    """
    Calculate weights using the Analytic Hierarchy Process (AHP).
    matrix: square pairwise comparison matrix (List of Lists or np.array)
    """
    A = np.array(matrix)
    n = A.shape[0]
    
    # 1. Calculate the priority vector (Eigenvector method approximation)
    # Sum each column
    column_sums = A.sum(axis=0)
    # Normalize the matrix
    normalized_matrix = A / column_sums
    # Average of each row is the weight
    weights = normalized_matrix.mean(axis=1)
    
    # 2. Consistency Check
    # Find weighted sum vector
    weighted_sum_vector = np.dot(A, weights)
    # λ_max (average of weighted_sum_vector / weights)
    lambda_max = np.mean(weighted_sum_vector / weights)
    
    # Consistency Index (CI)
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0
    
    # Random Index (RI) values for n up to 10
    ri_values = {1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}
    ri = ri_values.get(n, 1.49)
    
    # Consistency Ratio (CR)
    cr = ci / ri if ri > 0 else 0
    
    return {
        "weights": weights.tolist(),
        "lambda_max": float(lambda_max),
        "ci": float(ci),
        "cr": float(cr),
        "is_consistent": bool(cr < 0.1)
    }

if __name__ == "__main__":
    # Example: 3 criteria
    # matrix = [
    #     [1, 3, 5],
    #     [1/3, 1, 3],
    #     [1/5, 1/3, 1]
    # ]
    matrix = [
        [1, 0.33, 0.2],
        [3, 1, 0.33],
        [5, 3, 1]
    ]
    print(calculate_ahp_weights(matrix))
