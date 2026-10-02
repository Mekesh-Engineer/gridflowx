# 🚀 Training 11: Google Colab Training Guide & Notebook Pipeline

**Document ID:** `GFX-AI-SPEC-11`  
**Classification:** Model Engineering & Training Operations Manual  
**Version:** `2.0.0-PROD`  
**Target Platform:** Google Colab (T4 / V100 GPU Runtimes)  
**Output Artifacts:** PyTorch Models (`.pth`) · Joblib Models & Scalers (`.joblib` / `.pkl`) · RL Policies (`.zip`) · Model Registry JSON  

---

## 1. Overview & Google Drive Hierarchy
Google Colab serves as the primary development and training environment for all numerical, deep learning, statistical, and reinforcement learning models within GridFlowX. Trained model weights, scalers, and evaluation reports are exported directly to a structured Google Drive directory for deployment into the FastAPI production backend.

```
/content/drive/MyDrive/GridFlowX_AI/
│
├── datasets/
│   ├── raw/                      # raw_telemetry_2026.parquet
│   ├── processed/                # X_solar_train.npy, Y_solar_train.npy, etc.
│   └── public/                   # nsrdb_solar.csv, pecan_street_load.csv
│
├── notebooks/                    # Sequential Colab Notebooks
│   ├── 01_Data_Exploration_and_EDA.ipynb
│   ├── 02_Data_Preprocessing_and_Sliding_Window.ipynb
│   ├── 03_Solar_Forecasting_LSTM.ipynb
│   ├── 04_Solar_Forecasting_Transformer_Baseline.ipynb
│   ├── 05_Load_Forecasting_ARIMA.ipynb
│   ├── 06_Load_Forecasting_LSTM_Extension.ipynb
│   ├── 07_Battery_Health_LSTM.ipynb
│   ├── 08_Battery_Degradation_Baselines.ipynb
│   ├── 09_Fault_Detection_Data_Preparation.ipynb
│   ├── 10_Fault_Detection_IsolationForest.ipynb
│   ├── 11_Gymnasium_Microgrid_Environment.ipynb
│   ├── 12_RL_Energy_Management_Training.ipynb
│   ├── 13_Model_Evaluation_and_Comparison.ipynb
│   └── 14_Model_Export_and_Packaging.ipynb
│
├── models/                       # Checkpoints (.pth, .joblib, .zip)
│
└── exports/                      # Final Production Artifacts
    ├── weights/                  # solar_lstm_v1.pth, battery_lstm_v1.pth
    ├── classical/                # load_arima_v1.joblib, isoforest_v1.joblib
    ├── rl/                       # energy_rl_policy_v1.zip
    ├── scalers/                  # scaler_solar_v1.pkl, scaler_battery_v1.pkl
    └── registry.json             # Master metadata catalog
```

---

## 2. Universal Colab Setup Cell & Kaggle Ingestion Pipeline

```python
# Cell 1: Environment Initialization & Dependency Installation
from google.colab import drive
import os
import sys

# Mount Google Drive
drive.mount('/content/drive')
BASE_DIR = '/content/drive/MyDrive/GridFlowX_AI'
os.makedirs(f"{BASE_DIR}/datasets/kaggle", exist_ok=True)
os.makedirs(f"{BASE_DIR}/exports/weights", exist_ok=True)
os.makedirs(f"{BASE_DIR}/exports/classical", exist_ok=True)
os.makedirs(f"{BASE_DIR}/exports/rl", exist_ok=True)
os.makedirs(f"{BASE_DIR}/exports/scalers", exist_ok=True)

# Install Core Frameworks and Kaggle Client
!pip install -q \
    torch==2.2.1 torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 \
    stable-baselines3[extra]==2.2.1 \
    gymnasium==0.29.1 \
    pmdarima==2.0.4 \
    scikit-learn==1.4.0 \
    statsmodels==0.14.1 \
    optuna==3.5.0 \
    kagglehub kaggle \
    pandas numpy matplotlib seaborn joblib

# Automated Kaggle Dataset Download Utility
import kagglehub

def fetch_kaggle_dataset(dataset_handle: str, target_dir: str):
    """Downloads authoritative Kaggle dataset and synchronizes to Drive."""
    print(f"📥 Downloading Kaggle dataset: {dataset_handle}...")
    path = kagglehub.dataset_download(dataset_handle)
    print(f"✅ Downloaded to: {path}")
    return path
```

---

## 3. Specialized Training Notebook Workflows & Kaggle Datasets

