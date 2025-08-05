import { Link } from "react-router-dom";
import CountDownTimer from "../components/CountDownTimer";
import { useState } from "react";
import socket from "../socket";
// eslint-disable-next-line react/prop-types
const SingleAuction = ({
  name,
  budget,
  image,
  endTime,
  startTime,
  id,
  status,
  userImage,
  userName,
  bids,
  winner,
  lowestBidAmount,
}) => {
  const [statusData, setStatusData] = useState(status);

  socket.on("setStatus", async () => {
    await setStatusData("over");
    ////console.log("handlewinner func in dashboard.,,,,,,,,,,");
  });

  // Get current lowest bid amount
  const getCurrentLowestBid = () => {
    if (bids && bids.length > 0) {
      const lowestBid = bids.reduce((lowest, bid) => {
        return bid.bidAmount < lowest.bidAmount ? bid : lowest;
      });
      return lowestBid.bidAmount;
    }
    return budget; // Return budget if no bids
  };

  // Check if auction has a winner
  const hasWinner = winner || (statusData === "over" && bids && bids.length > 0);

  // Get winner information
  const getWinnerInfo = () => {
    if (winner?.bidder?.fullName) {
      return {
        name: winner.bidder.fullName,
        amount: lowestBidAmount || winner.bidAmount,
        profilePicture: winner.bidder.profilePicture
      };
    }
    return null;
  };

  const winnerInfo = getWinnerInfo();

  return (
    <div className=" h-full justify-between bg-theme-bg rounded-lg flex flex-col p-3  text-white  ">
      <div>
        <div className="w-full rounded-md relative bg-white overflow-hidden ">
          <img
            className="w-full sm:h-[300px]   rounded-md object-contain hover:scale-105 transition-all duration-300  "
            src={image}
            alt="item image"
          />
          <div className="absolute bottom-3 right-3 border-[0.5px] border-color-primary border-solid rounded-full py-1 px-3 text-sm bg-gray-950 bg-opacity-[0.8] ">
            <CountDownTimer
              startTime={startTime}
              endTime={endTime}
              status={status}
              id={id}
            />
          </div>
        </div>
        <h3 className="my-3 text-[19px] font-Barlow ">{name}</h3>
      </div>
      <div>
        <div className="flex justify-start items-center">
          <div>
            <img
              src={userImage}
              className="w-9 h-9 rounded-full"
              alt="user image"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm">{userName}</h3>
          </div>
        </div>
        
        {/* Show winner or current bid */}
        {hasWinner ? (
          <div className="flex justify-between item-center my-2 border-t border-border-info-color pt-3">
            <div className="flex flex-col">
              <p className="text-[12px] text-body-text-color">Winning Bid</p>
              <p className="mt-2 text-theme-color font-bold">
                ${lowestBidAmount || getCurrentLowestBid()}
              </p>
              {winnerInfo && (
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={winnerInfo.profilePicture}
                    alt="winner"
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-xs text-body-text-color">
                    {winnerInfo.name}
                  </span>
                </div>
              )}
            </div>
            <Link
              to={`/single-auction-detail/${id}`}
              className=" bg-theme-color hover:bg-color-danger text-white text-sm font-bold  rounded-md my-auto  py-2 px-4  text-center no-underline mt-3"
            >
              View Details
            </Link>
          </div>
        ) : (
          <div className="flex justify-between item-center my-2 border-t border-border-info-color pt-3">
            <div className="flex flex-col">
              <p className="text-[12px] text-body-text-color">
                {bids && bids.length > 0 ? "Current Lowest Bid" : "Starting Price"}
              </p>
              <p className="mt-2 text-theme-color font-bold">
                ${getCurrentLowestBid()}
              </p>
            </div>
            <Link
              to={`/single-auction-detail/${id}`}
              className=" bg-theme-color hover:bg-color-danger text-white text-sm font-bold  rounded-md my-auto  py-2 px-4  text-center no-underline mt-3"
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleAuction;
