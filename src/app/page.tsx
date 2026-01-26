"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
// import imageData from "./imageData.json";
import ImageModal from "./components/ImageModal";
import {
  Brain,
  Activity,
  GitBranch,
  Network,
  Shield,
  Layers,
  Search,
  ChevronDown,
  Zap,
  TrendingUp,
} from "lucide-react";

const DeepMatrixVisualization = dynamic(
  () => import("./components/DeepMatrixVisualization"),
  { ssr: false },
);

type VisualizationImage = {
  imageSrc: string;
  title: string;
  description?: string;
  alignment?: string;
};

// const typedImages = imageData as VisualizationImage[];

const features = [
  {
    icon: Brain,
    title: "Volatility Forecasting",
    description:
      "Heterogeneous volatility modeling utilizing deep-gated features to isolate structural regimes. We incorporate the Engle (NYU) DCC-NL framework for dynamic covariance estimation",
  },
  {
    icon: Activity,
    title: "Regime Detection",
    description:
      "Proprietary autoencoder-driven structural anomaly early-warning detection with 9x faster training vs MoE-style Deep Statistical Jump Models (Yu, Mulvey, Kolm 2025) with comparable ROC-AUC and PR-AUC",
  },
  {
    icon: GitBranch,
    title: "Deep Statistical Arbitrage",
    description:
      "A proprietary evolution of the Ordoñez-Pelger-Zanotti framework. We utilize a hybrid TCN-Attention architecture to extract relational alpha at faster speeds optimized for live inference",
  },
  {
    icon: Network,
    title: "Graph Neural Networks",
    description:
      "Proprietary GNN applications engineered to model signal propagation across sparse asset networks with custom pruning algorithms to isolate high-conviction latent dependencies",
  },
  {
    icon: Shield,
    title: "Adaptive Risk Controls",
    description:
      "Move beyond static weights. We apply adaptive fractional Kelly allocation, scaling position sizes with varying distribution moments to dynamically align exposure to signal edge",
  },
  {
    icon: Layers,
    title: "Hierarchical Optimization",
    description:
      "Textbook models stop where constraints begin. We've developed an optimization engine inspired by López de Prado and Dalio that solves risk constraints without breaking cluster geometry",
  },
  {
    icon: Search,
    title: "Anomaly Detection",
    description:
      "Beyond Kalman Filters: We hybridize graph and transformer architectures to detect anomalies via association discrepancy and temporal gating without needing manual tuning",
  },
  {
    icon: Zap,
    title: "Time Series Inference",
    description:
      "Through a heterogeneous ensemble of recurrent and dilated temporal layers, we process 1,000+ engineered features to capture non-linear, multi-scale dependencies without look-ahead bias",
  },
  {
    icon: TrendingUp,
    title: "Probabilistic Trend Estimation",
    description:
      "We anchor intraday return density against structural regression channels. By applying volatility-adjusted dispersion to our micro-signals, we generate high-fidelity confidence envelopes",
  },
];

// Generate noisy wave path with varying amplitudes
const generateNoisyWavePath = (baseAmplitude: number, seed: number = 0) => {
  const points: string[] = [];
  const width = 400;
  const midY = 50;

  // Create pseudo-random noise based on seed
  const noise = (x: number) => {
    const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
    return n - Math.floor(n);
  };

  for (let x = 0; x <= width; x += 4) {
    // Combine multiple frequencies for irregular pattern
    const wave1 = Math.sin((x / width) * Math.PI * 2 * 2.5) * 0.5;
    const wave2 = Math.sin((x / width) * Math.PI * 2 * 4.2 + 1.3) * 0.3;
    const wave3 = Math.sin((x / width) * Math.PI * 2 * 7.1 + 2.1) * 0.2;
    const randomOffset = (noise(x * 0.02) - 0.5) * 0.4;

    const combined = wave1 + wave2 + wave3 + randomOffset;
    const y = midY + combined * baseAmplitude;
    points.push(`${x},${y}`);
  }

  return `M${points.join(" L")}`;
};

