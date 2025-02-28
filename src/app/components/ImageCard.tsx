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
  
  // Scale down the image slightly to avoid excessive zoom-out
  const scale = useTransform(scrollY, [0, 1000], [1, 0.95]);

  // Container stagger: even-indexed cards align left, odd-indexed align right on desktop
  const isImageLeft = index % 2 === 0;

  return (
    <motion.div
      className={`relative h-[800px] w-full md:w-[90%] flex flex-col md:flex-row items-center gap-8 ${isImageLeft ? "md:mr-auto md:flex-row" : "md:ml-auto md:flex-row-reverse"}`}
      whileInView={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Image with Parallax and Minimal Zoom-Out Effect */}
      <motion.div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-[32px]">
        <motion.img
          src={imageSrc}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl md:rounded-[32px]"
          style={{ y, scale, objectPosition: alignment }}
        />
        {/* Text Overlay on Mobile with Extra Bottom Padding */}
        <div className="absolute bottom-0 left-0 w-full p-4 pb-8 bg-black bg-opacity-50 text-white md:hidden rounded-b-2xl">
          <h2 className="text-lg font-bold">{title}</h2>
          {description && <p className="text-xs mt-2">{description}</p>}
        </div>
      </motion.div>

      {/* Text Positioned on the Opposite Side for Desktop */}
      <div className="hidden md:flex flex-col w-1/3 p-4 md:px-8 bg-black bg-opacity-50 text-white rounded-2xl md:rounded-[32px] space-y-2">
        <h2 className="text-lg md:text-xl font-bold">{title}</h2>
        {description && <p className="text-xs md:text-sm mt-2">{description}</p>}
      </div>
    </motion.div>
  );
};
