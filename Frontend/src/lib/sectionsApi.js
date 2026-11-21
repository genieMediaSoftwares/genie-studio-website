import { getToken } from "./auth";
import BASE_URL from "../api.js";

const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: token, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

export const SECTION_CATEGORIES = [
  { id: "all", name: "All Pages & Sections" },
  { id: "homepage", name: "Home Page" },
  { id: "about", name: "About Page" },
  { id: "portfolio", name: "Portfolio Page" },
  { id: "services_main", name: "Main Services Page" },
  { id: "services_podcast", name: "Podcast Shoots" },
  { id: "services_product", name: "Product Shoots" },
  { id: "services_corporate", name: "Corporate Shoots" },
  { id: "services_event", name: "Event Shoots" },
  { id: "services_professional", name: "Professional Shoots" },
  { id: "services_business", name: "Business Portfolio Shoots" },
  { id: "blog", name: "Blog Page" },
];

export async function fetchSiteSections(category = "all") {
  const query = category && category !== "all" ? `?category=${category}` : "";
  const res = await fetch(`${BASE_URL}/api/site-sections${query}`);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to fetch site sections (HTTP ${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data.sections) ? data.sections : [];
}

export async function assignSectionImage(section_key, imageUrl, altText = "") {
  const res = await fetch(`${BASE_URL}/api/site-sections/${section_key}`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify({ image_url: imageUrl, alt_text: altText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to assign image (HTTP ${res.status})`);
  }
  const data = await res.json();
  window.dispatchEvent(new Event("genie-images-updated"));
  return data.section;
}

export async function clearSectionImage(section_key) {
  const res = await fetch(`${BASE_URL}/api/site-sections/${section_key}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to reset image (HTTP ${res.status})`);
  }
  window.dispatchEvent(new Event("genie-images-updated"));
  return true;
}
