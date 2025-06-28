import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAuction, reset } from "../store/auction/auctionSlice";
import { getAllCategories } from "../store/category/categorySlice";
import { getAllCities } from "../store/city/citySlice";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCloudUploadOutline } from "react-icons/io5";

const UploadItem = () => {
  const dispatch = useDispatch();
  const [imgUrl, setImgUrl] = useState("");
  const imgRef = useRef(null);
  const {  isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auction
  );
  const { categories } = useSelector((state) => state.category);
  const { cities, isLoading: citiesLoading } = useSelector((state) => state.city);
  // const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getAllCities());
  }, [dispatch]);

  ////console.log("categoreik   ", categories);

  const [formData, setFormData] = useState({
  name: "",
  category: "",
  startTime: "",
  endTime: "",
  location: "",
  quantity: "",
  budget: "",
  description: "",
  });

  useEffect(() => {
    dispatch(reset());
    ////console.log(isSuccess  , " and ", isError);

    if ( isError) {
      toast.error(message, {
        autoClose: 500,
      });
      dispatch(reset());
    } else if (isSuccess &&  isError===undefined  ) {
      ////console.log(isSuccess  , " and ", isError);
      toast.success(message, {
        autoClose: 500,
      });
      dispatch(reset());
      //clear form data
      setFormData({
        name: "",
        category: "",
        startTime: "",
        endTime: "",
        location: "",
        startingPrice: "",
        description: "",
      });
      setImgUrl("");
    }
    dispatch(reset());
  }, [isSuccess, isError, isLoading]);

  const handleProductUpload = async (e) => {
    e.preventDefault();
    //image data so use new formdata
    const data = new FormData();
    ////console.log(formData);
    data.append("name", formData.name);
    data.append("quantity", formData.quantity);
    data.append("budget", formData.budget);
    data.append("category", formData.category);
    data.append("startTime", formData.startTime);
    data.append("endTime", formData.endTime);
    data.append("location", formData.location);
    data.append("description", formData.description);

    if (imgRef.current.files[0]) {
      if (imgRef.current.files[0].size > 1024 * 1024) {
        return alert("Image size should be less than 1MB");
      } else {
        data.append("image", imgRef.current.files[0]);
      }
    }
    // If no image selected, just continue silently without adding image
    
    ////console.log("before data sentidn", isSuccess);
    dispatch(createAuction(data));

    //dispatch(getAllAuctions());
    dispatch(reset());
  };

  return (
    <div>
      <form
        className="flex flex-col lg:flex-row gap-8 justify-center md:w-[80%] lg:w-[100%] m-auto px-4 py-20"
        onSubmit={handleProductUpload}
      >
        <div className="text-white lg:w-[22%] lg:min-w-[350px] ">
          <h1 className="text-white text-2xl font-bold mb-4">Upload Item</h1>

          {imgUrl ? (
            <img
              src={imgUrl}
              alt="upload img"
              onClick={() => imgRef.current.click()}
              className="w-full h-80 
                    rounded-lg border-2 border-solid p-2 object-contain cursor-pointer
                    "
            />
          ) : (
            <div
              onClick={() => imgRef.current.click()}
              className="w-full h-80
              rounded-xl border-2 border-dashed border-border-info-color 
                    flex items-center justify-center
                    cursor-pointer
                    "
            >
              <div className="text-center flex flex-col items-center gap-2">
                <IoCloudUploadOutline size={68} className="text-theme-color" />
                <p>Click to Upload</p>
                <span className="text-body-text-color">
                  PNG,JPG,JPEG | Max Size 1MB
                </span>
              </div>
            </div>
          )}

          <input
            type="file"
            className="hidden"
            onChange={(e) => setImgUrl(URL.createObjectURL(e.target.files[0]))}
            ref={imgRef}
            accept=".png, .jpg, .jpeg"
          />
        </div>
        {/* INPUTS */}
        <div className="flex flex-col gap-4 lg:w-[50%] inputs:outline-none p-8 inputs:px-4 inputs:py-3 inputs:rounded-xl select:px-4 select:py-3 select:rounded-xl select:cursor-pointer border border-border-info-color inputs:bg-theme-bg inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color text-slate-300 rounded-2xl [&_label]:mb-2 [&_label]:text-body-text-color [&_*]:transition-all">
          <div className="grid">
            <label htmlFor="product_name">Product Name</label>
            <input
              required
              id="product_name"
              placeholder="e.g (Modern Abstract Painting)"
              type="text"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              value={formData.name}
            />{" "}
          </div>

          <div className="grid">
            <label htmlFor="category">Category</label>
            <select
              className="outline-none h-[50px] bg-theme-bg rounded-xl px-3 py-4 cursor-pointer focus:border-theme-color"
              required
              id="category"
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              value={formData.category} // Set the value attribute to formData.category
            >
              <option value="">Select Category</option>
              {categories.data &&
                categories.data.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid  lg:grid-cols-2 gap-4 mlg:grid-cols-1">
            <div className="grid">
              <label htmlFor="start_time">Start Time</label>
              <input
                required
                id="startTime"
                type="datetime-local"
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                value={formData.startTime}
              />
            </div>
            <div className="grid">
              <label htmlFor="end_time">End Time</label>
              <input
                required
                id="endTime"
                type="datetime-local"
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                value={formData.endTime}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mlg:grid-cols-1">
            <div className="grid">

              <label htmlFor="quantity">Quantity</label>
              <input
                required
                id="quantity"
                type="number"
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                value={formData.quantity}
              />


              <label htmlFor="budget">Budget</label>

              <input
                required
                id="budget"
                type="number"
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                value={formData.budget}
              />
            </div>
            <div className="grid ">
              <label htmlFor="category">Area</label>
              <select
                className="outline-none h-[50px] bg-theme-bg cursor-pointer focus:border-theme-color"
                required
                id="category"
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                value={formData.location}
              >
                <option value="">Select Area</option>
                {citiesLoading ? (
                  <option value="" disabled>Loading areas...</option>
                ) : cities?.data ? (
                  cities.data.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No areas available</option>
                )}
              </select>
            </div>
          </div>
          <div className="grid">
            <label htmlFor="description">Description</label>
            <textarea
              placeholder="Describe your product, art, etc."
              required
              id="description"
              rows="7"
              className="outline-none bg-theme-bg rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              value={formData.description}
            />
          </div>
          <button
            type="submit"
            className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger"
          >
            Upload
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadItem;
