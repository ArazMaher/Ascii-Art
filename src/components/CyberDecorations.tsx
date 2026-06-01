export function CyberDecorations() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-50">

            {/* Starry background */}
            <div className="absolute inset-0" style={{ background: 'transparent', backgroundImage: 'radial-gradient(#00FF41 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.1 }}></div>

            {/* Retro Warp Space 3D Grids */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] perspective-[800px] opacity-15">
                <div className="w-full h-full border border-[#00FF41]/50" style={{ transform: 'rotateX(-75deg)', backgroundImage: 'linear-gradient(#00FF41 1px, transparent 1px), linear-gradient(90deg, #00FF41 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] perspective-[800px] opacity-20">
                <div className="w-full h-full border border-[#00FF41]/50" style={{ transform: 'rotateX(75deg)', backgroundImage: 'linear-gradient(#00FF41 1px, transparent 1px), linear-gradient(90deg, #00FF41 1px, transparent 1px)', backgroundSize: '50px 50px', animation: 'scanBeam 10s linear infinite' }}></div>
            </div>

            {/* Disconnected / Status Box left middle */}
            <div className="absolute left-[10%] bottom-[30%] opacity-30 border-2 border-[#00FF41] px-4 py-2 font-black uppercase text-3xl tracking-[0.3em] text-[#00FF41]">
                DISCONNECTED
            </div>

            {/* Huge Globe center-ish overlay */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-[#00FF41] opacity-20 origin-center animate-[spin_120s_linear_infinite]" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
                {Array.from({ length: 12 }).map((_, i) => (
                    <ellipse key={`h-${i}`} cx="100" cy="100" rx="90" ry="90" fill="none" stroke="currentColor" strokeWidth="0.5" transform={`rotate(${i * 15} 100 100)`} />
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                    <ellipse key={`v-${i}`} cx="100" cy="100" rx="90" ry={i * 15} fill="none" stroke="currentColor" strokeWidth="0.5" />
                ))}
            </svg>

            {/* Cyberpunk infinity loop top middle */}
            <svg className="absolute top-[20%] left-[30%] w-32 h-32 text-[#00FF41] opacity-30" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M 20 50 A 20 20 0 1 1 50 50 A 20 20 0 1 0 80 50 A 20 20 0 1 1 50 50 A 20 20 0 1 0 20 50" strokeDasharray="5 5" className="animate-[spin_20s_linear_infinite]" />
            </svg>

            {/* Radar sweeping top right */}
            <div className="absolute top-20 right-1/4 opacity-30">
                <svg className="w-64 h-64 text-[#00FF41]" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" />
                    {/* Degree markers */}
                    {Array.from({ length: 36 }).map((_, i) => (
                        <line key={`deg-${i}`} x1="100" y1="10" x2="100" y2="15" stroke="currentColor" strokeWidth="1" transform={`rotate(${i * 10} 100 100)`} />
                    ))}
                    {/* Radar sweeping cone */}
                    <g className="origin-center animate-[spin_5s_linear_infinite]">
                        <path d="M 100 100 L 100 10 A 90 90 0 0 1 150 20 Z" fill="currentColor" opacity="0.4" />
                        <line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" strokeWidth="2" />
                    </g>
                </svg>
            </div>

        </div>
    );
}
