interface LocationMapProps {
    url: string
    title: string
  }
  
  export function LocationMap({ url, title }: LocationMapProps) {
    return (
      <iframe
        src={url}
        width="100%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        className="rounded-md"
      />
    )
  }
  
  