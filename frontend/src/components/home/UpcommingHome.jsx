import { useDispatch, useSelector } from "react-redux";
import SingleAuction from "../SingleAuction";
import { getUpcomingAuctions } from "../../store/auction/auctionSlice";
import { useEffect, useState } from "react";


const UpcommingHome = () => {
  const dispatch = useDispatch();
  const { upComingAuctions, loading, error } = useSelector(
    (state) => state.auction
  );
  const [upComingAuctionsData, setUpComingAuctionsData] = useState([]);

  useEffect(() => {
    dispatch(getUpcomingAuctions());
  }, [dispatch]);

  useEffect(() => {
    setUpComingAuctionsData(upComingAuctions);
  }, [upComingAuctions]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-5">Upcoming</h2>

      {loading && <p className="text-white">Loading auctions...</p>}

      {error && (
        <p className="text-red-500 font-semibold">
          🚫 Failed to load auctions: {error}
        </p>
      )}

      {!loading && !error && upComingAuctionsData.length === 0 && (
        <p className="text-yellow-300">No upcoming auctions found.</p>
      )}

      {!loading && !error && upComingAuctionsData.length > 0 && (
        <swiper-container
          breakpoints={JSON.stringify({
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          })}
          style={{
            "--swiper-navigation-color": "#00A3FF",
          }}
          navigation="true"
          slides-per-view="1"
          space-between="16"
        >
          {upComingAuctionsData.map((item) => (
            <swiper-slide key={item._id}>
              <SingleAuction
                name={item?.name}
                startingPrice={item?.startingPrice}
                image={item?.image}
                endTime={item?.endTime}
                startTime={item?.startTime}
                id={item?._id}
                status={item.status}
                userImage={item?.user?.profilePicture}
                userName={item?.user?.fullName}
                userId={item?.userId}
              />
            </swiper-slide>
          ))}
        </swiper-container>
      )}
    </div>
  );
};


export default UpcommingHome;
