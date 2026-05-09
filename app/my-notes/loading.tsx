const NOTE_H  = ["h-[155px]","h-[183px]","h-[211px]"] as const;
const DELAYS  = ["","[animation-delay:0.06s]","[animation-delay:0.12s]","[animation-delay:0.18s]","[animation-delay:0.24s]","[animation-delay:0.30s]","[animation-delay:0.36s]","[animation-delay:0.42s]","[animation-delay:0.48s]"] as const;

export default function MyNotesLoading() {
  return (
    <div className="flex h-screen bg-[#f2ece0] overflow-hidden animate-sk-appear">
      <div className="w-12 border-r border-[rgba(0,0,0,0.07)] shrink-0" />
      <div className="w-[210px] border-r border-[rgba(0,0,0,0.07)] shrink-0 p-5 flex flex-col gap-[14px]">
        <div className="w-10 h-[9px] rounded-sm bg-[rgba(132,84,0,0.12)] animate-sk-pulse" />
        {(["w-[70%]","w-[55%]","w-[65%]","w-[50%]","w-[60%]","w-[45%]"] as const).map((w, i) => (
          <div key={i} className={`${w} h-6 rounded-sm bg-[rgba(132,84,0,0.08)] animate-sk-pulse ${DELAYS[i]}`} />
        ))}
      </div>
      <div className="flex-1 p-[22px_24px] grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 content-start">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={`${NOTE_H[i % 3]} rounded-[3px] bg-[rgba(132,84,0,0.07)] animate-sk-pulse ${DELAYS[i]}`} />
        ))}
      </div>
    </div>
  );
}