// Audio signal wave behind text
const SignalText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  // Flat line -> spike -> dampen -> settle (different seeds for variety)
  const waveAnimation = {
    d: [
      generateNoisyWavePath(0, 1),
      generateNoisyWavePath(0, 1),
      generateNoisyWavePath(28, 2),
      generateNoisyWavePath(-24, 3),
      generateNoisyWavePath(18, 4),
      generateNoisyWavePath(-14, 5),
      generateNoisyWavePath(10, 6),
      generateNoisyWavePath(-6, 7),
      generateNoisyWavePath(3, 8),
      generateNoisyWavePath(-1.5, 9),
      generateNoisyWavePath(0, 1),
      generateNoisyWavePath(0, 1),
    ],
  };

  // Glow intensity animation - blue-400 core with blue-600/800 glow
  const glowAnimation = {
    filter: [
      "drop-shadow(0 0 0px rgba(96, 165, 250, 0))",
      "drop-shadow(0 0 0px rgba(96, 165, 250, 0))",
      "drop-shadow(0 0 14px rgba(37, 99, 235, 1)) drop-shadow(0 0 6px rgba(96, 165, 250, 0.9)) drop-shadow(0 0 2px rgba(191, 219, 254, 0.8))",
      "drop-shadow(0 0 12px rgba(37, 99, 235, 0.9)) drop-shadow(0 0 5px rgba(96, 165, 250, 0.8))",
      "drop-shadow(0 0 10px rgba(37, 99, 235, 0.8)) drop-shadow(0 0 4px rgba(96, 165, 250, 0.7))",
      "drop-shadow(0 0 7px rgba(37, 99, 235, 0.6)) drop-shadow(0 0 3px rgba(96, 165, 250, 0.5))",
      "drop-shadow(0 0 5px rgba(37, 99, 235, 0.5))",
      "drop-shadow(0 0 4px rgba(37, 99, 235, 0.4))",
      "drop-shadow(0 0 2px rgba(37, 99, 235, 0.25))",
      "drop-shadow(0 0 1px rgba(37, 99, 235, 0.15))",
      "drop-shadow(0 0 0px rgba(96, 165, 250, 0))",
      "drop-shadow(0 0 0px rgba(96, 165, 250, 0))",
    ],
    strokeWidth: [1, 1, 2.5, 2.5, 2, 2, 1.8, 1.5, 1.2, 1, 1, 1],
  };

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
      }}
    >
      {/* Animated wave behind text */}
      <svg
        style={{
          position: "absolute",
          left: "0%",
          top: "50%",
          width: "100%",
          height: "300%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 0,
          overflow: "visible",
        }}
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        <motion.path
          fill="none"
          stroke="rgba(96, 165, 250, 0.8)"
          initial={{
            d: generateNoisyWavePath(0, 1),
            filter: "drop-shadow(0 0 0px rgba(96, 165, 250, 0))",
            strokeWidth: 1,
          }}
          animate={{
            d: waveAnimation.d,
            filter: glowAnimation.filter,
            strokeWidth: glowAnimation.strokeWidth,
          }}
          transition={{
            duration: 5,
            ease: "easeOut",
            times: [
              0, 0.1, 0.12, 0.15, 0.18, 0.22, 0.27, 0.33, 0.4, 0.5, 0.6, 1,
            ],
            repeat: Infinity,
          }}
        />
      </svg>
      {/* Text on top */}
      <span style={{ position: "relative", zIndex: 1 }}>{text}</span>
    </span>
  );
};

