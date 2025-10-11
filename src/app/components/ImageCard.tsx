import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

interface ImageCardProps {
  imageSrc: string;
  title: string;
  description?: string;
  alignment?: string;
  index: number;
}

export const ImageCard = (props: ImageCardProps) => {
  const { imageSrc, title, description, alignment = "center", index } = props;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Apple-style smooth parallax - subtle movement
  const y = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <div
      ref={ref}
      className="snap-start md:snap-align-none relative w-full flex items-center justify-center"
    >
      {/* Widescreen banner with aspect ratio */}
      <motion.div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "21/9",
          y
        }}
      >
          <Image
            src={imageSrc}
            alt={title}
            fill
            priority={index === 0}
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: alignment }}
          />

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        {/* Centered text overlay with Apple-style typography */}
        <div className="absolute inset-0 flex items-center justify-center z-10 text-center text-white px-8">
          <div className="max-w-4xl">
            <motion.h2
              className="text-3xl md:text-5xl font-semibold mb-3 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {title}
            </motion.h2>
            {description && (
              <motion.p
                className="text-base md:text-xl font-normal text-gray-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {description}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
