$path = "src/app/admin/appearance/page.tsx"
$content = [System.Collections.Generic.List[string]](Get-Content $path -Encoding UTF8)
$newContent = @'
                                                {['home', 'buy', 'sell', 'services', 'rental', 'cart'].map((page) => (
                                                    <div key={page} className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                                                        <button
                                                            onClick={() => {
                                                                const el = document.getElementById(`bg-config-${page}`);
                                                                if (el) el.classList.toggle('hidden');
                                                            }}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                                                        >
                                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{page} Page</span>
                                                            <ChevronDown size={12} className="text-gray-500" />
                                                        </button>
                                                        <div id={`bg-config-${page}`} className="hidden p-3 border-t border-white/5 space-y-4">
                                                            {/* Blur & Overlay Controls */}
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <div className="flex justify-between text-[9px] text-gray-400 uppercase tracking-wider mb-1">
                                                                        <span>Overlay Opacity</span>
                                                                        <span>{(settings.pageBackgrounds?.[page as keyof typeof settings.pageBackgrounds]?.[0] ? '0.7' : '0.5')}</span>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max="1"
                                                                        step="0.1"
                                                                        defaultValue="0.7"
                                                                        className="w-full accent-[#A855F7] h-1 bg-white/10 rounded-full appearance-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Background Selection */}
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {(settings.mediaGallery || []).map((img, idx) => {
                                                                    const isActive = settings.pageBackgrounds?.[page as keyof typeof settings.pageBackgrounds]?.includes(img);
                                                                    return (
                                                                        <button
                                                                            key={idx}
                                                                            onClick={() => {
                                                                                const next = JSON.parse(JSON.stringify(settings));
                                                                                if (!next.pageBackgrounds) next.pageBackgrounds = {};
                                                                                if (!next.pageBackgrounds[page]) next.pageBackgrounds[page] = [];
                                                                                
                                                                                if (isActive) {
                                                                                    next.pageBackgrounds[page] = next.pageBackgrounds[page].filter((i: string) => i !== img);
                                                                                } else {
                                                                                    next.pageBackgrounds[page] = [img];
                                                                                }
                                                                                setSettings(next);
                                                                                saveHistoryStep();
                                                                            }}
                                                                            className={`relative aspect-video rounded overflow-hidden border transition-all ${isActive ? 'border-[#A855F7] ring-1 ring-[#A855F7]' : 'border-white/10 hover:border-white/30'}`}
                                                                        >
                                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                                            {isActive && (
                                                                                <div className="absolute inset-0 bg-[#A855F7]/20 flex items-center justify-center">
                                                                                    <Check size={12} className="text-white drop-shadow-md" />
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
'@

# Remove corrupted lines 783-849 (Indices 782-848), total 67 lines.
# Verify first line matches somewhat to be safe?
if ($content[782].Trim().StartsWith("{['home'")) {
    $content.RemoveRange(782, 67)
    $content.InsertRange(782, ($newContent -split "`r`n"))
    $content | Set-Content $path -Encoding UTF8
    Write-Host "Restoration successful"
} else {
    Write-Host "Target start line mismatch:"
    Write-Host $content[782]
}