const Home: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<VisualizationImage | null>(
    null,
  );
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [cubeRevealed, setCubeRevealed] = useState(false);
  // const demoImages = typedImages;

  // const handleCardClick = useCallback((image: VisualizationImage) => {
  //   setSelectedImage(image);
  // }, []);

  const handleModalClose = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setEmail("");
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    }
  };

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const updateLayoutMetrics = () => {
      if (typeof window === "undefined") {
        return;
      }
      document.documentElement.style.setProperty(
        "--viewport-height",
        `${window.innerHeight}px`,
      );
      setIsMobile(window.innerWidth < 768);
    };

    updateLayoutMetrics();
    window.addEventListener("resize", updateLayoutMetrics);
    window.addEventListener("orientationchange", updateLayoutMetrics);

    return () => {
      window.removeEventListener("resize", updateLayoutMetrics);
      window.removeEventListener("orientationchange", updateLayoutMetrics);
      document.documentElement.style.removeProperty("--viewport-height");
    };
  }, []);

  // Reveal cube and video when user interacts or scrolls
  const handleCubeInteraction = useCallback(() => {
    setCubeRevealed(true);
    setVideoOpacity(1);
  }, []);

  // Also reveal on scroll as fallback
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setCubeRevealed(true);
        setVideoOpacity(1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visualizationSettings = useMemo(() => {
    if (isMobile) {
      return {
        layerCount: 6,
        tokenCount: 36,
        horizontalSpacing: 12,
        verticalSpacing: 12,
        stackSpacing: 14,
        layerSpacing: 14,
        maxConnectionsPerToken: 6,
        cameraZoom: 7,
        activationChance: 0.012,
        fadeSpeed: 0.42,
      };
    }

    return {
      layerCount: 8,
      tokenCount: 64,
      horizontalSpacing: 21.33,
      verticalSpacing: 21.33,
      stackSpacing: 21.33,
      layerSpacing: 21.33,
      maxConnectionsPerToken: 8,
      cameraZoom: 6,
      activationChance: 0.01,
      fadeSpeed: 0.5,
    };
  }, [isMobile]);

  return (
    <>
      <div className="flex flex-col overflow-y-auto bg-black">
        {/* Hero Section */}
        <div
          className="relative flex flex-col justify-center text-white overflow-hidden"
          style={{
            minHeight: "var(--viewport-height, 100vh)",
            height: "var(--viewport-height, 100vh)",
          }}
        >
          {/* Solid dark background */}
          <div className="absolute inset-0 z-0 bg-[#0a0a0b]" />

          {/* Background video - fades in on cube interaction */}
          <div
            className="absolute inset-0 z-[1] transition-opacity duration-1000 ease-out"
            style={{ opacity: videoOpacity }}
          >
            <video
              className="h-full w-full object-cover"
              src="/asset_universe.mp4"
              autoPlay
              loop
              muted
              playsInline
              aria-hidden={true}
            />
          </div>
          <div className="absolute inset-0 z-10 bg-black/70" />

          <div className="absolute inset-0 z-20 pointer-events-none md:pointer-events-auto">
            <DeepMatrixVisualization
              stackCount={1}
              {...visualizationSettings}
              connectionColor={cubeRevealed ? "#3b82f6" : "#1a1a2e"}
              scaleMultiplier={1}
              onInteractionStart={handleCubeInteraction}
            />
          </div>

          <div className="relative z-30 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
                Vesta
              </h1>
              <p
                className={`max-w-2xl text-xl font-bold leading-relaxed ${cubeRevealed ? "text-blue-700" : "text-blue-800"} sm:text-2xl`}
              >
                Institutional-grade quantitative investing
                <br />
                <span
                  className={`${cubeRevealed ? "text-white" : "text-transparent font-light"}`}
                >
                  For everyone.
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Powered by{" "}
                <span
                  className={`${cubeRevealed ? "text-blue-700" : "text-blue-800"} font-medium`}
                >
                  Argo
                </span>
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm text-gray-500"
            >
              {/* Early access coming soon */}
            </motion.p>
          </div>

          {/* Scroll indicator */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onClick={scrollToFeatures}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll to features"
          >
            <ChevronDown className="h-8 w-8 animate-bounce" />
          </motion.button>
        </div>

        {/* Features Section */}
        <section
          id="features"
          className="relative bg-[#0a0a0b] py-24 overflow-hidden"
        >
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(30, 64, 175, 0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(30, 64, 175, 0.5) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative mx-auto max-w-5xl px-6">
            {/* Header - two column layout, reversed from demo */}
            <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16 items-start mb-16">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-base text-gray-400 leading-relaxed md:pt-8"
              >
                {`Anyone can throw data into an AI model, but without a foundation in financial causality, 
                most signals are merely reflections of events already priced in. We move beyond reactive heuristics  
                to identify the structural risk premiums and causal drivers that define market states. By applying 
                multi-dimensional inference to isolate these features, we identify not just the setup, but the tactical 
                triggers required to capture a truly quantified edge.`}
              </motion.p>

              <div className="flex flex-col gap-6 md:text-right">
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-sm font-black uppercase text-blue-700"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Go beyond the hype
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl font-black text-[#f5f5f5] leading-[1.1] sm:text-4xl"
                  style={{ letterSpacing: "-0.05em" }}
                >
                  Powered by Deep Learning
                </motion.h2>
                <motion.h3
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl font-black text-gray-500 leading-[1.1] sm:text-2xl"
                  style={{ letterSpacing: "-0.05em" }}
                >
                  We don&apos;t just solve for backtests
                  <br />
                  <SignalText
                    text="We solve for live markets"
                    className="text-[#f5f5f5]"
                  />
                </motion.h3>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative rounded-lg border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-5 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(30,64,175,0.2)]"
                >
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-700/0 to-blue-300/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

                  <div className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-800/20 text-blue-700 group-hover:text-blue-400 transition-colors group-hover:bg-blue-700/200 duration-300">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-semibold text-white">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-500 group-hover:text-gray-400 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="bg-[#0a0a0b] py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16 items-start">
              {/* Left: Headlines */}
              <div className="flex flex-col gap-6">
                {/* Lead-in */}
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-sm font-black uppercase text-blue-700"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Not another trade copier or LLM bot on indicators.
                </motion.p>

                {/* Hook */}
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl font-black text-[#f5f5f5] leading-[1.1] sm:text-4xl"
                  style={{ letterSpacing: "-0.05em" }}
                >
                  We don&apos;t trade indicators — we engineer them into
                  high-dimensional feature sets for neural architectures.
                </motion.h2>
              </div>

              {/* Right: Proof */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base text-gray-400 leading-relaxed md:pt-8"
              >
                Our mission is the systematic democratization of
                institutional-grade research. By synthesizing the latest
                published research with proprietary inventions, we deploy
                advanced modeling techniques once reserved for the world&apos;s
                most sophisticated investors.
              </motion.p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#0a0a0b] py-24">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-8"
            >
              <p className="text-lg text-gray-400">Development in Progress.</p>

              {submitStatus === "success" ? (
                <p className="text-lg text-gray-300">
                  Success. You&apos;re on the waitlist.
                </p>
              ) : (
                <>
                  <form
                    onSubmit={handleWaitlist}
                    className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={submitStatus === "loading"}
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-00 focus:outline-none focus:ring-1 focus:ring-blue-700 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={submitStatus === "loading"}
                      className="rounded-lg bg-blue-700 px-6 py-3 font-medium text-gray-400 transition-all hover:text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
                    >
                      {submitStatus === "loading"
                        ? "Joining..."
                        : "Join Waitlist"}
                    </button>
                  </form>

                  {submitStatus === "error" && (
                    <p className="text-sm text-red-400">
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <p className="text-sm text-gray-400">
                    We&apos;ll notify you when we launch.
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-black py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">Vesta</span>
                <span className="text-xs text-gray-600">powered by Argo</span>
              </div>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Vesta. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {selectedImage && (
        <ImageModal image={selectedImage} onClose={handleModalClose} />
      )}
    </>
  );
};

export default Home;
