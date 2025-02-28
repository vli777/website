import { motion, useScroll, useTransform } from "framer-motion";

interface ImageCardProps {
  imageSrc: string;
  title: string;
  description?: string;
  alignment?: string; // Any valid CSS object-position value, e.g. "20% 50%", "center", "top right", etc.
  index: number;
}

export const ImageCard = (props: ImageCardProps) => {
  const { imageSrc, title, description, alignment = "center", index } = props;
  const { scrollY } = useScroll();

  // Parallax effect
  const y = useTransform(scrollY, [0, 1000], ["20%", "0%"]);
  
  // Scale down the image to fit more content within the visible area
  const scale = useTransform(scrollY, [0, 1000], [1, 0.8]);

  // Container stagger: even-indexed cards align left, odd-indexed align right
  const isImageLeft = index % 2 === 0;

  return (
    <motion.div
      className={`relative h-[800px] w-full md:w-[90%] flex items-center gap-8 ${isImageLeft ? "mr-auto flex-row" : "ml-auto flex-row-reverse"}`}
      whileInView={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Image with Parallax and Zoom-Out Effect */}
      <motion.img
        src={imageSrc}
        className="relative w-2/3 h-full object-cover rounded-2xl md:rounded-[32px]"
        style={{ y, scale, objectPosition: alignment }}
      />

      {/* Text Positioned on the Opposite Side */}
      <div className="w-1/3 p-4 bg-black bg-opacity-50 text-white space-y-2 rounded-2xl md:rounded-[32px]">
        <h2 className="text-lg md:text-xl font-bold">{title}</h2>
        {description && <p className="text-xs md:text-sm">{description}</p>}
      </div>
    </motion.div>
  );
};
