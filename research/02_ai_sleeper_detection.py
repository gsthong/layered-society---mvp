import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import os

print('--- Layered Society: Sleeper Agent Anomaly Detection ---')

csv_path = '../ml-agent-dataset.csv'
if not os.path.exists(csv_path):
    print(f'Please generate {csv_path} by clicking [ML DATA] in the UI first.')
    exit()

# Load agent-level time-series data
df = pd.read_csv(csv_path)

# Feature Engineering: Aggregate behaviors per agent (group by run_seed and agentId)
if 'run_seed' in df.columns:
    agent_features = df.groupby(['run_seed', 'agentId']).agg({
        'belief': ['mean', 'std', 'max'],
        'llr': ['mean', 'min'],
        'speed': 'mean',
        'distanceTraveled': 'max',
        'isSleeper': 'first'  # Ground truth
    }).reset_index()
    agent_features.columns = ['run_seed', 'agentId', 'belief_mean', 'belief_std', 'belief_max', 'llr_mean', 'llr_min', 'speed_mean', 'distance_max', 'isSleeper']
else:
    agent_features = df.groupby('agentId').agg({
        'belief': ['mean', 'std', 'max'],
        'llr': ['mean', 'min'],
        'speed': 'mean',
        'distanceTraveled': 'max',
        'isSleeper': 'first'  # Ground truth
    }).reset_index()
    agent_features.columns = ['agentId', 'belief_mean', 'belief_std', 'belief_max', 'llr_mean', 'llr_min', 'speed_mean', 'distance_max', 'isSleeper']

# Fill NaNs from std if only 1 sample
agent_features = agent_features.fillna(0)

print(f"Total Agents in Dataset (Across all runs): {len(agent_features)}")
print(f"Total True Sleepers: {agent_features['isSleeper'].sum()}")

# ---------------------------------------------------------
# METHOD 1: HEURISTIC BASELINE
# Rule: If average belief > 0.85 and std < 0.1, it's a Sleeper
# ---------------------------------------------------------
print('\n=======================================')
print('METHOD 1: Rule-Based Heuristic Baseline')
print('=======================================')
agent_features['pred_heuristic'] = np.where((agent_features['belief_mean'] > 0.85) & (agent_features['belief_std'] < 0.1), 1, 0)
print(confusion_matrix(agent_features['isSleeper'], agent_features['pred_heuristic']))
print(classification_report(agent_features['isSleeper'], agent_features['pred_heuristic'], target_names=['Citizen', 'Sleeper']))


# Prepare features for ML (Unsupervised, we do NOT use isSleeper)
X = agent_features[['belief_mean', 'belief_std', 'belief_max', 'llr_mean', 'llr_min', 'speed_mean']]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ---------------------------------------------------------
# METHOD 2: ONE-CLASS SVM (Unsupervised)
# ---------------------------------------------------------
print('\n=======================================')
print('METHOD 2: One-Class SVM')
print('=======================================')
ocsvm = OneClassSVM(nu=0.15, kernel='rbf', gamma='scale')
agent_features['pred_ocsvm_anomaly'] = ocsvm.fit_predict(X_scaled)
agent_features['pred_ocsvm'] = np.where(agent_features['pred_ocsvm_anomaly'] == -1, 1, 0)
print(confusion_matrix(agent_features['isSleeper'], agent_features['pred_ocsvm']))
print(classification_report(agent_features['isSleeper'], agent_features['pred_ocsvm'], target_names=['Citizen', 'Sleeper']))


# ---------------------------------------------------------
# METHOD 3: ISOLATION FOREST (Unsupervised)
# ---------------------------------------------------------
print('\n=======================================')
print('METHOD 3: Isolation Forest')
print('=======================================')
# Contamination is expected ratio of outliers. 
iso = IsolationForest(contamination=0.15, random_state=42)
agent_features['pred_iso_anomaly'] = iso.fit_predict(X_scaled)
agent_features['pred_iso'] = np.where(agent_features['pred_iso_anomaly'] == -1, 1, 0)
print(confusion_matrix(agent_features['isSleeper'], agent_features['pred_iso']))
print(classification_report(agent_features['isSleeper'], agent_features['pred_iso'], target_names=['Citizen', 'Sleeper']))

print('\nComparison complete!')
