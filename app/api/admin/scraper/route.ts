import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_TOKEN = "am_session_valid_k8x2p9";

async function isAuth() {
  const c = await cookies();
  return c.get("am_admin_session")?.value === SESSION_TOKEN;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface BusinessResult {
  id: number;
  nombre: string;
  tipo: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  lat: number;
  lon: number;
}

/**
 * Geocode a locality name to coordinates using Nominatim (OpenStreetMap)
 */
async function geocode(query: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=es`;
  const res = await fetch(url, {
    headers: { "User-Agent": "AhorroMetrics-Scraper/1.0" },
  });

  if (!res.ok) return null;

  const data: NominatimResult[] = await res.json();
  if (data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

/**
 * Query Overpass API for businesses within a radius
 */
async function findBusinesses(lat: number, lon: number, radiusKm: number): Promise<BusinessResult[]> {
  const radiusM = radiusKm * 1000;

  // Overpass QL query: find nodes and ways with business-related tags
  const query = `
    [out:json][timeout:30];
    (
      node["shop"](around:${radiusM},${lat},${lon});
      node["office"](around:${radiusM},${lat},${lon});
      node["amenity"~"restaurant|bar|cafe|bank|pharmacy|dentist|doctors|veterinary|fuel|car_repair|car_wash"](around:${radiusM},${lat},${lon});
      node["craft"](around:${radiusM},${lat},${lon});
      node["tourism"~"hotel|hostel|guest_house|apartment"](around:${radiusM},${lat},${lon});
      node["industrial"](around:${radiusM},${lat},${lon});
      node["company"](around:${radiusM},${lat},${lon});
      way["shop"](around:${radiusM},${lat},${lon});
      way["office"](around:${radiusM},${lat},${lon});
      way["amenity"~"restaurant|bar|cafe|bank|pharmacy|dentist|doctors|veterinary|fuel|car_repair|car_wash"](around:${radiusM},${lat},${lon});
      way["craft"](around:${radiusM},${lat},${lon});
      way["tourism"~"hotel|hostel|guest_house|apartment"](around:${radiusM},${lat},${lon});
    );
    out center tags;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) {
    console.error("Overpass API error:", res.status);
    return [];
  }

  const data = await res.json();
  const elements: OverpassElement[] = data.elements || [];

  const results: BusinessResult[] = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags["brand"] || "";
    if (!name) continue; // Skip unnamed businesses

    const elLat = el.lat || el.center?.lat || 0;
    const elLon = el.lon || el.center?.lon || 0;

    // Determine business type
    let tipo = "Negocio";
    if (tags.shop) tipo = translateTag("shop", tags.shop);
    else if (tags.office) tipo = translateTag("office", tags.office);
    else if (tags.amenity) tipo = translateTag("amenity", tags.amenity);
    else if (tags.craft) tipo = translateTag("craft", tags.craft);
    else if (tags.tourism) tipo = translateTag("tourism", tags.tourism);

    // Build address
    const addressParts = [
      tags["addr:street"],
      tags["addr:housenumber"],
      tags["addr:postcode"],
      tags["addr:city"],
    ].filter(Boolean);
    const direccion = addressParts.length > 0 ? addressParts.join(", ") : "";

    // Contact info
    const telefono = tags.phone || tags["contact:phone"] || tags["phone:mobile"] || "";
    const email = tags.email || tags["contact:email"] || "";
    const web = tags.website || tags["contact:website"] || tags["url"] || "";

    results.push({
      id: el.id,
      nombre: name,
      tipo,
      direccion,
      telefono: cleanPhone(telefono),
      email,
      web: cleanUrl(web),
      lat: elLat,
      lon: elLon,
    });
  }

  // Sort: businesses with contact info first
  results.sort((a, b) => {
    const aScore = (a.telefono ? 2 : 0) + (a.email ? 2 : 0) + (a.web ? 1 : 0);
    const bScore = (b.telefono ? 2 : 0) + (b.email ? 2 : 0) + (b.web ? 1 : 0);
    return bScore - aScore;
  });

  return results;
}

function cleanPhone(phone: string): string {
  return phone.replace(/^(\+34\s?)?/, "").replace(/\s+/g, " ").trim();
}

