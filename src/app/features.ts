import {
  Brain,
  Activity,
  GitBranch,
  Network,
  Shield,
  Layers,
  Search,
  Zap,
  TrendingUp,
} from "lucide-react";

export const features = [
  {
    icon: Brain,
    title: "Volatility Forecasting",
    description:
      "Heterogeneous volatility modeling utilizes deep-gated features and AQR's 'Risk Everywhere' (Bollerslev, Pedersen, et al.) framework to isolate regimes. We incorporate Engle's (NYU, 2019) DCC-NL for dynamic covariance estimation.",
  },
  {
    icon: Activity,
    title: "Regime Detection",
    description:
      "Proprietary contrastive-hybrid autoencoders (Rusak et al. 2024) for early-warning detection; 9x faster training vs MoE-style Deep Statistical Jump Models (Yu et al. 2025) with comparable ROC-AUC and PR-AUC.",
  },
  {
    icon: GitBranch,
    title: "Deep Statistical Arbitrage",
    description:
      "A proprietary evolution of the Ordoñez-Pelger-Zanotti (BlackRock/Stanford, 2025) framework. We utilize a hybrid TCN-Attention architecture to extract relational alpha at speeds optimized for live inference.",
  },
  {
    icon: Network,
    title: "Graph Neural Networks",
    description:
      "Proprietary GNNs isolate latent asset dependencies for high-conviction signaling; demonstrated up to 2x IC with robust t-stats over live DLSA production models on identical datasets.",
  },
  {
    icon: Shield,
    title: "Adaptive Risk Controls",
    description:
      "Move beyond static weights. We apply adaptive fractional Kelly allocation, scaling position sizes with varying distribution moments to dynamically align exposure to signal edge.",
  },
  {
    icon: Layers,
    title: "Hierarchical Optimization",
    description:
      "Textbook models stop where constraints begin. Our optimization engine, inspired by López de Prado (2020) and Dalio, solves complex risk constraints without breaking the underlying cluster geometry.",
  },
  {
    icon: Search,
    title: "Anomaly Detection",
    description:
      "Hybridizing Graph architectures (Veličković et al. 2019) with multi-step temporal gating to isolate structural breaks. This distinguishes systemic shifts from manipulation and dispersion without KF recalibration.",
  },
  {
    icon: Zap,
    title: "Time Series Inference",
    description:
      "A heterogeneous ensemble of recurrent and dilated layers processes 1,000+ features to capture multi-scale dependencies. This provides a dynamic signal tilt that matures with model-driven inference reliability.",
  },
  {
    icon: TrendingUp,
    title: "Probabilistic Trend Estimation",
    description:
      "Anchoring intraday return density against structural regression channels. By applying volatility-adjusted dispersion to micro-signals, we generate high-fidelity confidence envelopes.",
  },
];
