import { motion } from "framer-motion";
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

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Banner fills entire grid cell */}
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          priority={index === 0}
          sizes="(min-width: 640px) 50vw, 100vw"
          style={{ objectFit: "cover", objectPosition: alignment }}
        />

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        {/* Centered text overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-white">
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
      </div>
    </div>
  );
};
