import { Thermometer, Users, CloudRain } from "lucide-react";

export default function WeatherBar() {
  return (
    <div className="bg-[#f0f9f5] border-y border-green-100 py-2.5 px-6">
      <div className="max-w-240 mx-auto flex items-center gap-5 flex-wrap">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-on-surface">
          <Thermometer size={15} className="text-primary" />
          Pokhara 24°C
        </span>
        <span className="w-px h-3.5 bg-outline-variant" />
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-on-surface">
          <Users size={15} className="text-primary" />
          EBC: Low crowd
        </span>
        <span className="w-px h-3.5 bg-outline-variant" />
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-on-surface">
          <CloudRain size={15} className="text-primary" />
          Monsoon: Jun–Sep
        </span>
      </div>
    </div>
  );
}
