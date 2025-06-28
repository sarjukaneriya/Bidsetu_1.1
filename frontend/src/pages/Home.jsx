import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateEarnHome from "../components/home/CreateEarnHome";
import HeroHome from "../components/home/HeroHome";
// import LiveHome from "../components/home/LiveHome";
import ProcessHome from "../components/home/ProcessHome";
// import UpcommingHome from "../components/home/UpcommingHome";
import { getAllAuctions } from "../store/auction/auctionSlice";
import { getAllCategories } from "../store/category/categorySlice";
import { getAllCities } from "../store/city/citySlice";
import Loading from "../components/Loading";

import { register } from "swiper/element/bundle";
// register Swiper custom elements
register();

const Home = () => {
  const dispatch = useDispatch();
  const { isLoading: auctionLoading } = useSelector((state) => state.auction);
  const { isLoading: categoryLoading } = useSelector((state) => state.category);
  const { isLoading: cityLoading } = useSelector((state) => state.city);

  useEffect(() => {
    dispatch(getAllAuctions());
    dispatch(getAllCategories());
    dispatch(getAllCities());
  }, [dispatch]);

  if (auctionLoading || categoryLoading || cityLoading) {
    return <Loading />;
  }

  return (
    <>
      <HeroHome />
      <div className="px-5 lg:px-12 flex flex-col gap-20">
         {/* <LiveHome /> */}
        {/* <UpcommingHome />          */}
         <ProcessHome />
        <div className="text-white flex flex-col gap-8">
          <CreateEarnHome />
        </div>
      </div>
    </>
  );
};

export default Home;
