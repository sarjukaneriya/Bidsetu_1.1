
const BidCard = ({ _id, bidder, bidAmount, bidTime, winnerBidId, auctionStatus }) => {
  const isWinner = auctionStatus === 'over' && _id === winnerBidId;

  return (
    <div className={`flex sm:gap-10 items-center border mt-2 justify-between md:w-[80%] py-1 px-2 md:px-5 border-theme-bg-light rounded-full ${isWinner ? 'bg-green-900 border-green-400 shadow-lg' : ''}`}>
      <div className="flex gap-4 items-center text-white">
        <img src={bidder?.profilePicture}  alt="bidder profilePicture" className="w-10 h-10 rounded-full" />
        <div className="flex flex-col">
          <span className="font-semibold">{bidder?.fullName}</span>
          <span className="text-xs text-body-text-color">
            {new Date(bidTime).toLocaleDateString()} {""}
            {new Date(bidTime).toLocaleTimeString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white">Bid Amount : ${bidAmount}</span>
        {isWinner && (
          <span className="ml-2 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold">Winner</span>
        )}
      </div>
    </div>
  )
}

export default BidCard