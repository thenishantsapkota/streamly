import { forwardRef } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "placeholder" | "src"> & {
  src: string;
  alt: string;
  /** Absolutely fill the (positioned) parent. */
  fill?: boolean;
  /** Load eagerly with high fetch priority (above-the-fold art). */
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
};

/**
 * Plain <img> with fill/priority/blur-placeholder props. TMDB and
 * AniList already serve pre-sized images, so callers pick the right size in
 * the URL (posterUrl(..., "w342") etc.) instead of relying on an optimizer.
 */
export const Image = forwardRef<HTMLImageElement, Props>(function Image(
  { fill, priority, placeholder, blurDataURL, style, loading, decoding, ...rest },
  ref,
) {
  return (
    <img
      ref={ref}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding ?? "async"}
      fetchPriority={priority ? "high" : undefined}
      style={{
        ...(fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : null),
        ...(placeholder === "blur" && blurDataURL
          ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: "cover", backgroundPosition: "center" }
          : null),
        ...style,
      }}
      {...rest}
    />
  );
});

export default Image;
