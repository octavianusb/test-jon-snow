const PdfSidebar = (
    { activeReference, references, onScrollToSection }:
    {
        activeReference: string | null;
        references: { content: string }[];
        onScrollToSection: (query: string) => void;
    }
) => {
    return (
        <div className="min-w-[250px] p-5 max-w-sm overflow-y-auto h-screen">
            <ul className="list-none gap-5 flex flex-col ">
                {references.map((item, index) => {
                    const isActive = activeReference === item.content;
                    return (
                        <li
                            key={index} className={`bg-white radius-5 shadow border-2 rounded-sm hover:bg-yellow-300/35 cursor-pointer ${isActive ? 'border-blue-500' : 'border-transparent'} hover:${isActive ? 'border-blue-500' : 'border-yellow-300/25'}`}
                        >
                            <button
                                onClick={() => onScrollToSection(item.content)}
                                className="w-full text-left p-5 text-sm text-zinc-700/95 font-medium"
                            >
                                {item.content}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

export default PdfSidebar;
