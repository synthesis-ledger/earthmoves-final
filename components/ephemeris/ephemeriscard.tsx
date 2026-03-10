// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ephemeriscard â€” Article card for index, homepage, and related sections
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import Link from "next/link";
import { Article, COLUMNS } from "@/lib/ephemeris";

interface Props {
  article: Article;
  featured?: boolean;
  compact?: boolean;
}

export default function ephemeriscard({ article, featured, compact }: Props) {
  const { meta, readingTime } = article;
  const column = COLUMNS[meta.column];
  const date = new Date(meta.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (featured) {
    return (
      <Link href={`/ephemeris/${meta.slug}`} className="eph-card eph-card-featured">
        {meta.image && (
          <div className="eph-card-img-wrap eph-card-img-featured">
            <img src={meta.image} alt={meta.imageAlt || meta.title} loading="lazy" />
          </div>
        )}
        <div className="eph-card-body-featured">
          <span className="eph-card-tag" style={{ color: column.color }}>{column.label}</span>
          <h2 className="eph-card-title-featured">{meta.title}</h2>
          <p className="eph-card-desc-featured">{meta.description}</p>
          <div className="eph-card-meta">
            <time>{date}</time>
            <span className="eph-dot">Â·</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  if (compact) {
    return (
      <Link href={`/ephemeris/${meta.slug}`} className="eph-card eph-card-compact">
        <span className="eph-card-tag" style={{ color: column.color }}>{column.label}</span>
        <h3 className="eph-card-title-compact">{meta.title}</h3>
        <div className="eph-card-meta">
          <time>{date}</time>
          <span className="eph-dot">Â·</span>
          <span>{readingTime} min</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/ephemeris/${meta.slug}`} className="eph-card">
      {meta.image && (
        <div className="eph-card-img-wrap">
          <img src={meta.image} alt={meta.imageAlt || meta.title} loading="lazy" />
        </div>
      )}
      <div className="eph-card-body">
        <span className="eph-card-tag" style={{ color: column.color }}>{column.label}</span>
        <h3 className="eph-card-title">{meta.title}</h3>
        <p className="eph-card-desc">{meta.description}</p>
        <div className="eph-card-meta">
          <time>{date}</time>
          <span className="eph-dot">Â·</span>
          <span>{readingTime} min read</span>
        </div>
      </div>
    </Link>
  );
}
