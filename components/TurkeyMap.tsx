
import React, { useMemo } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Sphere, 
  Graticule 
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

// Turkey GeoJSON URL (reliable source)
const GEO_URL = "https://raw.githubusercontent.com/isagul/turkey-geojson/master/turkey.json";

interface TurkeyMapProps {
  data: Record<string, number>; // { cityName: count }
  onCityClick?: (city: string) => void;
}

const normalizeCityName = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, (char) => {
      const map: Record<string, string> = {
        'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
        'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'
      };
      return map[char] || char;
    });
};

export const TurkeyMap: React.FC<TurkeyMapProps> = ({ data, onCityClick }) => {
  // Normalize data keys for matching
  const normalizedData = useMemo(() => {
    const result: Record<string, number> = {};
    Object.entries(data).forEach(([city, count]) => {
      result[normalizeCityName(city)] = count;
    });
    return result;
  }, [data]);

  const maxCount = Math.max(...Object.values(data), 1);

  const colorScale = scaleLinear<string>()
    .domain([0, maxCount])
    .range(["#1e293b", "#f59e0b"]); // From slate-800 to amber-500

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden relative group">
      <div className="absolute top-4 left-4 z-10">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Yoğunluk Skalası</div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">0</span>
          <div className="w-24 h-1.5 bg-gradient-to-r from-slate-800 to-amber-500 rounded-full"></div>
          <span className="text-[10px] text-slate-400">{maxCount}</span>
        </div>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 3000,
          center: [35, 39] // Turkey center
        }}
        className="w-full h-full animate-fadeIn"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const cityName = geo.properties.name || geo.properties.NAME_1 || geo.properties.province;
              const normalizedName = normalizeCityName(cityName);
              const count = normalizedData[normalizedName] || 0;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => onCityClick?.(cityName)}
                  style={{
                    default: {
                      fill: count > 0 ? colorScale(count) : "#1e293b",
                      stroke: "#0f172a",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#f59e0b",
                      stroke: "#ffffff",
                      strokeWidth: 1,
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 0.3s"
                    },
                    pressed: {
                      fill: "#d97706",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      
      {/* Tooltip-like hint on hover is usually handled via state in the parent or local state */}
      <div className="absolute bottom-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-950/90 border border-slate-700 p-2 rounded-lg text-[10px] text-slate-400 backdrop-blur-sm">
          Şehirlerin üzerine gelerek detayları görebilirsiniz.
        </div>
      </div>
    </div>
  );
};
