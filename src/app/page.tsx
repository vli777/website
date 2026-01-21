"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import imageData from "./imageData.json";
import { ImageCard } from "./components/ImageCard";
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

const typedImages = imageData as VisualizationImage[];

const features = [
  {
    icon: Brain,
    title: "Volatility Forecasting",
    description:
      "Heterogeneous volatility modeling utilizing deep-gated features to isolate structural regimes. We incorporate the Engle (NYU) DCC-NL framework for large-scale dynamic covariance estimation",
  },
  {
    icon: Activity,
    title: "Regime Detection",
    description:
      "Proprietary autoencoder-driven detection engineered to outperform current MoE Jump frameworks (Yu, Mulvey, Kolm 2025) in training throughput by delivering 9x faster recalibration with minimal detection lag",
  },
  {
    icon: GitBranch,
    title: "Deep Learning Statistical Arbitrage",
    description:
      "A proprietary evolution of the Ordoñez-Pelger-Zanotti framework. We utilize a hybrid TCN-Attention architecture to extract non-linear risk factors and relational alpha at speeds necessary for live market inference",
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
    description:"Move beyond static weights. We apply adaptive fractional Kelly allocation, scaling position sizes with varying distribution moments to align exposure with signal edge",
      
  },
  {
    icon: Layers,
    title: "Hierarchical Optimization",
    description:
      "Textbook models stop where constraints begin. We've figured out a way to evolve López de Prado and Dalio's work to solve risk constraints without breaking cluster geometry",
  },
  {
    icon: Search,
    title: "Anomaly Detection",
    description:
      "Beyond Kalman Filters: We hybridize graph and transformer architectures to detect anomalies via association discrepancy. Using temporal gating, our engine isolates structural breakdowns without needing manual tuning",
  },
  {
    icon: Zap,
    title: "Time Series Inference",
    description:
      "Through a heterogeneous ensemble of recurrent and dilated temporal layers, we process 1,000+ engineered features to capture non-linear, multi-scale dependencies while enforcing zero look-ahead bias",
  },
  {
    icon: TrendingUp,
    title: "Probabilistic Trend Estimation",
    description:
      "We anchor intraday return density against structural linear regression channels. By applying volatility-adjusted dispersion to our probabilistic micro-signals, we generate high-fidelity confidence envelopes",
  },
];

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
  const demoImages = typedImages;

  const handleCardClick = useCallback((image: VisualizationImage) => {
    setSelectedImage(image);
  }, []);

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
              <p className="max-w-2xl text-xl font-bold leading-relaxed text-blue-800 sm:text-2xl">
                Institutional-grade quantitative investing.
                <br />
                <span className="text-white font-light">For everyone.</span>
              </p>
              <p className="text-sm text-gray-500">
                Powered by{" "}
                <span className="text-blue-800 font-medium">Argo</span>
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
        <section id="features" className="bg-gray-950 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Powered by Deep Learning
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-400">
                Probabilistic Architectures for Structural Market Asymmetry
                <br />
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group rounded-xl border border-gray-800 bg-gray-800/50 p-6 transition-all hover:border-blue-500/50 hover:bg-gray-800"
                >
                  <feature.icon className="mb-4 h-10 w-10 text-blue-800 transition-transform group-hover:scale-110" />
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
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
                  className="text-sm font-black uppercase text-cyan-400"
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
                institutional-grade research. By synthesizing SOTA published
                research with proprietary inventions, we deploy 
                advanced modeling techniques once reserved for the world&apos;s
                most sophisticated investors.
              </motion.p>
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-6 mt-16">
            <div className="grid gap-4 sm:grid-cols-2">
              {demoImages.map((img, index) => (
                <ImageCard
                  key={index}
                  {...img}
                  index={index}
                  onClick={() => handleCardClick(img)}
                />
              ))}
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
                 <p className="text-lg text-gray-400">
                Development in Progress.
              </p>

              {submitStatus === "success" ? (
                <p className="text-lg text-green-400">
                  You&apos;re on the list. We&apos;ll be in touch.
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
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={submitStatus === "loading"}
                      className="rounded-lg bg-blue-800 px-6 py-3 font-medium text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
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
