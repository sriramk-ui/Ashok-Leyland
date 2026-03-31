"use client";

import { useJsApiLoader, GoogleMap, OverlayView } from '@react-google-maps/api';
import { Trophy, ArrowUpRight, Maximize2, Minimize2, Layers } from 'lucide-react';
import { useMemo, useState, useCallback, useEffect } from 'react';

// Extremely intense deeply stylized tech dark-mode array for Google Maps
const darkStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#52525B" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#27272a" }, { visibility: "on" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#71717A" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#3f3f46" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#27272a" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#A1A1AA" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0f0f12" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#18181b" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#3f3f46" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#27272a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#27272a" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#3f3f46" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#52525b" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#71717A" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#27272a" }] },
];

export default function GeospatialMap({ data }) {
   const { isLoaded } = useJsApiLoader({
     id: 'google-map-script',
     googleMapsApiKey: "AIzaSyBEJljU8O2JQ2R2s6yh_or3xr9XCTCT72M"
   });

   const [mapRef, setMapRef] = useState(null);
   const [mapType, setMapType] = useState('roadmap');
   const [isFullscreen, setIsFullscreen] = useState(false);

   const onLoad = useCallback(function callback(map) {
      setMapRef(map);
   }, []);

   const onUnmount = useCallback(function callback(map) {
      setMapRef(null);
   }, []);

   // Calculate rough center of the dataset
   const avgLat = data && data.length > 0 ? data.reduce((sum, item) => sum + parseFloat(item.Latitude || 0), 0) / data.length : 21.1458;
   const avgLng = data && data.length > 0 ? data.reduce((sum, item) => sum + parseFloat(item.Longitude || 0), 0) / data.length : 79.0882;

   const center = useMemo(() => ({ lat: avgLat, lng: avgLng }), [avgLat, avgLng]);

   // Track native fullscreen state
   useEffect(() => {
      const handleFullscreenChange = () => {
         setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
   }, []);

   const handleFullscreenToggle = () => {
      const container = document.getElementById('geo-map-wrapper');
      if (!document.fullscreenElement) {
         if (container) container.requestFullscreen().catch(e => console.error(e));
      } else {
         if (document.exitFullscreen) document.exitFullscreen();
      }
   };
   
   if (!isLoaded) return (
      <div className="h-full min-h-[500px] w-full bg-black/50 rounded-[40px] border border-blue-500/20 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 pulse-shadow-engine" />
        <h1 className="text-xl text-blue-500 font-black italic animate-pulse uppercase tracking-widest relative z-10">Initializing Google Maps Engine</h1>
        <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] mt-2 relative z-10">Connecting to Alphabet servers...</p>
      </div>
   );

   return (
      <div id="geo-map-wrapper" className="w-full h-full min-h-[500px] rounded-[40px] overflow-hidden border border-white/5 relative bg-[#0a0a0a] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
         
         {/* Internal Overlay Tag */}
         <div className="absolute top-6 left-6 z-[400] bg-black/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 pointer-events-none shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Geospatial Intelligence</h3>
            <p className="text-[8px] text-blue-500 font-bold uppercase tracking-widest mt-1 filter drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">Live Optimization Matrix</p>
         </div>

         {/* Advanced Map Controls */}
         <div className="absolute top-6 right-6 z-[400] flex items-center gap-3">
            <div className="bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 flex items-center shadow-2xl pointer-events-auto">
               <button 
                  onClick={() => setMapType('roadmap')}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${mapType === 'roadmap' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                  <Layers className="w-3 h-3" /> Cyber Dark
               </button>
               <button 
                  onClick={() => setMapType('hybrid')}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${mapType === 'hybrid' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                  Satellite
               </button>
            </div>
            
            <button 
               onClick={handleFullscreenToggle}
               className="bg-black/80 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all shadow-2xl pointer-events-auto flex items-center justify-center group"
            >
               {isFullscreen ? <Minimize2 className="w-4 h-4 group-hover:scale-90 transition-transform text-rose-400" /> : <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-400" />}
            </button>
         </div>

         <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            center={center}
            zoom={5}
            onLoad={onLoad}
            onUnmount={onUnmount}
            mapTypeId={mapType}
            options={{
               styles: mapType === 'roadmap' ? darkStyle : [],
               disableDefaultUI: true,
               zoomControl: false, 
               mapTypeControl: false,
               streetViewControl: false,
               tilt: 45, // Enables 3D buildings in compatible cities when zoomed
            }}
         >
            {data && data.map((site, index) => {
               if (!site.Latitude || !site.Longitude) return null;
               const isTop = site.rank === 1;
               
               return (
                  <OverlayView
                     key={site.id || index}
                     position={{ lat: parseFloat(site.Latitude), lng: parseFloat(site.Longitude) }}
                     mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                     // Shift the DOM element up and left so the origin anchor points to the exact city coordinate
                     getPixelPositionOffset={(width, height) => ({
                         x: -(width / 2),
                         y: -(height + 5)
                     })}
                  >
                     <div className="group relative -translate-y-[10px] cursor-crosshair">
                        
                        {/* Interactive Data Point Locator */}
                        <div 
                           className="relative flex items-center justify-center w-6 h-6 transition-transform duration-300 group-hover:scale-150"
                           onClick={(e) => {
                               e.stopPropagation();
                               if (mapRef) {
                                  mapRef.panTo({ lat: parseFloat(site.Latitude), lng: parseFloat(site.Longitude) });
                                  mapRef.setZoom(16); // Aggressive street-level zoom dive
                                  setMapType('hybrid'); // Instantly swap to high-res photography on dive
                               }
                           }}
                        >
                           {isTop ? (
                              <>
                                <div className="absolute inset-0 rounded-full bg-blue-500/40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                                <div className="absolute inset-[-10px] rounded-full border border-blue-500/30 animate-[spin_4s_linear_infinite] border-dashed pointer-events-none"></div>
                                <div className="relative flex w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] z-10"></div>
                              </>
                           ) : (
                              <div className="relative flex w-2 h-2 bg-gray-500 rounded-full shadow-lg z-10 transition-colors group-hover:bg-white border border-gray-400"></div>
                           )}
                        </div>

                        {/* Hover Overlay Box */}
                        <div className="absolute opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 bottom-full left-1/2 -translate-x-1/2 mb-4 w-[260px] z-[1000] -translate-y-2 group-hover:-translate-y-4">
                           <div className="p-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-[24px] shadow-2xl backdrop-blur-3xl overflow-hidden relative group-hover:backdrop-blur-3xl">
                              <div className="absolute inset-0 bg-[#0a0a0a]/90" />
                              <div className="relative p-5 text-white">
                                 <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4 gap-6">
                                    <h4 className="font-black text-[13px] uppercase tracking-widest leading-none drop-shadow-md">{site.Site || site.name}</h4>
                                    {isTop && <Trophy className="w-5 h-5 text-blue-500 shrink-0 filter drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]" />}
                                 </div>
                                 <div className="space-y-4 mb-5">
                                    <div className="flex justify-between items-center gap-6">
                                       <span className="text-gray-500 uppercase font-black text-[9px] tracking-[0.15em]">Govt. Regulations</span>
                                       <span className="font-black text-[11px] text-blue-400 text-right">{site["Govt Norms/Tax SOPs"] || "Standard"}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-6">
                                       <span className="text-gray-500 uppercase font-black text-[9px] tracking-[0.15em]">Logistics Impact</span>
                                       <span className="font-black text-[11px] text-emerald-400">{site["Logistics Cost"] || "Optimal"}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-6">
                                       <span className="text-gray-500 uppercase font-black text-[9px] tracking-[0.15em]">Economies Scale</span>
                                       <span className="font-black text-[11px] text-white">{site["Economies of Scale"] || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-6">
                                       <span className="text-gray-500 uppercase font-black text-[9px] tracking-[0.15em]">Scale Potential</span>
                                       <span className="font-black text-[11px] text-amber-400">{site["Vendor Base"] || "Sub-Optimal"}</span>
                                    </div>
                                 </div>
                                 
                                 <div className={`p-4 rounded-xl border ${isTop ? 'bg-blue-500/10 border-blue-500/30 shadow-inner' : 'bg-white/5 border-white/5'} flex items-center justify-between`}>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isTop ? 'text-blue-500' : 'text-gray-500'}`}>Current Standing</span>
                                    <div className="flex items-end gap-1 font-black italic">
                                       <span className="text-[10px] text-gray-500 uppercase tracking-widest leading-tight">Rank Tracker</span>
                                       <span className={`text-xl leading-none tracking-tighter ${isTop ? 'text-blue-500 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-gray-300'}`}>{site.rank || '?'}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                     </div>
                  </OverlayView>
               );
            })}
         </GoogleMap>
      </div>
   );
}