### 3.1. Track A: Solar Forecasting (`03_Solar_Forecasting_LSTM.ipynb`)
- **Authoritative Kaggle Dataset:** [Solar Power Generation Data](https://www.kaggle.com/datasets/anikannal/solar-power-generation-data) (`anikannal/solar-power-generation-data`)
  ```python
  solar_data_path = fetch_kaggle_dataset("anikannal/solar-power-generation-data", f"{BASE_DIR}/datasets/kaggle/solar")
  ```
- **Relevant Features:** `DC_POWER`, `AC_POWER`, `DAILY_YIELD`, `TOTAL_YIELD`, `AMBIENT_TEMPERATURE`, `MODULE_TEMPERATURE`, `IRRADIATION`, `sin_hour`, `cos_hour`, $K_t$.
- **Target Variables:** Rolling 4-step power $\hat{P}_{\text{solar}}$ ($t+15\text{m}, 30\text{m}, 45\text{m}, 60\text{m}$) in Watts.
- **Input Tensor:** `X_solar_train.npy` (Shape: $[N, 96, 10]$).
- **Primary Model:** `SolarLSTMForecaster` (2 Stacked LSTM layers, $d_{\text{hidden}}=64$, linear projection head).
- **Loss:** Combined Huber Loss ($\delta=1.0$) + Asymmetric Peak Penalty ($0.15 \cdot \text{ReLU}(y - \hat{y})^2$).
- **Why Best Suited:** Native 15-minute time steps match GridFlowX's 96-step diurnal lookback tensor; integrates coupled module surface temperature and direct irradiance with electrical inverter output.
- **Output:** Export to `exports/weights/solar_lstm_v1.pth` ($1.8\,\text{MB}$) & `exports/scalers/scaler_solar_v1.pkl`.

### 3.2. Track B: Load Demand Forecasting (`05_Load_Forecasting_ARIMA.ipynb`)
- **Authoritative Kaggle Dataset:** [Individual Household Electric Power Consumption](https://www.kaggle.com/datasets/uciml/electric-power-consumption) (`uciml/electric-power-consumption`)
  ```python
  load_data_path = fetch_kaggle_dataset("uciml/electric-power-consumption", f"{BASE_DIR}/datasets/kaggle/load")
  ```
- **Relevant Features:** `Global_active_power` ($kW$), `Global_reactive_power`, `Voltage`, `Global_intensity`, `Sub_metering_1` (kitchen), `Sub_metering_2` (laundry/fridge), `Sub_metering_3` (water-heater/AC).
- **Target Variables:** 4-step rolling aggregate demand $\hat{P}_{\text{load}}$ ($15, 30, 45, 60\,\text{min}$) and sub-channel priority allocations (Tiers 1–4).
- **Primary Model:** $\text{ARIMA}(p, d, q)$ parameterized via Auto-ARIMA stationarity tests (ADF/KPSS) and AIC minimization ($p=2, d=1, q=2$).
- **Why Best Suited:** 2.07 million continuous 1-minute measurements across 47 months capturing authentic appliance step-spikes and 3 sub-metered circuits mapping 1:1 to GridFlowX's 4 priority relay tiers.
- **Output:** Export to `exports/classical/load_arima_v1.joblib` ($850\,\text{KB}$).

### 3.3. Track C: Battery Health Diagnostics (`07_Battery_Health_LSTM.ipynb`)
- **Authoritative Kaggle Dataset:** [NASA Battery Dataset](https://www.kaggle.com/datasets/patrickfleith/nasa-battery-dataset) (`patrickfleith/nasa-battery-dataset`)
  ```python
  battery_data_path = fetch_kaggle_dataset("patrickfleith/nasa-battery-dataset", f"{BASE_DIR}/datasets/kaggle/battery")
  ```
- **Relevant Features:** `Voltage_measured`, `Current_measured`, `Temperature_measured`, `Current_load`, `Voltage_load`, cycle index, cumulative $Ah$ throughput, CC/CV phase durations, EIS parameters ($R_e, R_{ct}$).
- **Target Variables:** True Usable Capacity ($Q_{\text{actual}}$ in $Ah$), State of Health (SoH %), Internal Equivalent Series Resistance ($R_{\text{ESR}}$ in $m\Omega$), and Remaining Useful Life (RUL in cycles).
- **Input Sequence:** Cycle sequence tensor ($X_{\text{batt}}$ shape: $[N, 50, 8]$).
- **Primary Model:** `BatteryHealthLSTM` (2 Stacked LSTM layers with dual multi-task heads for SoH % and ESR $m\Omega$).
- **Why Best Suited:** Gold-standard experimental Li-ion cell run-to-failure aging under controlled thermal chambers ($4^\circ\text{C}, 24^\circ\text{C}, 44^\circ\text{C}$) providing authentic Arrhenius degradation trajectories.
- **Output:** Export to `exports/weights/battery_lstm_v1.pth` ($1.4\,\text{MB}$) & `exports/scalers/scaler_battery_v1.pkl`.

### 3.4. Track D: Fault Detection & Screening (`10_Fault_Detection_IsolationForest.ipynb`)
- **Authoritative Kaggle Dataset:** [Electrical Grid Stability Simulated Data](https://www.kaggle.com/datasets/pcbreviglieri/smart-grid-stability) (`pcbreviglieri/smart-grid-stability`)
  ```python
  fault_data_path = fetch_kaggle_dataset("pcbreviglieri/smart-grid-stability", f"{BASE_DIR}/datasets/kaggle/fault")
  ```
- **Relevant Features:** Reaction time constants `tau1..4`, power flows `p1..4`, price elasticity `g1..4`, paired with 10-feature microgrid vector ($V_{\text{pv}}, I_{\text{pv}}, V_{\text{batt}}, I_{\text{batt}}, T_{\text{batt}}, T_{\text{heatsink}}, P_{\text{load}}, \sigma(V_{\text{bus}}), V_{\text{grid}}$, relay consistency).
- **Target Variables:** Stability classification `stabf`, continuous anomaly score $s(x) \in [0.0, 1.0]$ ($\tau = 0.60$), and 8 hardware failure classes.
- **Primary Model:** Scikit-Learn `IsolationForest` ($200$ trees, contamination $\nu=0.02$).
- **Why Best Suited:** 10,000 multi-node stability simulations mapping complex non-linear electrical equilibria boundaries, enabling precise calibration of the tree contamination factor and $<2.1\,\text{ms}$ CPU inference.
- **Output:** Export to `exports/classical/isoforest_v1.joblib` ($1.6\,\text{MB}$).

### 3.5. Track E: Energy Management & Decision Policy (`12_RL_Energy_Management_Training.ipynb`)
- **Authoritative Kaggle Dataset:** [Energy Consumption, Generation, Prices and Weather](https://www.kaggle.com/datasets/nicholasjhana/energy-consumption-generation-prices-and-weather) (`nicholasjhana/energy-consumption-generation-prices-and-weather`)
  ```python
  energy_data_path = fetch_kaggle_dataset("nicholasjhana/energy-consumption-generation-prices-and-weather", f"{BASE_DIR}/datasets/kaggle/energy")
  ```
- **Relevant Features:** Realized spot tariff `price actual`, day-ahead price `price day ahead`, `generation solar`, `total load actual`, and collocated weather variables (`temp`, `humidity`, `wind_speed`).
- **Target Variables:** Transition tuples $\langle s_t, a_t, r_t, s_{t+1}, d_t \rangle$ driving Gymnasium `MicrogridEnv`, yielding discrete 8-channel relay bitmask $[R_1..R_8]$ and continuous battery current setpoint $I_{\text{target}}$.
- **Algorithm:** Reinforcement Learning policy optimization (PPO / SAC with Actor-Critic MlpPolicy, $1,000,000$ training timesteps).
- **Why Best Suited:** 4 years (35,064 hours) of synchronized wholesale electricity market tariffs, weather variations, and solar generation for training time-of-use economic arbitrage and peak shaving.
- **Output:** Export to `exports/rl/energy_rl_policy_v1.zip` ($8.5\,\text{MB}$).

---

## 4. Local Validation & Verification Template
Every exported checkpoint must be validated in local Python CPU runtime:

```python
import torch
import numpy as np

# Load PyTorch LSTM checkpoint
checkpoint = torch.load(f"{BASE_DIR}/exports/weights/solar_lstm_v1.pth", map_location='cpu')
from src.agents.solar_agent import SolarLSTMForecaster
model = SolarLSTMForecaster(input_dim=10, hidden_dim=64, num_layers=2, forecast_horizon=4)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

dummy_test = torch.randn(1, 96, 10, dtype=torch.float32)
with torch.no_grad():
    preds = model(dummy_test)
print(f"✅ PyTorch LSTM Verification Passed! Output Shape: {preds.shape}")
```

---

## 5. Training Operations Checklist
- [x] Establish Colab workflows for the 5 authoritative primary models.
- [ ] Mount Google Drive and verify folder structure.
- [ ] Run exploratory data analysis in `01_Data_Exploration_and_EDA.ipynb`.
- [ ] Train and evaluate all 5 model tracks sequentially.
- [ ] Confirm all evaluation metrics pass target acceptance thresholds.
- [ ] Export model artifacts, scalers, and update `registry.json`.
- [ ] Download exported artifacts to local `gridflow-agentic-ai/models/` directory.
