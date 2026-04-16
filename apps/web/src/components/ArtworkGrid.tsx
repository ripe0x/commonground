import { ArtworkCard, type ArtworkCardData } from "./ArtworkCard"

export function ArtworkGrid({
  artworks,
  title,
}: {
  artworks: ArtworkCardData[]
  title?: string
}) {
  return (
    <section>
      {title && (
        <h2 className="mb-6 text-2xl font-medium tracking-tight">{title}</h2>
      )}
      {artworks.length === 0 ? (
        <p className="py-16 text-center text-gray-400">No artworks found</p>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {artworks.map((artwork) => (
            <div
              key={`${artwork.contract}-${artwork.tokenId}`}
              className="mb-6 break-inside-avoid"
            >
              <ArtworkCard artwork={artwork} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
