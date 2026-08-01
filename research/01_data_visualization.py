import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import os

print('--- Layered Society: Data Visualization (Multi-Seed) ---')

csv_path = '../layered-society-batch-run.csv'
if not os.path.exists(csv_path):
    print(f'Please generate {csv_path} by clicking [BATCH CSV] in the UI first.')
    exit()

df = pd.read_csv(csv_path)

plt.figure(figsize=(12, 6))

# Seaborn lineplot automatically handles multiple runs and plots 95% Confidence Intervals
sns.lineplot(data=df, x='tick', y='avgBelief', color='red', label='Avg Panic / Misinformation')
sns.lineplot(data=df, x='tick', y='socialCohesion', color='blue', label='Social Cohesion')
sns.lineplot(data=df, x='tick', y='fModifier', color='green', label='Defense Strictness (f-Modifier)')

plt.title('Multi-Seed Simulation: Social Contagion & Evolutionary Defense')
plt.xlabel('Simulation Tick')
plt.ylabel('Metric Value (0.0 - 1.0)')
plt.ylim(-0.05, 1.05)
if 'run_seed' in df.columns:
    plt.text(0, 1.02, f"Aggregated over {df['run_seed'].nunique()} distinct random seeds", fontsize=9, style='italic')
plt.legend()
plt.grid(True, alpha=0.3)

out_path = '01_contagion_plot.png'
plt.savefig(out_path, dpi=300, bbox_inches='tight')
print(f'Saved plot to {out_path}')
