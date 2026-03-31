import numpy as np

def topsis(data, weights, is_benefit):
    """
    TOPSIS implementation
    data: Alternatives x Criteria matrix (np.array)
    weights: List of weights (sum = 1)
    is_benefit: List of booleans (True if benefit criterion, False if cost)
    """
    X = np.array(data, dtype=float)
    w = np.array(weights)
    
    # 1. Normalization (Euclidean)
    norm = np.linalg.norm(X, axis=0)
    # Handle zero norm
    norm[norm == 0] = 1
    R = X / norm
    
    # 2. Weighted normalization
    V = R * w
    
    # 3. Ideal and Anti-ideal solutions
    v_plus = np.zeros(X.shape[1])
    v_minus = np.zeros(X.shape[1])
    
    for j in range(X.shape[1]):
        if is_benefit[j]:
            v_plus[j] = np.max(V[:, j])
            v_minus[j] = np.min(V[:, j])
        else:
            v_plus[j] = np.min(V[:, j])
            v_minus[j] = np.max(V[:, j])
            
    # 4. Separation measures
    s_plus = np.sqrt(np.sum((V - v_plus)**2, axis=1))
    s_minus = np.sqrt(np.sum((V - v_minus)**2, axis=1))
    
    # 5. Relative closeness to ideal
    scores = s_minus / (s_plus + s_minus)
    return scores.tolist()

def vikor(data, weights, is_benefit, v=0.5):
    """
    VIKOR implementation
    data: Alternatives x Criteria matrix (np.array)
    weights: List of weights (sum = 1)
    is_benefit: List of booleans (True if benefit criterion, False if cost)
    v: Weight of strategies (0.5 is consensus)
    """
    X = np.array(data, dtype=float)
    w = np.array(weights)
    
    # 1. Best ($f^*$) and Worst ($f^-$) values
    f_star = np.zeros(X.shape[1])
    f_minus = np.zeros(X.shape[1])
    
    for j in range(X.shape[1]):
        if is_benefit[j]:
            f_star[j] = np.max(X[:, j])
            f_minus[j] = np.min(X[:, j])
        else:
            f_star[j] = np.min(X[:, j])
            f_minus[j] = np.max(X[:, j])
            
    # 2. Utility ($S$) and Regret ($R$)
    S = np.zeros(X.shape[0])
    R = np.zeros(X.shape[0])
    
    for i in range(X.shape[0]):
        # S_i = sum(w_j * (f*_j - f_ij) / (f*_j - f-_j))
        # R_i = max(w_j * (f*_j - f_ij) / (f*_j - f-_j))
        normalized_diff = []
        for j in range(X.shape[1]):
            diff = (f_star[j] - X[i, j]) / (f_star[j] - f_minus[j]) if f_star[j] != f_minus[j] else 0
            normalized_diff.append(w[j] * diff)
        
        S[i] = np.sum(normalized_diff)
        R[i] = np.max(normalized_diff)
        
    # 3. Overall ranking measure ($Q$)
    S_star = np.min(S)
    S_minus = np.max(S)
    R_star = np.min(R)
    R_minus = np.max(R)
    
    den_S = S_minus - S_star if S_minus != S_star else 1
    den_R = R_minus - R_star if R_minus != R_star else 1
    
    Q = v * (S - S_star) / den_S + (1 - v) * (R - R_star) / den_R
    
    return {
        "S": S.tolist(),
        "R": R.tolist(),
        "Q": Q.tolist()
    }

if __name__ == "__main__":
    data = [
        [250, 16, 12, 5],
        [200, 16, 8, 3],
        [300, 32, 16, 4],
        [275, 32, 8, 2]
    ]
    weights = [0.25, 0.25, 0.25, 0.25]
    is_benefit = [True, True, True, True]
    print("TOPSIS:", topsis(data, weights, is_benefit))
    print("VIKOR:", vikor(data, weights, is_benefit))
