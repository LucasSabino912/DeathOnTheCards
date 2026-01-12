export default function Discard({ topDiscardedCard, counterDiscarded }) {
    return (
        <div className="flex flex-col items-center">
            <div className="top-card">
                {topDiscardedCard ? (
                    <img src={topDiscardedCard} alt="Top Discarded Card" className="w-16 h-24 rounded-lg border-2 border-gray-400" />
                ) : (
                    <img src={'/cards/01-card_back.png'} alt="Top Discarded Card" className="w-16 h-24 rounded-lg border-2 border-gray-400" />
                )}
            </div>
            <div className="mt-2 text-white">
                {counterDiscarded}
            </div>
        </div>
    );
}
