"""
GridFlowX Production Cyber-Physical Constants & Safety Limits
=============================================================
Defines IEEE 1547 electrical bounds, relay channel mapping, and safety thresholds.
"""

# Relay Channel Indices (0 to 7)
RELAY_TIER1_CRITICAL = 0      # Channel 0: Tier 1 Critical Load (Immutable ON)
RELAY_TIER2_IMPORTANT = 1     # Channel 1: Tier 2 Important Load
RELAY_TIER3_FLEXIBLE = 2      # Channel 2: Tier 3 Flexible / Sheddable Load
RELAY_AUXILIARY_DC = 3        # Channel 3: Auxiliary DC Bus
RELAY_GRID_INFEED = 4         # Channel 4: AC Grid Infeed Contactor
RELAY_SOLAR_MPPT = 5          # Channel 5: Solar PV MPPT Input
RELAY_WIND_TURBINE = 6        # Channel 6: Auxiliary Generation Input
RELAY_MAIN_INVERTER = 7       # Channel 7: BESS Inverter Primary Switch

# IEEE 1547 Grid Bounds & Electrical Safety
GRID_VOLTAGE_MIN_V = 195.0
GRID_VOLTAGE_MAX_V = 255.0
GRID_FREQ_MIN_HZ = 49.2
GRID_FREQ_MAX_HZ = 50.8

# Battery Energy Storage System (LiFePO4 4S 12.8V Pack)
BATTERY_SOC_MIN_CUTOFF_PCT = 18.0    # Deep discharge hard interlock
BATTERY_SOC_RESERVE_PCT = 35.0       # Peak tariff reserve floor
BATTERY_TEMP_WARNING_C = 38.0
BATTERY_TEMP_CRITICAL_CUTOFF_C = 45.0
BATTERY_MAX_CHARGE_VOLTS = 14.4
BATTERY_MIN_DISCHARGE_VOLTS = 11.2

# Contactor Mechanical Protection
MIN_RELAY_DWELL_TIME_SEC = 3.0       # Minimum time between toggles on same channel

# Time-of-Use (ToU) Tariffs (USD per kWh)
TARIFF_RATE_PEAK = 0.38
TARIFF_RATE_STANDARD = 0.22
TARIFF_RATE_OFF_PEAK = 0.12
