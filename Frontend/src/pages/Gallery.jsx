import React from 'react'
import DomeGallery from "../components/DomeGallery";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";

const Gallery = () => {
  return (
    <main className="w-full max-w-full h-screen overflow-hidden bg-white">
      <Seo
        {...SEO.gallery}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ]}
      />

      {/* The dome is the whole page, so there was no heading for crawlers or
          screen readers to anchor on. `sr-only` keeps it out of the visual
          design entirely while giving the route a real H1. */}
      <h1 className="sr-only">
        GenieStudio Gallery — Podcast, Product, Corporate, Event and Professional
        Shoots in Visakhapatnam
      </h1>

      <DomeGallery
  fit={1}
  minRadius={300}
  maxVerticalRotationDeg={5}
  segments={20}
  dragDampening={2}
  grayscale={false}
/>
    </main>
  )
}

export default Gallery
