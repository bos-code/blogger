export default function Image({ src, alt, classes }: { src: string; alt?: string; classes?: string }): JSX.Element {
  return <img src={src} alt={alt} className={classes} />;
} 
