export default function Image({ src, alt, classes }: { src: string; alt?: string; classes?: string }): React.ReactElement {
  return <img src={src} alt={alt} className={classes} />;
} 