function cleanUrl(url: string): string {
  if (!url) return "";
  if (!url.startsWith("http")) return "https://" + url;
  return url;
}

function translateTag(category: string, value: string): string {
  const translations: Record<string, Record<string, string>> = {
    shop: {
      supermarket: "Supermercado", bakery: "Panaderia", butcher: "Carniceria",
      clothes: "Tienda de ropa", hairdresser: "Peluqueria", beauty: "Estetica",
      car: "Concesionario", car_repair: "Taller mecanico", electronics: "Electronica",
      furniture: "Muebles", hardware: "Ferreteria", optician: "Optica",
      florist: "Floristeria", shoes: "Zapateria", jewelry: "Joyeria",
      convenience: "Tienda 24h", alcohol: "Licoreria", tobacco: "Estanco",
      books: "Libreria", stationery: "Papeleria", sports: "Deportes",
      toys: "Jugueteria", pet: "Tienda de mascotas", travel_agency: "Agencia de viajes",
      mobile_phone: "Telefonia", computer: "Informatica", variety_store: "Bazar",
      greengrocer: "Fruteria", seafood: "Pescaderia", deli: "Charcuteria",
      pastry: "Pasteleria", kiosk: "Kiosko", copyshop: "Copisteria",
    },
    office: {
      company: "Empresa", insurance: "Seguros", lawyer: "Abogado",
      accountant: "Gestor/Contable", estate_agent: "Inmobiliaria",
      financial: "Finanzas", it: "Informatica", tax_advisor: "Asesor fiscal",
      notary: "Notaria", architect: "Arquitecto", engineer: "Ingenieria",
      consulting: "Consultoria", employment_agency: "Agencia empleo",
      telecommunication: "Telecomunicaciones", coworking: "Coworking",
    },
    amenity: {
      restaurant: "Restaurante", bar: "Bar", cafe: "Cafeteria",
      bank: "Banco", pharmacy: "Farmacia", dentist: "Dentista",
      doctors: "Medico", veterinary: "Veterinario", fuel: "Gasolinera",
      car_repair: "Taller", car_wash: "Lavadero",
    },
    craft: {
      plumber: "Fontanero", electrician: "Electricista", carpenter: "Carpintero",
      painter: "Pintor", photographer: "Fotografo", glaziery: "Cristaleria",
      metal_construction: "Metalurgia", locksmith: "Cerrajero",
    },
    tourism: {
      hotel: "Hotel", hostel: "Hostal", guest_house: "Casa rural",
      apartment: "Apartamento turistico",
    },
  };

  return translations[category]?.[value] || value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// POST - Search businesses by locality or coordinates
export async function POST(request: NextRequest) {
  if (!(await isAuth()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const { localidad, lat, lon, radio } = body;

    let searchLat: number;
    let searchLon: number;
    let locationName: string;
    const radiusKm = radio || 5; // Default 5km

    if (lat && lon) {
      // Coordinates provided directly (from map click)
      searchLat = lat;
      searchLon = lon;
      locationName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } else if (localidad) {
      // Geocode the locality name
      const geo = await geocode(localidad);
      if (!geo) {
        return NextResponse.json(
          { error: `No se encontro la localidad: ${localidad}` },
          { status: 404 }
        );
      }
      searchLat = geo.lat;
      searchLon = geo.lon;
      locationName = geo.displayName;
    } else {
      return NextResponse.json(
        { error: "Debes proporcionar una localidad o coordenadas" },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching businesses near ${locationName} (radius: ${radiusKm}km)`);

    const businesses = await findBusinesses(searchLat, searchLon, radiusKm);

    const withPhone = businesses.filter((b) => b.telefono).length;
    const withEmail = businesses.filter((b) => b.email).length;
    const withWeb = businesses.filter((b) => b.web).length;

    return NextResponse.json({
      location: {
        name: locationName,
        lat: searchLat,
        lon: searchLon,
        radiusKm,
      },
      stats: {
        total: businesses.length,
        conTelefono: withPhone,
        conEmail: withEmail,
        conWeb: withWeb,
      },
      results: businesses,
    });
  } catch (error) {
    console.error("Scraper error:", error);
    return NextResponse.json({ error: "Error en el scraper" }, { status: 500 });
  }
}
